import { corsHeaders } from "../_shared/cors.ts";
import { authenticatedUserId, serviceClient } from "../_shared/supabase.ts";

type Tone = "educado" | "amigavel" | "firme" | "ultima_tentativa";

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function localMessage(charge: any, tone: Tone) {
  const firstName = charge.clients?.name?.split(" ")[0] || "tudo bem";
  const company = charge.organizations?.name || "nossa empresa";
  const pix = charge.payment_link ? `\n\nLink para pagamento: ${charge.payment_link}` : charge.pix_copy_paste ? `\n\nPix copia e cola: ${charge.pix_copy_paste}` : "";
  if (tone === "firme") return `Olá, ${firstName}. A cobrança "${charge.description}" de ${money(charge.amount)}, vencimento em ${charge.due_date}, ainda está em aberto. Pedimos a regularização o quanto antes.${pix}`;
  if (tone === "ultima_tentativa") return `${firstName}, esta é nossa última tentativa amigável sobre a cobrança "${charge.description}" de ${money(charge.amount)}. Precisamos de um retorno hoje para manter o acordo em aberto.${pix}`;
  if (tone === "amigavel") return `Oi, ${firstName}! Aqui é da ${company}. Passando para lembrar da cobrança "${charge.description}" no valor de ${money(charge.amount)}. Quando puder, me confirme por aqui.${pix}`;
  return `Olá, ${firstName}. Aqui é da ${company}. Sua cobrança "${charge.description}" no valor de ${money(charge.amount)} vence/vencia em ${charge.due_date}. Seguem os dados para pagamento.${pix}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { charge_id, tone = "educado" } = await req.json();
    if (!charge_id) return Response.json({ error: "charge_id is required" }, { status: 400, headers: corsHeaders });

    const userId = await authenticatedUserId(req);
    const supabase = serviceClient();
    const { data: charge, error } = await supabase
      .from("charges")
      .select("*, clients(*), organizations!inner(*)")
      .eq("id", charge_id)
      .eq("organizations.owner_id", userId)
      .single();
    if (error) throw error;

    let message = localMessage(charge, tone);

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (openaiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: "Escreva uma mensagem curta de cobrança em português do Brasil, profissional, humana e sem juridiquês." },
            { role: "user", content: JSON.stringify({ charge, tone }) },
          ],
          temperature: 0.4,
        }),
      });
      if (response.ok) {
        const json = await response.json();
        message = json.choices?.[0]?.message?.content || message;
      }
    }

    await supabase.from("charge_events").insert({
      organization_id: charge.organization_id,
      charge_id: charge.id,
      client_id: charge.client_id,
      type: "message_generated",
      message,
    });

    return Response.json({ message, mode: openaiKey ? "ai" : "template" }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500, headers: corsHeaders });
  }
});
