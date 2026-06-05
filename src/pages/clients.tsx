import { Edit3, Plus, Search, Trash2, UserRoundPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { ClientForm, type ClientFormData } from "@/components/forms/client-form";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useClients } from "@/hooks/use-clients";
import { useToast } from "@/providers/toast-provider";
import type { Client } from "@/types/database";

export function ClientsPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Client | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const { clients, isLoading, createClient, updateClient, deleteClient, isMutating } = useClients();
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return clients.filter((client) => [client.name, client.phone, client.email ?? ""].join(" ").toLowerCase().includes(term));
  }, [clients, search]);

  async function submit(data: ClientFormData) {
    try {
      if (editing) {
        await updateClient({ id: editing.id, payload: { ...data, email: data.email || null, document: data.document || null, notes: data.notes || null } });
      } else {
        await createClient({ ...data, email: data.email || null, document: data.document || null, notes: data.notes || null });
      }
      toast({ type: "success", title: "Cliente salvo" });
      setDialogOpen(false);
      setEditing(null);
    } catch (error) {
      toast({ type: "error", title: "Erro ao salvar cliente", description: error instanceof Error ? error.message : undefined });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8EA8]" />
            <Input className="pl-9" placeholder="Buscar por nome, telefone ou e-mail" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Badge tone="green">{clients.length} cliente(s)</Badge>
        </div>

        {isLoading ? <LoadingState /> : clients.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={UserRoundPlus} title="Cadastre seus clientes para comecar a organizar suas cobrancas." description="Depois de criar um cliente, voce ja pode emitir cobrancas e enviar lembretes pelo WhatsApp." actionLabel="Novo cliente" onAction={() => setDialogOpen(true)} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#F7F8FA] text-xs uppercase text-slate-500 dark:bg-black dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">WhatsApp</th>
                  <th className="px-5 py-3">Documento</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {filtered.map((client) => (
                  <tr key={client.id} className="bg-white hover:bg-[#FAFBFC] dark:bg-[#070B07] dark:hover:bg-primary/5">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-950 dark:text-white">{client.name}</div>
                      <div className="text-xs text-slate-500">{client.email || "Sem e-mail"}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{client.phone}</td>
                    <td className="px-5 py-4 text-slate-600">{client.document || "-"}</td>
                    <td className="px-5 py-4"><Badge tone={client.status === "active" ? "green" : "slate"}>{client.status === "active" ? "Ativo" : "Inativo"}</Badge></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => { setEditing(client); setDialogOpen(true); }}><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="danger" size="icon" onClick={() => setDeleting(client)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} title={editing ? "Editar cliente" : "Novo cliente"} onClose={() => setDialogOpen(false)}>
        <ClientForm client={editing} loading={isMutating} onCancel={() => setDialogOpen(false)} onSubmit={submit} />
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir cliente"
        description="Essa acao remove o cliente. Se houver cobrancas vinculadas, o banco pode impedir a exclusao para preservar o historico."
        confirmLabel="Excluir"
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteClient(deleting.id);
            toast({ type: "success", title: "Cliente excluido" });
            setDeleting(null);
          } catch (error) {
            toast({ type: "error", title: "Nao foi possivel excluir", description: error instanceof Error ? error.message : undefined });
          }
        }}
      />
    </div>
  );
}
