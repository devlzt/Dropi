import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function DashboardChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-bold text-slate-950">Valores por status</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">{item.label}</span>
              <span className="font-bold text-slate-950">{formatCurrency(item.value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full" style={{ width: `${Math.max(6, (item.value / max) * 100)}%`, backgroundColor: item.color }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
