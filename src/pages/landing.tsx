import {
  ArrowRight,
  BarChart3,
  BotMessageSquare,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  ExternalLink,
  Menu,
  MessageCircle,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

const navItems = [
  { label: "Produto", href: "#produto", hasMenu: true },
  { label: "Solucoes", href: "#solucoes", hasMenu: true },
  { label: "WhatsApp", href: "#whatsapp" },
  { label: "Pix", href: "#pix" },
  { label: "Precos", href: "#precos" },
];

const overdueRows = [
  { name: "Marina Costa", amount: 420, days: 7 },
  { name: "Oficina Almeida", amount: 1280, days: 12 },
  { name: "Studio Norte", amount: 190, days: 3 },
];

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden bg-[#F8FAFC] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Dropi">
            <img src="/dropi-logo.png" alt="" className="h-9 w-9 rounded-lg object-cover" />
            <span className="text-xl font-extrabold tracking-tight">dropi</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="flex items-center gap-1 transition hover:text-slate-950">
                {item.label}
                {item.hasMenu ? <ChevronDown className="h-3.5 w-3.5" /> : null}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button asChild variant="outline">
              <Link to="/login">Dashboard</Link>
            </Button>
            <Button asChild>
              <Link to="/login">
                Comecar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen((value) => !value)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-200 bg-white px-5 py-4 lg:hidden">
            <nav className="grid gap-3 text-sm font-semibold text-slate-700">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                  {item.label}
                </a>
              ))}
              <Button asChild className="mt-2">
                <Link to="/login">Acessar Dropi</Link>
              </Button>
            </nav>
          </div>
        ) : null}
      </header>

      <main>
        <section className="relative border-b border-slate-200 bg-white">
          <div className="absolute right-[-18vw] top-0 hidden h-full w-[66vw] skew-x-[-28deg] overflow-hidden lg:block">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#bbf451_0%,#9ae600_30%,#7ccf00_52%,#d9ff8f_72%,#ffffff_100%)] opacity-95" />
            <div className="absolute inset-x-0 top-0 h-40 bg-white/55" />
            <div className="absolute bottom-0 left-10 h-64 w-full bg-[linear-gradient(135deg,rgba(15,23,42,0.08),rgba(255,255,255,0.65))]" />
          </div>

          <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-bold text-slate-700">
                Pix, WhatsApp e inadimplencia em <span className="text-primary-foreground">um so painel</span>
              </p>
              <h1 className="mt-10 text-5xl font-extrabold leading-[1.03] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
                Receba mais, cobre menos manualmente.
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-600">
                Dropi automatiza sua rotina de cobranças com Pix, WhatsApp e mensagens inteligentes para pequenos negocios brasileiros.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/login">
                    Comece ja
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#produto">
                    Ver produto
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                {["Pix organizado", "WhatsApp pronto", "IA sem exagero"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-pale text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <ProductVisual />
          </div>

        </section>

        <section id="produto" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-extrabold tracking-normal text-slate-950 sm:text-5xl">
              Solucoes flexiveis para cada rotina de cobranca.
            </h2>
            <p className="mt-4 text-xl leading-8 text-slate-600">
              Organize clientes, cobranças, Pix e conversas em uma interface clara, feita para quem precisa receber sem perder o dia em planilhas.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
            <FeaturePanel
              large
              icon={CreditCard}
              title="Crie cobranças e acompanhe cada status"
              description="Pendentes, pagas, vencidas e canceladas aparecem com prioridade visual, valor e cliente."
            >
              <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {overdueRows.map((row) => (
                  <div key={row.name} className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 last:border-b-0">
                    <div>
                      <p className="font-bold text-slate-950">{row.name}</p>
                      <p className="text-sm text-slate-500">{row.days} dias em atraso</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-950">{formatCurrency(row.amount)}</p>
                      <Badge tone="orange">vencida</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </FeaturePanel>

            <FeaturePanel
              id="whatsapp"
              icon={BotMessageSquare}
              title="Mensagens com tom certo"
              description="Gere textos educados, amigáveis, firmes ou de última tentativa usando dados reais da cobrança."
            >
              <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
                <p className="text-sm leading-6 text-slate-600">
                  Oi, Marina. Passando para lembrar da cobrança de R$ 420,00 com vencimento em 12/06. Segue o Pix para facilitar o pagamento.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                    Copiar
                  </Button>
                  <Button size="sm">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </FeaturePanel>
          </div>

          <div id="solucoes" className="mt-4 grid gap-4 md:grid-cols-3">
            <FeaturePanel icon={BarChart3} title="Dashboard financeiro" description="Total a receber, vencido, recuperado no mês e inadimplência em uma visão simples." />
            <FeaturePanel icon={ShieldCheck} title="Dados protegidos por RLS" description="Cada usuário acessa apenas a organização dele, com Supabase Auth e policies no banco." />
            <FeaturePanel id="pix" icon={Zap} title="Pronto para Asaas ou Efi" description="Edge Functions estruturadas para Pix real, webhook e conciliação quando chegar a hora." />
          </div>
        </section>

        <section id="precos" className="bg-slate-950 px-5 py-20 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <h2 className="text-4xl font-extrabold tracking-normal sm:text-5xl">Uma ferramenta enxuta para receber melhor.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Comece com o essencial: clientes, cobranças, inadimplência e mensagens prontas para WhatsApp.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white p-6 text-slate-950 shadow-soft">
              <p className="text-sm font-bold text-primary-foreground">MVP Dropi</p>
              <p className="mt-3 text-4xl font-extrabold">Pronto para testar</p>
              <p className="mt-3 text-sm text-slate-500">Configure Supabase e comece a usar localmente.</p>
              <Button asChild className="mt-6 w-full" size="lg">
                <Link to="/login">Acessar o Dropi</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProductVisual() {
  return (
    <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
      <div className="absolute -inset-6 hidden rounded-[2rem] bg-primary-pale/35 blur-3xl lg:block" />
      <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Dashboard Dropi</p>
            <p className="mt-1 text-lg font-extrabold text-slate-950">Cobranças de junho</p>
          </div>
          <Badge tone="green">Pix ativo</Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MiniStat label="A receber" value="R$ 18.240" />
          <MiniStat label="Vencido" value="R$ 3.890" alert />
          <MiniStat label="Recuperado" value="R$ 9.640" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.72fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold text-slate-950">Inadimplência</p>
              <span className="text-xs font-semibold text-overdue">3 clientes</span>
            </div>
            <div className="space-y-3">
              {overdueRows.map((row) => (
                <div key={row.name} className="rounded-lg bg-white p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-950">{row.name}</p>
                    <p className="font-bold text-slate-950">{formatCurrency(row.amount)}</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn("h-full rounded-full", row.days > 10 ? "bg-overdue" : "bg-primary")} style={{ width: `${Math.min(100, row.days * 7)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-white">
            <p className="text-sm font-bold">Mensagem pronta</p>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Oi, Marina. Sua cobrança venceu há 7 dias. Posso te enviar o Pix para regularizar?
            </p>
            <div className="mt-6 rounded-lg bg-primary-pale px-3 py-2 text-sm font-extrabold text-primary-foreground">
              Abrir WhatsApp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className={cn("mt-2 text-xl font-extrabold", alert ? "text-overdue" : "text-slate-950")}>{value}</p>
    </div>
  );
}

function FeaturePanel({
  id,
  icon: Icon,
  title,
  description,
  children,
  large = false,
}: {
  id?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  large?: boolean;
}) {
  return (
    <article id={id} className={cn("rounded-xl border border-slate-200 bg-white p-6 shadow-soft", large && "lg:min-h-[460px]")}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-pale/60 text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 max-w-xl text-2xl font-bold leading-tight text-slate-950">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      {children}
    </article>
  );
}
