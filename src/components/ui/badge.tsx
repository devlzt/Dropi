import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "green" | "orange" | "slate" | "dark";
};

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "green" && "bg-primary-pale text-primary-foreground dark:bg-primary/20 dark:text-primary",
        tone === "orange" && "bg-orange-50 text-overdue dark:bg-orange-500/10 dark:text-orange-300",
        tone === "slate" && "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
        tone === "dark" && "bg-slate-950 text-white",
        className,
      )}
      {...props}
    />
  );
}
