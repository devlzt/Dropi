import { corsHeaders } from "../_shared/cors.ts";
import { authenticatedUserId, serviceClient, serviceRoleKey as readServiceRoleKey } from "../_shared/supabase.ts";

type ChargePayload = {
  id: string;
  organization_id: string;
  client_id: string;
  amount: number;
  due_date: string;
  payment_link: string | null;
  clients: {
    name: string;
    phone: string;
  } | null;
  organizations: {
    owner_id: string;
  } | null;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) throw new Error("Client phone is empty");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function renderTemplate(template: string, charge: ChargePayload) {
  return template
    .replaceAll("{{name}}", charge.clients?.name ?? "cliente")
    .replaceAll("{{amount}}", formatMoney(Number(charge.amount)))
    .replaceAll("{{due_date}}", formatDate(charge.due_date))
    .replaceAll("{{pix_link}}", "[PIX_LINK]");
}

async function insertEvent(
  supabase: ReturnType<typeof serviceClient>,
  charge: ChargePayload,
  type: "whatsapp_sent" | "whatsapp_failed",
  message: string,
) {
  // TODO: add columns charge_events.event_type and charge_events.metadata.
  // Current schema stores event kind in "type" and metadata-compatible data in "message".
  const { data, error } = await supabase
    .from("charge_events")
    .insert({
      organization_id: charge.organization_id,
      charge_id: charge.id,
      client_id: charge.client_id,
      type,
      message,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  const supabase = serviceClient();
  let charge: ChargePayload | null = null;

  try {
    const { charge_id } = await req.json();
    if (!charge_id) return Response.json({ error: "charge_id is required" }, { status: 400, headers: corsHeaders });

    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const serviceRoleKey = readServiceRoleKey();
    const isServiceCall = Boolean(serviceRoleKey && token === serviceRoleKey);
    const userId = isServiceCall ? null : await authenticatedUserId(req);

    const query = supabase
      .from("charges")
      .select("id, organization_id, client_id, amount, due_date, payment_link, clients(name, phone), organizations!inner(owner_id)")
      .eq("id", charge_id);

    if (userId) query.eq("organizations.owner_id", userId);

    const { data, error } = await query.single();
    if (error) throw error;
    charge = data as ChargePayload;
    if (!charge.clients?.phone) throw new Error("Charge has no client phone");

    // TODO: add columns message_templates.type and message_templates.active.
    // Current schema has name/tone/content only, so we use the first organization template matching charge-like names.
    const { data: template } = await supabase
      .from("message_templates")
      .select("content")
      .eq("organization_id", charge.organization_id)
      .or("name.ilike.%charge%,name.ilike.%cobranca%,name.ilike.%cobrança%")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const fallbackTemplate = "Olá, {{name}}. Sua cobrança de {{amount}} vence/vencia em {{due_date}}. Segue o link Pix: {{pix_link}}";
    const renderedMessage = renderTemplate(template?.content ?? fallbackTemplate, charge);

    const evolutionUrl = Deno.env.get("EVOLUTION_API_URL");
    const evolutionKey = Deno.env.get("EVOLUTION_API_KEY");
    const instance = Deno.env.get("EVOLUTION_INSTANCE");
    if (!evolutionUrl || !evolutionKey || !instance) throw new Error("Evolution API env vars are missing");

    const response = await fetch(`${evolutionUrl.replace(/\/$/, "")}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: evolutionKey,
      },
      body: JSON.stringify({
        number: normalizePhone(charge.clients.phone),
        text: renderedMessage,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Evolution API failed with status ${response.status}`);
    }

    const eventId = await insertEvent(
      supabase,
      charge,
      "whatsapp_sent",
      JSON.stringify({ message_preview: renderedMessage.slice(0, 80) }),
    );

    return Response.json({ success: true, event_id: eventId }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    let eventId = "";
    if (charge) {
      try {
        eventId = await insertEvent(supabase, charge, "whatsapp_failed", JSON.stringify({ error: message }));
      } catch {
        // Ignore secondary logging failure so the original error can be returned.
      }
    }
    return Response.json({ success: false, event_id: eventId, error: message }, { status: 500, headers: corsHeaders });
  }
});
