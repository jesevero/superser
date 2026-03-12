-- Allow avaliadores without Supabase Auth accounts (created by admin)
alter table avaliadores alter column auth_id drop not null;
drop index if exists avaliadores_auth_id_key;
alter table avaliadores drop constraint if exists avaliadores_auth_id_key;
alter table avaliadores add constraint avaliadores_auth_id_key unique (auth_id);

-- Policy: admins can insert avaliadores
create policy "admin_avaliadores_insert" on avaliadores for insert with check (is_admin());

-- Policy: admins can delete avaliadores
create policy "admin_avaliadores_delete" on avaliadores for delete using (is_admin());

-- Policy: allow updating own avaliador record (to link auth_id on first login)
create policy "avaliadores_self_update" on avaliadores for update using (
  auth_id = auth.uid() or (auth_id is null and email = (select email from auth.users where id = auth.uid()))
);

-- Policy: allow users to delete their own avaliacoes (for re-evaluation)
create policy "avaliacoes_delete" on avaliacoes for delete using (
  avaliador_id in (select id from avaliadores where auth_id = auth.uid())
);
