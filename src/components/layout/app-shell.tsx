import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  AlertCircle,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/cobrancas", label: "Cobrancas", icon: CreditCard },
  { to: "/inadimplencia", label: "Inadimplencia", icon: AlertCircle },
  { to: "/mensagens", label: "Mensagens IA", icon: MessageCircle },
  { to: "/configuracoes", label: "Configuracoes", icon: Settings },
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dropi-theme") === "dark");
  const location = useLocation();
  const { signOut, user } = useAuth();
  const activeItem = navItems.find((item) => location.pathname.startsWith(item.to)) ?? navItems[0];
  const ActiveIcon = activeItem.icon;
  const userName = user?.email?.split("@")[0] ?? "usuario";
  const initial = (userName[0] ?? "d").toLowerCase();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("dropi-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background text-slate-950 dark:bg-black dark:text-white">
      {open ? <button className="fixed inset-0 z-20 bg-slate-950/35 lg:hidden" aria-label="Fechar menu" onClick={() => setOpen(false)} /> : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-[#F0F3F1] px-3 py-4 transition-[width,transform] duration-300 ease-out dark:border-white/10 dark:bg-[#050805] lg:translate-x-0",
          collapsed ? "w-[280px] lg:w-[84px]" : "w-[280px] lg:w-[280px]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className={cn("flex items-center px-1 transition-all duration-300", collapsed ? "h-[116px] lg:flex-col lg:items-center lg:justify-start lg:gap-3" : "h-10 justify-between")}>
          <div className={cn("flex items-center gap-2", collapsed && "lg:justify-center")}>
            <img src="/dropi-logo.png" alt="Dropi" className="h-8 w-8 rounded-xl object-cover" />
            <p className={cn("text-base font-semibold leading-none text-slate-950 transition-opacity duration-200 dark:text-white", collapsed && "lg:hidden")}>
              Dropi
            </p>
          </div>
          <div className={cn("hidden items-center lg:flex", collapsed && "w-full flex-col gap-3")}>
            {collapsed ? <span className="h-px w-full bg-slate-200 dark:bg-white/10" /> : null}
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8A8EA8] transition hover:bg-white hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={() => setCollapsed((value) => !value)}
              title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
              aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
            {collapsed ? <span className="h-px w-full bg-slate-200 dark:bg-white/10" /> : null}
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-5 space-y-1 border-t border-slate-200 pt-5 dark:border-white/10">
          <p className={cn("px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8A8EA8] transition-opacity duration-200", collapsed && "lg:opacity-0")}>
            Painel
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "relative flex h-10 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition",
                  isActive ? "bg-white text-primary-foreground shadow-soft dark:bg-[#0D140D]" : "text-slate-950 hover:bg-white/70 dark:text-white dark:hover:bg-white/10",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <span className="absolute left-0 top-2 h-6 w-1 rounded-r-full bg-primary" /> : null}
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-[#8A8EA8]")} />
                  <span className={cn("whitespace-nowrap transition-opacity duration-200", isActive ? "text-slate-950 dark:text-white" : undefined, collapsed && "lg:pointer-events-none lg:w-0 lg:overflow-hidden lg:opacity-0")}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-5 dark:border-white/10">
          <div className={cn("mb-4 rounded-xl border border-primary/30 bg-primary-pale/60 p-3 transition-all duration-300 dark:bg-primary/10", collapsed && "lg:hidden")}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
              <p className="text-sm font-semibold text-slate-950 dark:text-white">IA pronta</p>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">Mensagens de cobranca com tom educado em poucos cliques.</p>
          </div>
          <div className={cn("flex items-center gap-3 rounded-xl bg-white px-3 py-3 transition-all duration-300 dark:bg-[#0D140D]", collapsed && "lg:justify-center lg:px-2")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-primary dark:text-primary-foreground">
              {initial}
            </div>
            <div className={cn("min-w-0 flex-1 transition-opacity duration-200", collapsed && "lg:hidden")}>
              <p className="truncate text-sm font-medium text-slate-950 dark:text-white">{userName}</p>
            </div>
            <button className={cn(collapsed && "lg:hidden")} onClick={signOut} title="Sair">
              <LogOut className="h-4 w-4 text-[#8A8EA8]" />
            </button>
          </div>
        </div>
      </aside>

      <div className={cn("transition-[padding] duration-300 ease-out", collapsed ? "lg:pl-[84px]" : "lg:pl-[280px]")}>
        <header className="sticky top-0 z-10 bg-background dark:bg-black">
          <div className="flex h-[75px] items-center justify-between px-4 sm:px-6 lg:px-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <ActiveIcon className="h-4 w-4 text-[#8A8EA8]" />
              <h1 className="text-lg font-medium text-slate-950 dark:text-white">{activeItem.label}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#8A8EA8] transition hover:border-primary hover:text-slate-950 dark:border-white/10 dark:bg-[#0D140D] dark:text-primary dark:hover:bg-primary/10"
                onClick={() => setDarkMode((value) => !value)}
                aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
                title={darkMode ? "Modo claro" : "Modo escuro"}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Bell className="h-5 w-5 text-[#8A8EA8] dark:text-primary" />
            </div>
          </div>
        </header>

        <main className="px-4 pb-8 sm:px-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
