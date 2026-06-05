import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ChargeEvent, ChargeEventType } from "@/types/database";

export async function createChargeEvent(input: {
  organization_id: string;
  charge_id: string;
  client_id: string;
  type: ChargeEventType;
  message?: string;
}) {
  const { error } = await supabase.from("charge_events").insert({
    organization_id: input.organization_id,
    charge_id: input.charge_id,
    client_id: input.client_id,
    type: input.type,
    message: input.message ?? null,
  });
  if (error) throw error;
}

export function useChargeEvents(chargeIds: string[]) {
  const sortedIds = [...new Set(chargeIds)].sort();

  return useQuery({
    queryKey: ["charge-events", sortedIds],
    enabled: sortedIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("charge_events")
        .select("*")
        .in("charge_id", sortedIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ChargeEvent[];
    },
  });
}
