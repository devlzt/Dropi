import { corsHeaders } from "../_shared/cors.ts";
import { authenticatedUserId, serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { charge_id } = await req.json();
    if (!charge_id) return Response.json({ error: "charge_id is required" }, { status: 400, headers: corsHeaders });

    const userId = await authenticatedUserId(req);
    const supabase = serviceClient();
    const { data: charge, error } = await supabase
      .from("charges")
      .select("*, clients(*), organizations!inner(owner_id)")
      .eq("id", charge_id)
      .eq("organizations.owner_id", userId)
      .single();
    if (error) throw error;

    const asaasKey = Deno.env.get("ASAAS_API_KEY");
    if (asaasKey) {
      // Integração futura: criar cobrança Pix real na Asaas/Efí e persistir payment_link, pix_copy_paste e pix_qr_code_url.
      return Response.json({ mode: "pending_provider_integration", message: "ASAAS_API_KEY configurada. Conecte o endpoint do provedor aqui." }, { headers: corsHeaders });
    }

    const devPix = `DROPIDEV-${charge.id}-${Date.now()}`;
    const { error: updateError } = await supabase
      .from("charges")
      .update({
        pix_copy_paste: devPix,
        payment_link: `https://demo.dropi.local/pix/${charge.id}`,
      })
      .eq("id", charge.id);
    if (updateError) throw updateError;

    await supabase.from("charge_events").insert({
      organization_id: charge.organization_id,
      charge_id: charge.id,
      client_id: charge.client_id,
      type: "pix_created",
      message: "Pix de demonstração criado. Não representa pagamento real.",
    });

    return Response.json({ mode: "demo", warning: "Modo demonstração. Não é pagamento real.", pix_copy_paste: devPix }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500, headers: corsHeaders });
  }
});
