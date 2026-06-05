import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({ title, value, hint, icon: Icon, alert = false }: { title: string; value: string; hint?: string; icon: LucideIcon; alert?: boolean }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className={cn("rounded-xl p-3", alert ? "bg-orange-50 text-overdue" : "bg-primary-pale/45 text-primary-foreground")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
