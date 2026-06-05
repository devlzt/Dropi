import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { maskPhone } from "@/lib/utils";
import type { Client } from "@/types/database";

const schema = z.object({
  name: z.string().min(2, "Informe o nome do cliente"),
  phone: z.string().min(10, "Informe um WhatsApp válido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  document: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export type ClientFormData = z.infer<typeof schema>;

export function ClientForm({
  client,
  onSubmit,
  onCancel,
  loading,
}: {
  client?: Client | null;
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: client?.name ?? "",
      phone: client?.phone ?? "",
      email: client?.email ?? "",
      document: client?.document ?? "",
      notes: client?.notes ?? "",
      status: client?.status ?? "active",
    },
  });

  return (
    <form className="space-y-5 p-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Nome</Label>
          <Input {...form.register("name")} placeholder="Ex: Maria Oliveira" />
          <FieldError error={form.formState.errors.name?.message} />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp</Label>
          <Input
            {...form.register("phone")}
            placeholder="(11) 99999-9999"
            onChange={(event) => form.setValue("phone", maskPhone(event.target.value), { shouldValidate: true })}
          />
          <FieldError error={form.formState.errors.phone?.message} />
        </div>
        <div className="space-y-2">
          <Label>E-mail</Label>
          <Input {...form.register("email")} placeholder="cliente@email.com" />
          <FieldError error={form.formState.errors.email?.message} />
        </div>
        <div className="space-y-2">
          <Label>CPF/CNPJ</Label>
          <Input {...form.register("document")} placeholder="Opcional" />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select {...form.register("status")}>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Observações</Label>
          <Textarea {...form.register("notes")} placeholder="Detalhes úteis sobre atendimento ou cobrança" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          Salvar cliente
        </Button>
      </div>
    </form>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs font-medium text-overdue">{error}</p>;
}
