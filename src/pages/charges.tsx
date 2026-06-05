import { CheckCircle2, Clock3, Copy, Edit3, ExternalLink, FilePlus2, Loader2, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ChargeStatusBadge } from "@/components/charge-status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { ChargeForm, type ChargeFormData } from "@/components/forms/charge-form";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { createChargeEvent, useChargeEvents } from "@/hooks/use-charge-events";
import { useCharges } from "@/hooks/use-charges";
import { useClients } from "@/hooks/use-clients";
import { useOrganization } from "@/hooks/use-organization";
import { buildLocalChargeMessage } from "@/lib/messages";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, getRealChargeStatus, whatsappUrl } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import type { ChargeEvent, ChargeStatus, ChargeWithClient } from "@/types/database";

const filterLabels: Record<ChargeStatus | "all", string> = {
  all: "Todas",
  pending: "Pendentes",
  paid: "Pagas",
  overdue: "Vencidas",
  canceled: "Canceladas",
};

export function ChargesPage() {
  const [filter, setFilter] = useState<ChargeStatus | "all">("all");
  const [editing, setEditing] = useState<ChargeWithClient | null>(null);
  const [details, setDetails] = useState<ChargeWithClient | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<ChargeWithClient | null>(null);
  const [sendingChargeId, setSendingChargeId] = useState<string | null>(null);
  const { clients } = useClients();
  const { organization } = useOrganization();
  const { charges, isLoading, createCharge, updateCharge, deleteCharge, markChargePaid, isMutating } = useCharges();
  const eventQuery = useChargeEvents(charges.map((charge) => charge.id));
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return charges.filter((charge) => filter === "all" || getRealChargeStatus(charge) === filter);
  }, [charges, filter]);

  async function submit(data: ChargeFormData) {
    try {
      const payload = {
        ...data,
        payment_link: data.payment_link || null,
        pix_copy_paste: data.pix_copy_paste || null,
        notes: data.notes || null,
      };
      if (editing) await updateCharge({ id: editing.id, payload });
      else await createCharge(payload);
      toast({ type: "success", title: "Cobranca salva" });
      setDialogOpen(false);
      setEditing(null);
    } catch (error) {
      toast({ type: "error", title: "Erro ao salvar cobranca", description: error instanceof Error ? error.message : undefined });
    }
  }

  async function copyMessage(charge: ChargeWithClient) {
    const message = buildLocalChargeMessage(charge, organization, "educado");
    await navigator.clipboard.writeText(message);
    await createChargeEvent({ organization_id: charge.organization_id, charge_id: charge.id, client_id: charge.client_id, type: "message_copied", message });
    toast({ type: "success", title: "Mensagem copiada" });
  }

  async function openWhatsApp(charge: ChargeWithClient) {
    const message = buildLocalChargeMessage(charge, organization, "educado");
    await createChargeEvent({ organization_id: charge.organization_id, charge_id: charge.id, client_id: charge.client_id, type: "whatsapp_opened", message });
    window.open(whatsappUrl(charge.clients?.phone ?? "", message), "_blank", "noopener,noreferrer");
  }

  async function chargeNow(charge: ChargeWithClient) {
    setSendingChargeId(charge.id);
    try {
      const { data, error } = await supabase.functions.invoke<{ success: boolean; event_id: string; error?: string }>("send-whatsapp", {
        body: { charge_id: charge.id },
      });
      if (error || !data?.success) throw new Error(error?.message ?? data?.error ?? "send-whatsapp failed");

      await eventQuery.refetch();
      toast({ type: "success", title: `WhatsApp enviado para ${charge.clients?.name ?? "cliente"} ✓` });
    } catch {
      toast({ type: "error", title: "Falha ao enviar. Tente novamente." });
    } finally {
      setSendingChargeId(null);
    }
  }

  function eventsFor(chargeId: string) {
    return (eventQuery.data ?? []).filter((event) => event.charge_id === chargeId);
  }

  function lastSentAt(chargeId: string) {
    return eventsFor(chargeId).find((event) => event.type === "whatsapp_sent")?.created_at;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          Nova cobranca
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(filterLabels) as Array<ChargeStatus | "all">).map((status) => (
              <button
                key={status}
                className={`h-9 rounded-lg px-3 text-sm font-medium transition ${filter === status ? "bg-primary text-primary-foreground" : "border border-slate-200 bg-white text-slate-950 hover:bg-slate-50 dark:border-white/10 dark:bg-black dark:text-white dark:hover:bg-primary/10"}`}
                onClick={() => setFilter(status)}
              >
                {filterLabels[status]}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-48">
            <Select value={filter} onChange={(event) => setFilter(event.target.value as ChargeStatus | "all")}>
              {Object.entries(filterLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </div>
        </div>

        {isLoading ? <LoadingState /> : charges.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={FilePlus2} title="Crie sua primeira cobranca e envie um lembrete pelo WhatsApp em poucos cliques." description="Escolha um cliente, informe valor e vencimento. O Dropi organiza o restante." actionLabel="Nova cobranca" onAction={() => setDialogOpen(true)} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#F7F8FA] text-xs uppercase text-slate-500 dark:bg-black dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Cobranca</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Valor</th>
                  <th className="px-5 py-3">Vencimento</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Ultimo envio</th>
                  <th className="px-5 py-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {filtered.map((charge) => (
                  <tr key={charge.id} className="bg-white hover:bg-[#FAFBFC] dark:bg-[#070B07] dark:hover:bg-primary/5">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-950 dark:text-white">{charge.description}</div>
                      {charge.payment_link || charge.pix_copy_paste ? <div className="mt-1"><Badge tone="green">Pix pronto</Badge></div> : null}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{charge.clients?.name ?? "Cliente removido"}</td>
                    <td className="px-5 py-4 font-medium text-slate-950 dark:text-white">{formatCurrency(charge.amount)}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(charge.due_date)}</td>
                    <td className="px-5 py-4"><ChargeStatusBadge charge={charge} /></td>
                    <td className="px-5 py-4 text-slate-600">{lastSentAt(charge.id) ? new Date(lastSentAt(charge.id)!).toLocaleString("pt-BR") : "-"}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {["pending", "overdue"].includes(getRealChargeStatus(charge)) ? (
                          <Button variant="outline" size="sm" onClick={() => chargeNow(charge)} disabled={sendingChargeId === charge.id} title="Cobrar agora">
                            {sendingChargeId === charge.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                            Cobrar agora
                          </Button>
                        ) : null}
                        <Button variant="outline" size="icon" onClick={() => setDetails(charge)} title="Historico"><Clock3 className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" onClick={() => copyMessage(charge)} title="Copiar mensagem"><Copy className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" onClick={() => openWhatsApp(charge)} title="Abrir WhatsApp"><ExternalLink className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" onClick={() => markChargePaid(charge)} disabled={getRealChargeStatus(charge) === "paid"} title="Marcar como paga"><CheckCircle2 className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" onClick={() => { setEditing(charge); setDialogOpen(true); }} title="Editar"><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="danger" size="icon" onClick={() => setDeleting(charge)} title="Excluir"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} title={editing ? "Editar cobranca" : "Nova cobranca"} description={clients.length === 0 ? "Cadastre um cliente antes de criar cobrancas." : undefined} onClose={() => setDialogOpen(false)}>
        <ChargeForm charge={editing} clients={clients} loading={isMutating} onCancel={() => setDialogOpen(false)} onSubmit={submit} />
      </Dialog>

      <Dialog open={Boolean(details)} title="Historico da cobranca" onClose={() => setDetails(null)}>
        {details ? <ChargeHistory charge={details} events={eventsFor(details.id)} /> : null}
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir cobranca"
        description="Essa acao remove a cobranca e pode impactar relatorios. Use cancelar quando quiser apenas tirar a cobranca do fluxo."
        confirmLabel="Excluir"
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteCharge(deleting.id);
            toast({ type: "success", title: "Cobranca excluida" });
            setDeleting(null);
          } catch (error) {
            toast({ type: "error", title: "Nao foi possivel excluir", description: error instanceof Error ? error.message : undefined });
          }
        }}
      />
    </div>
  );
}

