# Dropi

Dropi é um MVP de SaaS para cobrança inteligente de pequenos negócios brasileiros. Ele permite cadastrar clientes, criar cobranças, acompanhar inadimplência, gerar mensagens de cobrança e abrir WhatsApp Web com a mensagem pronta.

## Stack

- React + Vite + TypeScript
- TailwindCSS
- Componentes no estilo Shadcn/UI
- Lucide React
- Supabase Auth + Postgres + Edge Functions
- React Router
- React Hook Form + Zod
- TanStack Query

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=
ASAAS_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
```

No frontend, são obrigatórias:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Nas Edge Functions, use:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ASAAS_API_KEY`, opcional para integração futura
- `OPENAI_API_KEY` ou `GEMINI_API_KEY`, opcional para IA

Sem chave de IA, o Dropi gera mensagens por templates locais e não quebra.

## Supabase

1. Crie um projeto no Supabase.
2. Configure Authentication com e-mail e senha.
3. Rode a migration:

```bash
supabase db push
```

Ou copie o SQL de `supabase/migrations/20260603170000_initial_dropi.sql` para o SQL Editor do Supabase.

A migration cria:

- `profiles`
- `organizations`
- `clients`
- `charges`
- `charge_events`
- `message_templates`
- RLS em todas as tabelas
- Policies para o usuário acessar apenas dados da organização onde ele é owner
- Trigger de `updated_at`
- Criação automática de organização no cadastro ou no primeiro acesso

## Edge Functions

Funções disponíveis:

- `generate-charge-message`
- `create-pix-charge`
- `asaas-webhook`

Para servir localmente:

```bash
supabase functions serve generate-charge-message --env-file .env
supabase functions serve create-pix-charge --env-file .env
supabase functions serve asaas-webhook --env-file .env
```

Para deploy:

```bash
supabase functions deploy generate-charge-message
supabase functions deploy create-pix-charge
supabase functions deploy asaas-webhook
```

`create-pix-charge` retorna um Pix de demonstração quando `ASAAS_API_KEY` não existe. Esse retorno é identificado como modo demonstração e não representa pagamento real.

## Fluxo principal

1. Criar conta e entrar.
2. Ajustar dados da empresa em Configurações.
3. Cadastrar cliente.
4. Criar cobrança.
5. Gerar mensagem.
6. Copiar mensagem ou abrir WhatsApp.
7. Marcar cobrança como paga.
8. Acompanhar dashboard e inadimplência.

## Segurança

O isolamento de dados é feito por Row Level Security. Todas as queries passam pela organização vinculada ao usuário autenticado, e as policies verificam `owner_id = auth.uid()`.

## Observação de MVP

As integrações com Asaas/Efí estão estruturadas, mas não executam pagamento real ainda. O MVP é funcional para gestão manual com Pix, WhatsApp e mensagens inteligentes/templates.
