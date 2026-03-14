-- Stripe subscriptions table
create table if not exists assinaturas (
  id uuid primary key default gen_random_uuid(),
  avaliador_id uuid references avaliadores(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plano text not null default 'free',
  status text not null default 'active',
  periodo_inicio timestamptz,
  periodo_fim timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_assinaturas_avaliador on assinaturas(avaliador_id);
create index if not exists idx_assinaturas_stripe_customer on assinaturas(stripe_customer_id);

-- RLS
alter table assinaturas enable row level security;

-- Admins can do everything
create policy "admin_assinaturas_all" on assinaturas
  for all using (
    exists (select 1 from avaliadores where auth_id = auth.uid() and perfil = 'admin')
  );

-- Evaluators can read their own subscription
create policy "avaliador_assinaturas_select" on assinaturas
  for select using (
    avaliador_id in (select id from avaliadores where auth_id = auth.uid())
  );
