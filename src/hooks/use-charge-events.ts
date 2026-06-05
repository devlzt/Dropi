import { supabase } from "@/lib/supabase";
import type { ChargeEventType } from "@/types/database";

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
