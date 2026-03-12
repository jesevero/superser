-- ============================================================
-- Keep ALL evaluations (not just the latest per day)
-- ============================================================

-- Drop the unique constraint that limits one evaluation per indicator per day
alter table avaliacoes drop constraint if exists avaliacoes_crianca_id_avaliador_id_indicador_id_data_key;

-- Add index for efficient querying by created_at
create index if not exists idx_avaliacoes_created_at on avaliacoes(created_at desc);
