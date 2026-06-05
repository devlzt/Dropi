import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import type { Organization } from "@/types/database";

export async function ensureUserOrganization(userId: string) {
  const { data: existing, error: selectError } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("organizations")
    .insert({ owner_id: userId, name: "Minha empresa" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export function useOrganization() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["organization", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) throw new Error("Usuario nao autenticado");
      return ensureUserOrganization(user.id);
    },
  });

  const update = useMutation({
    mutationFn: async (payload: Partial<Pick<Organization, "name" | "whatsapp" | "pix_key" | "responsible_name">>) => {
      if (!query.data?.id) throw new Error("Organização não encontrada");
      const { data, error } = await supabase.from("organizations").update(payload).eq("id", query.data.id).select("*").single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["organization", user?.id], data);
    },
  });

  return {
    organization: query.data,
    isLoading: query.isLoading,
    updateOrganization: update.mutateAsync,
    isUpdating: update.isPending,
  };
}
