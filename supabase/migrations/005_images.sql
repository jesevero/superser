-- Add foto_url to criancas
alter table criancas add column if not exists foto_url text;

-- Add imagem_url to contextos
alter table contextos add column if not exists imagem_url text;

-- Create storage bucket for images (run in Supabase Dashboard > Storage if this fails)
-- insert into storage.buckets (id, name, public) values ('images', 'images', true);
