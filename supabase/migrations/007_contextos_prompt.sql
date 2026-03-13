-- Add custom AI prompt field to contextos
alter table contextos add column if not exists prompt text;
