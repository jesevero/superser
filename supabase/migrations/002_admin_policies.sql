-- ============================================================
-- SuperSer - Admin RLS Policies
-- ============================================================

-- Helper: returns true if current user is admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from avaliadores
    where auth_id = auth.uid() and perfil = 'admin'
  );
$$ language sql security definer stable;

-- Avaliadores: admins can see and update all
create policy "admin_avaliadores_select" on avaliadores for select using (is_admin());
create policy "admin_avaliadores_update" on avaliadores for update using (is_admin());

-- Criancas: admins can full CRUD
create policy "admin_criancas_select" on criancas for select using (is_admin());
create policy "admin_criancas_insert" on criancas for insert with check (is_admin());
create policy "admin_criancas_update" on criancas for update using (is_admin());
create policy "admin_criancas_delete" on criancas for delete using (is_admin());

-- Vinculos: admins can full CRUD
create policy "admin_vinculos_select" on vinculos for select using (is_admin());
create policy "admin_vinculos_insert" on vinculos for insert with check (is_admin());
create policy "admin_vinculos_delete" on vinculos for delete using (is_admin());

-- Avaliacoes: admins can see and manage all
create policy "admin_avaliacoes_select" on avaliacoes for select using (is_admin());
create policy "admin_avaliacoes_insert" on avaliacoes for insert with check (is_admin());
create policy "admin_avaliacoes_update" on avaliacoes for update using (is_admin());
create policy "admin_avaliacoes_delete" on avaliacoes for delete using (is_admin());

-- Contextos: admins can full CRUD
create policy "admin_contextos_insert" on contextos for insert with check (is_admin());
create policy "admin_contextos_update" on contextos for update using (is_admin());
create policy "admin_contextos_delete" on contextos for delete using (is_admin());

-- Categorias: admins can full CRUD
create policy "admin_categorias_insert" on categorias for insert with check (is_admin());
create policy "admin_categorias_update" on categorias for update using (is_admin());
create policy "admin_categorias_delete" on categorias for delete using (is_admin());

-- Indicadores: admins can full CRUD
create policy "admin_indicadores_insert" on indicadores for insert with check (is_admin());
create policy "admin_indicadores_update" on indicadores for update using (is_admin());
create policy "admin_indicadores_delete" on indicadores for delete using (is_admin());