function ChargeHistory({ charge, events }: { charge: ChargeWithClient; events: ChargeEvent[] }) {
  return (
    <div className="space-y-5 p-5">
      <div className="rounded-xl border border-slate-200 bg-[#F7F8FA] p-4 dark:border-white/10 dark:bg-black">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cobranca</p>
        <p className="mt-1 font-semibold text-slate-950 dark:text-white">{charge.description}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {charge.clients?.name ?? "Cliente removido"} - {formatCurrency(charge.amount)}
        </p>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Historico</h3>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Nenhum evento registrado ainda.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {events.map((event) => (
              <TimelineItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TimelineItem({ event }: { event: ChargeEvent }) {
  const metadata = parseEventMessage(event.message);
  const sent = event.type === "whatsapp_sent";
  const failed = event.type === "whatsapp_failed";
  const dot = sent ? "bg-primary" : failed ? "bg-overdue" : "bg-slate-300 dark:bg-slate-600";
  const title = sent ? "WhatsApp enviado" : failed ? "Falha no envio" : event.type;
  const detail = sent ? metadata.message_preview : failed ? metadata.error : event.message;

  return (
    <div className="flex gap-3">
      <div className="pt-1">
        <span className={`block h-3 w-3 rounded-full ${dot}`} />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
          <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(event.created_at).toLocaleString("pt-BR")}</span>
        </div>
        {detail ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{detail}</p> : null}
      </div>
    </div>
  );
}

function parseEventMessage(message: string | null) {
  if (!message) return {} as { message_preview?: string; error?: string };
  try {
    return JSON.parse(message) as { message_preview?: string; error?: string };
  } catch {
    return { message_preview: message, error: message };
  }
}
