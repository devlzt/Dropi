import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { ensureUserOrganization, useOrganization } from "@/hooks/use-organization";
import type { Client } from "@/types/database";

export function useClients() {
  const { user } = useAuth();
  const { organization, isLoading: isOrganizationLoading } = useOrganization();
  const queryClient = useQueryClient();
  const key = ["clients", organization?.id];

  const query = useQuery({
    queryKey: key,
    enabled: Boolean(organization?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("organization_id", organization!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getOrganizationId = async () => {
    if (organization?.id) return organization.id;
    if (!user?.id) throw new Error("Usuario nao autenticado");

    const ensuredOrganization = await ensureUserOrganization(user.id);
    queryClient.setQueryData(["organization", user.id], ensuredOrganization);

    return ensuredOrganization.id;
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["organization"] });
    queryClient.invalidateQueries({ queryKey: ["clients"] });
  };

  const create = useMutation({
    mutationFn: async (payload: Omit<Client, "id" | "created_at" | "updated_at" | "organization_id">) => {
      const organizationId = await getOrganizationId();

      const { data, error } = await supabase
        .from("clients")
        .insert({ ...payload, organization_id: organizationId })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Client> }) => {
      const { data, error } = await supabase.from("clients").update(payload).eq("id", id).select("*").single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    clients: query.data ?? [],
    isLoading: isOrganizationLoading || query.isLoading,
    isOrganizationReady: Boolean(organization?.id),
    createClient: create.mutateAsync,
    updateClient: update.mutateAsync,
    deleteClient: remove.mutateAsync,
    isMutating: create.isPending || update.isPending || remove.isPending,
  };
}
