-- ============================================================
-- SuperSer - Initial Schema
-- ============================================================

-- Avaliadores (evaluators linked to Supabase Auth)
create table avaliadores (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique not null references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  perfil text not null default 'familia',
  created_at timestamptz not null default now()
);

-- Criancas (children being evaluated)
create table criancas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  data_nascimento date,
  created_at timestamptz not null default now()
);

-- Vinculos (many-to-many: which evaluators can assess which children)
create table vinculos (
  id uuid primary key default gen_random_uuid(),
  avaliador_id uuid not null references avaliadores(id) on delete cascade,
  crianca_id uuid not null references criancas(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (avaliador_id, crianca_id)
);

-- Contextos (developmental contexts: family, school, etc.)
create table contextos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  subtitulo text not null default '',
  icone text not null default 'category',
  cor text not null default '#1E3A5F',
  cor_clara text not null default '#E8F0FE',
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- Categorias (categories within a context)
create table categorias (
  id uuid primary key default gen_random_uuid(),
  contexto_id uuid not null references contextos(id) on delete cascade,
  nome text not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- Indicadores (behavioral indicators within a category)
create table indicadores (
  id uuid primary key default gen_random_uuid(),
  contexto_id uuid not null references contextos(id) on delete cascade,
  categoria_id uuid not null references categorias(id) on delete cascade,
  nome text not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- Avaliacoes (evaluation ratings)
create table avaliacoes (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references criancas(id) on delete cascade,
  avaliador_id uuid not null references avaliadores(id) on delete cascade,
  indicador_id uuid not null references indicadores(id) on delete cascade,
  contexto_id uuid not null references contextos(id) on delete cascade,
  valor int not null check (valor between 1 and 5),
  data date not null default current_date,
  observacoes text not null default '',
  created_at timestamptz not null default now(),
  unique (crianca_id, avaliador_id, indicador_id, data)
);

-- ============================================================
-- Indexes
-- ============================================================

create index idx_avaliadores_auth_id on avaliadores(auth_id);
create index idx_vinculos_avaliador on vinculos(avaliador_id);
create index idx_vinculos_crianca on vinculos(crianca_id);
create index idx_categorias_contexto on categorias(contexto_id);
create index idx_indicadores_contexto on indicadores(contexto_id);
create index idx_indicadores_categoria on indicadores(categoria_id);
create index idx_avaliacoes_crianca_contexto on avaliacoes(crianca_id, contexto_id);
create index idx_avaliacoes_crianca_indicador on avaliacoes(crianca_id, indicador_id);

-- ============================================================
-- Views
-- ============================================================

-- v_ultima_avaliacao: latest rating per indicator for each child
create view v_ultima_avaliacao as
select distinct on (a.crianca_id, a.indicador_id)
  a.crianca_id,
  a.indicador_id,
  a.contexto_id,
  a.valor,
  a.data
from avaliacoes a
order by a.crianca_id, a.indicador_id, a.data desc;

-- v_resumo_contexto: summary per context for each child
create view v_resumo_contexto as
select
  u.crianca_id,
  u.contexto_id,
  round(avg(u.valor)::numeric, 1) as media,
  count(*)::int as indicadores_avaliados,
  max(u.data)::text as ultima_avaliacao
from v_ultima_avaliacao u
group by u.crianca_id, u.contexto_id;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table avaliadores enable row level security;
alter table criancas enable row level security;
alter table vinculos enable row level security;
alter table contextos enable row level security;
alter table categorias enable row level security;
alter table indicadores enable row level security;
alter table avaliacoes enable row level security;

-- Avaliadores: users can read/insert their own profile
create policy "avaliadores_select" on avaliadores for select using (auth.uid() = auth_id);
create policy "avaliadores_insert" on avaliadores for insert with check (auth.uid() = auth_id);

-- Criancas: users can see children linked to them
create policy "criancas_select" on criancas for select using (
  id in (select crianca_id from vinculos where avaliador_id in (
    select id from avaliadores where auth_id = auth.uid()
  ))
);

-- Vinculos: users can see their own links
create policy "vinculos_select" on vinculos for select using (
  avaliador_id in (select id from avaliadores where auth_id = auth.uid())
);

-- Contextos, Categorias, Indicadores: readable by all authenticated users
create policy "contextos_select" on contextos for select using (auth.uid() is not null);
create policy "categorias_select" on categorias for select using (auth.uid() is not null);
create policy "indicadores_select" on indicadores for select using (auth.uid() is not null);

-- Avaliacoes: users can read evaluations for their linked children, insert/update their own
create policy "avaliacoes_select" on avaliacoes for select using (
  crianca_id in (select crianca_id from vinculos where avaliador_id in (
    select id from avaliadores where auth_id = auth.uid()
  ))
);

create policy "avaliacoes_insert" on avaliacoes for insert with check (
  avaliador_id in (select id from avaliadores where auth_id = auth.uid())
);

create policy "avaliacoes_update" on avaliacoes for update using (
  avaliador_id in (select id from avaliadores where auth_id = auth.uid())
);
