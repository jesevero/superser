-- Add contact fields to criancas table
alter table criancas add column if not exists email_responsavel text;
alter table criancas add column if not exists whatsapp text;
