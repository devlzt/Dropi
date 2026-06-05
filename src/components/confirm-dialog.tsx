import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirmar", onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Dialog open={open} title={title} onClose={onClose} className="sm:max-w-md">
      <div className="p-5">
        <div className="flex gap-4">
          <div className="rounded-xl bg-orange-50 p-3 text-overdue">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
