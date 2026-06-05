import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { createChargeEvent } from "@/hooks/use-charge-events";
import { useOrganization } from "@/hooks/use-organization";
import type { Charge, ChargeWithClient } from "@/types/database";

export function useCharges() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const key = ["charges", organization?.id];

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(organization?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("charges")
        .select("*, clients(*)")
        .eq("organization_id", organization!.id)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as ChargeWithClient[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: key });
    queryClient.invalidateQueries({ queryKey: ["charge-events"] });
  };

  const create = useMutation({
    mutationFn: async (payload: Omit<Charge, "id" | "created_at" | "updated_at" | "organization_id" | "paid_at" | "pix_qr_code_url">) => {
      const { data, error } = await supabase
        .from("charges")
        .insert({ ...payload, organization_id: organization!.id })
        .select("*, clients(*)")
        .single();
      if (error) throw error;
      return data as ChargeWithClient;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Charge> }) => {
      const { data, error } = await supabase.from("charges").update(payload).eq("id", id).select("*, clients(*)").single();
      if (error) throw error;
      return data as ChargeWithClient;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("charges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const markPaid = useMutation({
    mutationFn: async (charge: ChargeWithClient) => {
      const paidAt = new Date().toISOString();
      const { data, error } = await supabase
        .from("charges")
        .update({ status: "paid", paid_at: paidAt })
        .eq("id", charge.id)
        .select("*, clients(*)")
        .single();
      if (error) throw error;
      await createChargeEvent({
        organization_id: charge.organization_id,
        charge_id: charge.id,
        client_id: charge.client_id,
        type: "payment_registered",
        message: `Pagamento registrado manualmente em ${new Date(paidAt).toLocaleString("pt-BR")}.`,
      });
      return data as ChargeWithClient;
    },
    onSuccess: invalidate,
  });

  return {
    charges: query.data ?? [],
    isLoading: query.isLoading,
    createCharge: create.mutateAsync,
    updateCharge: update.mutateAsync,
    deleteCharge: remove.mutateAsync,
    markChargePaid: markPaid.mutateAsync,
    isMutating: create.isPending || update.isPending || remove.isPending || markPaid.isPending,
  };
}
