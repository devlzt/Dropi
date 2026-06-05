import { AlertCircle, CheckCircle2, Clock3, Info, MessageCircle, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCharges } from "@/hooks/use-charges";
import { formatCurrency, getRealChargeStatus } from "@/lib/utils";

const ranges = ["Hoje", "7 dias", "30 dias", "90 dias", "Tudo"];

export function DashboardPage() {
  const { charges, isLoading } = useCharges();
  const [range, setRange] = useState(ranges[0]);

  const metrics = useMemo(() => {
    const paid = charges.filter((charge) => getRealChargeStatus(charge) === "paid");
    const pending = charges.filter((charge) => getRealChargeStatus(charge) === "pending");
    const overdue = charges.filter((charge) => getRealChargeStatus(charge) === "overdue");
    const recovered = paid.reduce((sum, charge) => sum + Number(charge.amount), 0);
    const open = pending.reduce((sum, charge) => sum + Number(charge.amount), 0);
    const late = overdue.reduce((sum, charge) => sum + Number(charge.amount), 0);
    const total = recovered + open + late;

    return {
      paid,
      pending,
      overdue,
      revenueSeries: buildRevenueSeries(paid),
      recovered,
      open,
      late,
      total,
      recoveryRate: total > 0 ? Math.round((recovered / total) * 100) : 0,
      whatsappReady: charges.filter((charge) => charge.clients?.phone).length,
    };
  }, [charges]);

  if (isLoading) return <LoadingState label="Montando dashboard" />;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#070B07]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-medium text-[#7D819B] dark:text-slate-400">Resumo de cobrancas</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">Recebiveis sob controle</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {ranges.map((item) => (
              <button
                key={item}
                className={item === range ? "h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground" : "h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-950 hover:bg-slate-50 dark:border-white/10 dark:bg-black dark:text-white dark:hover:bg-primary/10"}
                onClick={() => setRange(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile icon={WalletCards} label="A receber" value={formatCurrency(metrics.open)} />
          <MetricTile icon={AlertCircle} label="Vencido" value={formatCurrency(metrics.late)} alert />
          <MetricTile icon={CheckCircle2} label="Recuperado" value={formatCurrency(metrics.recovered)} />
          <MetricTile icon={MessageCircle} label="WhatsApps prontos" value={String(metrics.whatsappReady)} />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[#8A8EA8]" />
              <h2 className="app-section-title">Fluxo de cobranca</h2>
            </div>
          </CardHeader>
          <CardContent>
            <ProgressRow label="Pendentes" value={metrics.open} total={metrics.total} color="bg-primary" />
            <ProgressRow label="Vencidas" value={metrics.late} total={metrics.total} color="bg-overdue" />
            <ProgressRow label="Pagas" value={metrics.recovered} total={metrics.total} color="bg-slate-950" />
            <div className="mt-6 rounded-xl bg-[#F7F8FA] p-4 dark:bg-black">
              <p className="text-sm font-medium text-[#7D819B] dark:text-slate-400">Taxa de recuperacao</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950 dark:text-white">{metrics.recoveryRate}%</p>
            </div>
          </CardContent>
        </Card>

        <RevenueChart values={metrics.revenueSeries} total={metrics.recovered} />
      </div>
    </div>
  );
}

function MetricTile({ icon: Icon, label, value, alert = false }: { icon: React.ElementType; label: string; value: string; alert?: boolean }) {
  return (
    <div className="rounded-xl bg-[#F7F8FA] p-4 dark:bg-black">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#7D819B] dark:text-slate-400">{label}</p>
        <Icon className={alert ? "h-4 w-4 text-overdue" : "h-4 w-4 text-[#8A8EA8]"} />
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const width = total > 0 ? Math.max(4, (value / total) * 100) : 0;

  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0 dark:border-white/10">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-950 dark:text-white">{label}</span>
        <span className="font-medium text-slate-950 dark:text-white">{formatCurrency(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function RevenueChart({ values, total }: { values: Array<{ label: string; value: number; count: number }>; total: number }) {
  const max = Math.max(...values.map((item) => item.value), 1);
  const ticks = [max, max / 2, 0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="app-section-title">Faturamento total</h2>
            <p className="mt-1 text-sm font-medium text-[#7D819B] dark:text-slate-400">{formatCurrency(total)} recebido</p>
          </div>
          <Info className="h-4 w-4 text-[#8A8EA8]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid h-72 grid-cols-[64px_1fr] gap-3">
          <div className="flex flex-col justify-between text-xs text-[#8A8EA8] dark:text-slate-500">
            {ticks.map((tick) => (
              <span key={tick}>{formatCompactCurrency(tick)}</span>
            ))}
          </div>
          <div className="relative rounded-xl border border-slate-200 bg-[#FCFDFD] dark:border-white/10 dark:bg-black">
            <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-slate-200 dark:border-white/10" />
            <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-slate-200 dark:border-white/10" />
            <div className="absolute inset-x-5 bottom-8 top-5 flex items-end gap-3">
              {values.map((item) => (
                <div key={item.label} className="group relative flex h-full flex-1 flex-col justify-end gap-2">
                  <button
                    className="peer w-full rounded-t-xl bg-primary/80 transition-all hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/35 dark:bg-primary/90"
                    style={{ height: `${item.value > 0 ? Math.max(6, (item.value / max) * 100) : 2}%` }}
                    aria-label={`${item.label}: ${formatCurrency(item.value)} em ${item.count} cobranca(s) paga(s)`}
                  />
                  <div className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-10 hidden w-44 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-soft dark:border-white/10 dark:bg-[#0D140D] group-hover:block group-focus-within:block">
                    <p className="text-xs font-medium uppercase text-[#8A8EA8]">{item.label}</p>
                    <p className="mt-1 text-base font-semibold text-slate-950 dark:text-white">{formatCurrency(item.value)}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.count} cobranca(s) paga(s)</p>
                  </div>
                  <span className="text-center text-[11px] font-medium text-[#8A8EA8] dark:text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function buildRevenueSeries(charges: Array<{ amount: number; paid_at: string | null; created_at: string }>) {
  const formatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatter.format(date).replace(".", ""),
      value: 0,
      count: 0,
    };
  });

  for (const charge of charges) {
    const date = new Date(charge.paid_at ?? charge.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = months.find((item) => item.key === key);
    if (month) {
      month.value += Number(charge.amount);
      month.count += 1;
    }
  }

  return months;
}

function formatCompactCurrency(value: number) {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1).replace(".", ",")}k`;
  return formatCurrency(value);
}
