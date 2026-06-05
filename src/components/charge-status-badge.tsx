import { Badge } from "@/components/ui/badge";
import { getRealChargeStatus } from "@/lib/utils";
import type { Charge } from "@/types/database";

const labels = {
  pending: "Pendente",
  paid: "Paga",
  overdue: "Vencida",
  canceled: "Cancelada",
};

export function ChargeStatusBadge({ charge }: { charge: Pick<Charge, "status" | "due_date"> }) {
  const status = getRealChargeStatus(charge);
  return <Badge tone={status === "paid" ? "green" : status === "overdue" ? "orange" : "slate"}>{labels[status]}</Badge>;
}
