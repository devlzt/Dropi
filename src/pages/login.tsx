import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasSupabaseEnv } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";

const schema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "Use pelo menos 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function handleSubmit(data: FormData) {
    try {
      if (mode === "signup") {
        await signUp(data.email, data.password, data.fullName || data.email.split("@")[0]);
        toast({ type: "success", title: "Conta criada", description: "Confira seu e-mail se a confirmação estiver ativa no Supabase." });
        return;
      }
      await signIn(data.email, data.password);
    } catch (error) {
      toast({ type: "error", title: "Não foi possível entrar", description: error instanceof Error ? error.message : "Tente novamente." });
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-primary/40 hover:bg-primary-pale/35 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-primary/50 dark:hover:bg-primary/10 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para tela principal
          </Link>

          <div className="flex items-center gap-3">
            <img src="/dropi-logo.png" alt="Dropi" className="h-12 w-12 rounded-2xl object-cover" />
            <div>
              <p className="text-2xl font-extrabold tracking-tight text-slate-950">Dropi</p>
              <p className="text-sm font-medium text-slate-500">Cobrança inteligente para pequenos negócios</p>
            </div>
          </div>

          <h1 className="mt-12 max-w-lg text-4xl font-extrabold tracking-normal text-slate-950 sm:text-5xl">
            Receba mais, cobre menos manualmente.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Automatize cobranças com Pix, WhatsApp e mensagens inteligentes.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Pix organizado", "WhatsApp pronto", "Inadimplência clara"].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-soft">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center px-6 pb-10 sm:px-10 lg:px-16 lg:py-10">
        <Card className="mx-auto w-full max-w-md p-6">
          <div className="mb-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-pale/45 px-3 py-1 text-xs font-bold text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              MVP seguro com Supabase
            </div>
            <h2 className="text-2xl font-bold text-slate-950">{mode === "login" ? "Entrar no Dropi" : "Criar sua conta"}</h2>
            <p className="mt-2 text-sm text-slate-500">Acesse seu painel de cobranças em poucos segundos.</p>
          </div>

          {!hasSupabaseEnv ? (
            <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
              Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para autenticar.
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input {...form.register("fullName")} placeholder="Seu nome" />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9" {...form.register("email")} placeholder="voce@empresa.com" />
              </div>
              <FieldError error={form.formState.errors.email?.message} />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9" type="password" {...form.register("password")} placeholder="Sua senha" />
              </div>
              <FieldError error={form.formState.errors.password?.message} />
            </div>
            <Button className="w-full" type="submit" disabled={form.formState.isSubmitting || !hasSupabaseEnv}>
              {mode === "login" ? "Entrar" : "Criar conta"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <button className="mt-5 w-full text-center text-sm font-semibold text-slate-600 hover:text-slate-950" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Ainda não tenho conta" : "Já tenho conta"}
          </button>
        </Card>
      </section>
    </div>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs font-medium text-overdue">{error}</p>;
}
