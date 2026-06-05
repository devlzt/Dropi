import { corsHeaders } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  try {
    const payload = await req.json();
    const event = payload.event || payload.type;
    const chargeId = payload.charge_id || payload.externalReference || payload.payment?.externalReference;

    if (!event || !chargeId) {
      return Response.json({ error: "Invalid webhook payload" }, { status: 400, headers: corsHeaders });
    }

    const paidEvents = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED", "payment.confirmed"];
    if (!paidEvents.includes(event)) {
      return Response.json({ ok: true, ignored: true }, { headers: corsHeaders });
    }

    const supabase = serviceClient();
    const { data: charge, error } = await supabase.from("charges").select("*").eq("id", chargeId).single();
    if (error) throw error;

    const paidAt = new Date().toISOString();
    const { error: updateError } = await supabase.from("charges").update({ status: "paid", paid_at: paidAt }).eq("id", charge.id);
    if (updateError) throw updateError;

    await supabase.from("charge_events").insert({
      organization_id: charge.organization_id,
      charge_id: charge.id,
      client_id: charge.client_id,
      type: "webhook_payment_confirmed",
      message: "Pagamento confirmado via webhook de provedor.",
    });

    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500, headers: corsHeaders });
  }
});
