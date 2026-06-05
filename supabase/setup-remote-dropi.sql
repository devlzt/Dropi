create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Minha empresa',
  whatsapp text,
  pix_key text,
  responsible_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  document text,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.charges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue', 'canceled')),
  paid_at timestamptz,
  pix_copy_paste text,
  pix_qr_code_url text,
  payment_link text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.charge_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  charge_id uuid not null references public.charges(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  type text not null,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  tone text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists organizations_owner_id_idx on public.organizations(owner_id);
create index if not exists clients_organization_id_idx on public.clients(organization_id);
create index if not exists charges_organization_id_idx on public.charges(organization_id);
create index if not exists charges_client_id_idx on public.charges(client_id);
create index if not exists charge_events_charge_id_idx on public.charge_events(charge_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_charges_updated_at on public.charges;
create trigger set_charges_updated_at
before update on public.charges
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.clients enable row level security;
alter table public.charges enable row level security;
alter table public.charge_events enable row level security;
alter table public.message_templates enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
for select using (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Owners can manage organizations" on public.organizations;
create policy "Owners can manage organizations" on public.organizations
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "Owners can manage clients" on public.clients;
create policy "Owners can manage clients" on public.clients
for all using (
  exists (
    select 1 from public.organizations
    where organizations.id = clients.organization_id
    and organizations.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.organizations
    where organizations.id = clients.organization_id
    and organizations.owner_id = auth.uid()
  )
);

drop policy if exists "Owners can manage charges" on public.charges;
create policy "Owners can manage charges" on public.charges
for all using (
  exists (
    select 1 from public.organizations
    where organizations.id = charges.organization_id
    and organizations.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.clients
    where clients.id = charges.client_id
    and clients.organization_id = charges.organization_id
  )
) with check (
  exists (
    select 1 from public.organizations
    where organizations.id = charges.organization_id
    and organizations.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.clients
    where clients.id = charges.client_id
    and clients.organization_id = charges.organization_id
  )
);

drop policy if exists "Owners can manage charge events" on public.charge_events;
create policy "Owners can manage charge events" on public.charge_events
for all using (
  exists (
    select 1 from public.organizations
    where organizations.id = charge_events.organization_id
    and organizations.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.charges
    where charges.id = charge_events.charge_id
    and charges.organization_id = charge_events.organization_id
  )
  and exists (
    select 1 from public.clients
    where clients.id = charge_events.client_id
    and clients.organization_id = charge_events.organization_id
  )
) with check (
  exists (
    select 1 from public.organizations
    where organizations.id = charge_events.organization_id
    and organizations.owner_id = auth.uid()
  )
  and exists (
    select 1 from public.charges
    where charges.id = charge_events.charge_id
    and charges.organization_id = charge_events.organization_id
  )
  and exists (
    select 1 from public.clients
    where clients.id = charge_events.client_id
    and clients.organization_id = charge_events.organization_id
  )
);

drop policy if exists "Owners can manage templates" on public.message_templates;
create policy "Owners can manage templates" on public.message_templates
for all using (
  exists (
    select 1 from public.organizations
    where organizations.id = message_templates.organization_id
    and organizations.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.organizations
    where organizations.id = message_templates.organization_id
    and organizations.owner_id = auth.uid()
  )
);
