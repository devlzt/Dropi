import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { parseCurrencyInput, todayISO } from "@/lib/utils";
import type { ChargeWithClient, Client } from "@/types/database";

const schema = z.object({
  client_id: z.string().min(1, "Selecione um cliente"),
  description: z.string().min(3, "Descreva a cobrança"),
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
  due_date: z.string().min(1, "Informe a data de vencimento"),
  status: z.enum(["pending", "paid", "overdue", "canceled"]),
  payment_link: z.string().optional(),
  pix_copy_paste: z.string().optional(),
  notes: z.string().optional(),
});

export type ChargeFormData = z.infer<typeof schema>;

export function ChargeForm({
  charge,
  clients,
  onSubmit,
  onCancel,
  loading,
}: {
  charge?: ChargeWithClient | null;
  clients: Client[];
  onSubmit: (data: ChargeFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}) {
  const form = useForm<ChargeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_id: charge?.client_id ?? "",
      description: charge?.description ?? "",
      amount: Number(charge?.amount ?? 0),
      due_date: charge?.due_date ?? todayISO(),
      status: charge?.status ?? "pending",
      payment_link: charge?.payment_link ?? "",
      pix_copy_paste: charge?.pix_copy_paste ?? "",
      notes: charge?.notes ?? "",
    },
  });

  return (
    <form className="space-y-5 p-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Cliente</Label>
          <Select {...form.register("client_id")}>
            <option value="">Selecione</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
          <FieldError error={form.formState.errors.client_id?.message} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Descrição</Label>
          <Input {...form.register("description")} placeholder="Ex: Mensalidade de junho" />
          <FieldError error={form.formState.errors.description?.message} />
        </div>
        <div className="space-y-2">
          <Label>Valor</Label>
          <Input
            inputMode="decimal"
            defaultValue={charge ? String(charge.amount).replace(".", ",") : ""}
            placeholder="250,00"
            onChange={(event) => form.setValue("amount", parseCurrencyInput(event.target.value), { shouldValidate: true })}
          />
          <FieldError error={form.formState.errors.amount?.message} />
        </div>
        <div className="space-y-2">
          <Label>Vencimento</Label>
          <Input type="date" {...form.register("due_date")} />
          <FieldError error={form.formState.errors.due_date?.message} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select {...form.register("status")}>
            <option value="pending">Pendente</option>
            <option value="paid">Paga</option>
            <option value="overdue">Vencida</option>
            <option value="canceled">Cancelada</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Link Pix</Label>
          <Input {...form.register("payment_link")} placeholder="Opcional" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Pix copia e cola</Label>
          <Textarea {...form.register("pix_copy_paste")} placeholder="Opcional" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Observações</Label>
          <Textarea {...form.register("notes")} placeholder="Detalhes internos da cobrança" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || clients.length === 0}>
          Salvar cobrança
        </Button>
      </div>
    </form>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs font-medium text-overdue">{error}</p>;
}
