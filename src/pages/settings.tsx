import { PlugZap, Save, Settings2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "@/hooks/use-organization";
import { maskPhone } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const schema = z.object({
  name: z.string().min(2, "Informe o nome da empresa"),
  whatsapp: z.string().optional(),
  pix_key: z.string().optional(),
  responsible_name: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function SettingsPage() {
  const { organization, isLoading, updateOrganization, isUpdating } = useOrganization();
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", whatsapp: "", pix_key: "", responsible_name: "" },
  });

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name,
        whatsapp: organization.whatsapp ?? "",
        pix_key: organization.pix_key ?? "",
        responsible_name: organization.responsible_name ?? "",
      });
    }
  }, [form, organization]);

  async function submit(data: FormData) {
    try {
      await updateOrganization({
        name: data.name,
        whatsapp: data.whatsapp || null,
        pix_key: data.pix_key || null,
        responsible_name: data.responsible_name || null,
      });
      toast({ type: "success", title: "Configuracoes salvas" });
    } catch (error) {
      toast({ type: "error", title: "Erro ao salvar", description: error instanceof Error ? error.message : undefined });
    }
  }

  if (isLoading) return <LoadingState label="Carregando configuracoes" />;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-[#8A8EA8]" />
            <h2 className="app-section-title">Dados da empresa</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
            <div className="space-y-2 sm:col-span-2">
              <Label>Nome da empresa</Label>
              <Input {...form.register("name")} placeholder="Ex: Studio Lima" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp da empresa</Label>
              <Input {...form.register("whatsapp")} placeholder="(11) 99999-9999" onChange={(event) => form.setValue("whatsapp", maskPhone(event.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Nome do responsavel</Label>
              <Input {...form.register("responsible_name")} placeholder="Ex: Henrique" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Chave Pix</Label>
              <Input {...form.register("pix_key")} placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatoria" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={isUpdating}>
                <Save className="h-4 w-4" />
                Salvar configuracoes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PlugZap className="h-4 w-4 text-[#8A8EA8]" />
            <h2 className="app-section-title">Integracoes futuras</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>A base ja esta preparada para conectar Asaas ou Efi via Edge Functions, sem tratar pagamento de demonstracao como real.</p>
          <div className="rounded-xl border border-slate-200 bg-[#F7F8FA] p-4 dark:border-white/10 dark:bg-black">
            <p className="font-medium text-slate-950 dark:text-white">Proximos conectores</p>
            <p className="mt-1">Pix real, webhook de confirmacao e conciliacao automatica.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
