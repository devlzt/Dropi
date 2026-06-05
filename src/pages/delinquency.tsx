import { CheckCircle2, Copy, ExternalLink, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createChargeEvent } from "@/hooks/use-charge-events";
import { useCharges } from "@/hooks/use-charges";
import { useOrganization } from "@/hooks/use-organization";
import { buildLocalChargeMessage } from "@/lib/messages";
import { daysOverdue, formatCurrency, formatDate, getRealChargeStatus, whatsappUrl } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import type { ChargeWithClient } from "@/types/database";

export function DelinquencyPage() {
  const { charges, isLoading, markChargePaid } = useCharges();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const overdue = charges.filter((charge) => getRealChargeStatus(charge) === "overdue").sort((a, b) => daysOverdue(b.due_date) - daysOverdue(a.due_date));

  async function messageFor(charge: ChargeWithClient, action: "copy" | "whatsapp") {
    const message = buildLocalChargeMessage(charge, organization, daysOverdue(charge.due_date) > 10 ? "firme" : "educado");
    if (action === "copy") {
      await navigator.clipboard.writeText(message);
      await createChargeEvent({ organization_id: charge.organization_id, charge_id: charge.id, client_id: charge.client_id, type: "message_copied", message });
      toast({ type: "success", title: "Mensagem copiada" });
      return;
    }
    await createChargeEvent({ organization_id: charge.organization_id, charge_id: charge.id, client_id: charge.client_id, type: "whatsapp_opened", message });
    window.open(whatsappUrl(charge.clients?.phone ?? "", message), "_blank", "noopener,noreferrer");
  }

  if (isLoading) return <LoadingState label="Buscando inadimplencia" />;

  return (
    <div className="space-y-4">
      {overdue.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Nenhuma cobranca vencida por enquanto. Otimo sinal." description="Quando uma cobranca passar do vencimento, ela aparece aqui automaticamente." />
      ) : (
        <div className="grid gap-4">
          {overdue.map((charge) => (
            <Card key={charge.id} className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-950 dark:text-white">{charge.clients?.name ?? "Cliente removido"}</h2>
                    <Badge tone="orange">{daysOverdue(charge.due_date)} dia(s) em atraso</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{charge.clients?.phone} - vencimento em {formatDate(charge.due_date)}</p>
                  <p className="mt-3 text-sm text-slate-600">{charge.description}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase text-overdue">Valor vencido</p>
                    <p className="text-xl font-medium text-slate-950 dark:text-white">{formatCurrency(charge.amount)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => messageFor(charge, "copy")}><Copy className="h-4 w-4" />Mensagem</Button>
                    <Button onClick={() => messageFor(charge, "whatsapp")}><ExternalLink className="h-4 w-4" />WhatsApp</Button>
                    <Button variant="secondary" onClick={() => markChargePaid(charge)}><CheckCircle2 className="h-4 w-4" />Pago</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
