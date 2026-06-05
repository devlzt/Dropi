import { BotMessageSquare, Copy, ExternalLink, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createChargeEvent } from "@/hooks/use-charge-events";
import { useCharges } from "@/hooks/use-charges";
import { useOrganization } from "@/hooks/use-organization";
import { buildLocalChargeMessage, messageTones } from "@/lib/messages";
import { formatCurrency, formatDate, whatsappUrl } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/providers/toast-provider";
import type { MessageTone } from "@/types/database";

export function MessagesPage() {
  const { charges, isLoading } = useCharges();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [chargeId, setChargeId] = useState("");
  const [tone, setTone] = useState<MessageTone>("educado");
  const [message, setMessage] = useState("");
  const [generating, setGenerating] = useState(false);

  const selected = useMemo(() => charges.find((charge) => charge.id === chargeId), [charges, chargeId]);

  async function generate() {
    if (!selected) return;
    setGenerating(true);
    try {
      let generated = "";
      const { data, error } = await supabase.functions.invoke<{ message: string }>("generate-charge-message", {
        body: { charge_id: selected.id, tone },
      });
      if (!error && data?.message) {
        generated = data.message;
      } else {
        generated = buildLocalChargeMessage(selected, organization, tone);
        await createChargeEvent({ organization_id: selected.organization_id, charge_id: selected.id, client_id: selected.client_id, type: "message_generated", message: generated });
      }
      setMessage(generated);
      toast({ type: "success", title: "Mensagem gerada" });
    } catch {
      const fallback = buildLocalChargeMessage(selected, organization, tone);
      setMessage(fallback);
      await createChargeEvent({ organization_id: selected.organization_id, charge_id: selected.id, client_id: selected.client_id, type: "message_generated", message: fallback });
      toast({ type: "info", title: "Mensagem gerada com template local", description: "A funcao de IA nao respondeu, entao o Dropi usou o fallback seguro." });
    } finally {
      setGenerating(false);
    }
  }

  async function copy() {
    if (!selected || !message) return;
    await navigator.clipboard.writeText(message);
    await createChargeEvent({ organization_id: selected.organization_id, charge_id: selected.id, client_id: selected.client_id, type: "message_copied", message });
    toast({ type: "success", title: "Mensagem copiada" });
  }

  async function openWhatsApp() {
    if (!selected || !message) return;
    await createChargeEvent({ organization_id: selected.organization_id, charge_id: selected.id, client_id: selected.client_id, type: "whatsapp_opened", message });
    window.open(whatsappUrl(selected.clients?.phone ?? "", message), "_blank", "noopener,noreferrer");
  }

  if (isLoading) return <LoadingState label="Carregando cobrancas" />;

  return (
    <div className="space-y-4">
      {charges.length === 0 ? (
        <EmptyState icon={BotMessageSquare} title="Crie uma cobranca para gerar mensagens inteligentes." description="O Dropi usa dados reais do cliente, valor, vencimento e Pix para montar a mensagem." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardHeader>
              <h2 className="app-section-title">Gerador</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cobranca</Label>
                <Select value={chargeId} onChange={(event) => setChargeId(event.target.value)}>
                  <option value="">Selecione uma cobranca</option>
                  {charges.map((charge) => (
                    <option key={charge.id} value={charge.id}>
                      {charge.clients?.name} - {formatCurrency(charge.amount)} - {formatDate(charge.due_date)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tom</Label>
                <Select value={tone} onChange={(event) => setTone(event.target.value as MessageTone)}>
                  {messageTones.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </Select>
              </div>
              <Button className="w-full" onClick={generate} disabled={!selected || generating}>
                <WandSparkles className="h-4 w-4" />
                Gerar mensagem
              </Button>
              <div className="rounded-xl border border-slate-200 bg-[#F7F8FA] p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-black dark:text-slate-400">
                Sem chave de IA configurada, o Dropi usa templates locais e continua funcionando.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="app-section-title">Mensagem pronta</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea className="min-h-72 text-base leading-7" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="A mensagem gerada aparecera aqui." />
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={copy} disabled={!message}><Copy className="h-4 w-4" />Copiar</Button>
                <Button onClick={openWhatsApp} disabled={!message}><ExternalLink className="h-4 w-4" />Abrir WhatsApp</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
