import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({ label = "Carregando", fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-sm font-medium text-slate-500", fullScreen ? "min-h-screen" : "py-12")}>
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      {label}
    </div>
  );
}
