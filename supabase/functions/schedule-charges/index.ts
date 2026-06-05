import { corsHeaders } from "../_shared/cors.ts";
import { serviceClient, serviceRoleKey as readServiceRoleKey } from "../_shared/supabase.ts";

type ChargeRow = {
  id: string;
  due_date: string;
  status: "pending" | "overdue";
};

function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  try {
    const supabase = serviceClient();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = readServiceRoleKey();
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase service env vars are missing");

    const today = isoDate();
    const dMinusThree = isoDate(3);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const todayStart = `${today}T00:00:00.000Z`;

    const { data: charges, error: chargesError } = await supabase
      .from("charges")
      .select("id, due_date, status")
      .in("status", ["pending", "overdue"]);
    if (chargesError) throw chargesError;

    const chargeIds = (charges ?? []).map((charge) => charge.id);
    if (chargeIds.length === 0) return Response.json({ sent: 0, failed: 0, skipped: 0 }, { headers: corsHeaders });

    const { data: recentSent, error: sentError } = await supabase
      .from("charge_events")
      .select("charge_id, created_at")
      .eq("type", "whatsapp_sent")
      .in("charge_id", chargeIds)
      .gte("created_at", threeDaysAgo);
    if (sentError) throw sentError;

    const { data: sentToday, error: todayError } = await supabase
      .from("charge_events")
      .select("charge_id, created_at")
      .eq("type", "whatsapp_sent")
      .in("charge_id", chargeIds)
      .gte("created_at", todayStart);
    if (todayError) throw todayError;

    const recentSet = new Set((recentSent ?? []).map((event) => event.charge_id));
    const todaySet = new Set((sentToday ?? []).map((event) => event.charge_id));

    const qualifying = (charges as ChargeRow[]).filter((charge) => {
      const regularReminder = ["pending", "overdue"].includes(charge.status) && !recentSet.has(charge.id);
      const dMinusThreeReminder = charge.due_date === dMinusThree && !todaySet.has(charge.id);
      return regularReminder || dMinusThreeReminder;
    });

    let sent = 0;
    let failed = 0;

    for (const charge of qualifying) {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/functions/v1/send-whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ charge_id: charge.id }),
      });

      if (response.ok) sent += 1;
      else failed += 1;
    }

    return Response.json({ sent, failed, skipped: chargeIds.length - qualifying.length }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500, headers: corsHeaders });
  }
});
