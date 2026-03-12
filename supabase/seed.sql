-- ============================================================
-- SuperSer - Seed Data
-- ============================================================
-- Run AFTER creating a user via the app's signup screen.
-- Then replace 'SEU_AVALIADOR_ID' below with the avaliador UUID
-- from the avaliadores table.
-- ============================================================

-- ============================================================
-- Criancas
-- ============================================================

insert into criancas (id, nome, data_nascimento) values
  ('a1a1a1a1-0001-4000-8000-000000000001', 'Lucas Silva', '2018-03-15'),
  ('a1a1a1a1-0002-4000-8000-000000000002', 'Maria Santos', '2019-07-22'),
  ('a1a1a1a1-0003-4000-8000-000000000003', 'Pedro Oliveira', '2020-11-08');

-- ============================================================
-- Contextos
-- ============================================================

insert into contextos (id, titulo, subtitulo, icone, cor, cor_clara, ordem) values
  ('c0c0c0c0-0001-4000-8000-000000000001', 'Família', 'Contexto familiar e doméstico', 'home', '#2E7D32', '#E8F5E9', 1),
  ('c0c0c0c0-0002-4000-8000-000000000002', 'Escola', 'Contexto escolar e acadêmico', 'school', '#1565C0', '#E3F2FD', 2),
  ('c0c0c0c0-0003-4000-8000-000000000003', 'Social', 'Interações sociais e comunitárias', 'people', '#E65100', '#FFF3E0', 3),
  ('c0c0c0c0-0004-4000-8000-000000000004', 'Saúde', 'Saúde física e bem-estar', 'favorite', '#C62828', '#FFEBEE', 4),
  ('c0c0c0c0-0005-4000-8000-000000000005', 'Emocional', 'Desenvolvimento emocional', 'psychology', '#6A1B9A', '#F3E5F5', 5);

-- ============================================================
-- Categorias
-- ============================================================

-- Família
insert into categorias (id, contexto_id, nome, ordem) values
  ('d1d1d1d1-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Rotina e Organização', 1),
  ('d1d1d1d1-0002-4000-8000-000000000002', 'c0c0c0c0-0001-4000-8000-000000000001', 'Relacionamento Familiar', 2);

-- Escola
insert into categorias (id, contexto_id, nome, ordem) values
  ('d1d1d1d1-0003-4000-8000-000000000003', 'c0c0c0c0-0002-4000-8000-000000000002', 'Desempenho Acadêmico', 1),
  ('d1d1d1d1-0004-4000-8000-000000000004', 'c0c0c0c0-0002-4000-8000-000000000002', 'Comportamento em Sala', 2);

-- Social
insert into categorias (id, contexto_id, nome, ordem) values
  ('d1d1d1d1-0005-4000-8000-000000000005', 'c0c0c0c0-0003-4000-8000-000000000003', 'Habilidades Sociais', 1),
  ('d1d1d1d1-0006-4000-8000-000000000006', 'c0c0c0c0-0003-4000-8000-000000000003', 'Comunicação', 2);

-- Saúde
insert into categorias (id, contexto_id, nome, ordem) values
  ('d1d1d1d1-0007-4000-8000-000000000007', 'c0c0c0c0-0004-4000-8000-000000000004', 'Hábitos Saudáveis', 1),
  ('d1d1d1d1-0008-4000-8000-000000000008', 'c0c0c0c0-0004-4000-8000-000000000004', 'Atividade Física', 2);

-- Emocional
insert into categorias (id, contexto_id, nome, ordem) values
  ('d1d1d1d1-0009-4000-8000-000000000009', 'c0c0c0c0-0005-4000-8000-000000000005', 'Autoconhecimento', 1),
  ('d1d1d1d1-0010-4000-8000-000000000010', 'c0c0c0c0-0005-4000-8000-000000000005', 'Regulação Emocional', 2);

-- ============================================================
-- Indicadores
-- ============================================================

-- Família > Rotina e Organização
insert into indicadores (id, contexto_id, categoria_id, nome, ordem) values
  ('e1e1e1e1-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001', 'Segue rotinas diárias com autonomia', 1),
  ('e1e1e1e1-0002-4000-8000-000000000002', 'c0c0c0c0-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001', 'Organiza seus pertences', 2),
  ('e1e1e1e1-0003-4000-8000-000000000003', 'c0c0c0c0-0001-4000-8000-000000000001', 'd1d1d1d1-0001-4000-8000-000000000001', 'Cumpre horários estabelecidos', 3);

-- Família > Relacionamento Familiar
insert into indicadores (id, contexto_id, categoria_id, nome, ordem) values
  ('e1e1e1e1-0004-4000-8000-000000000004', 'c0c0c0c0-0001-4000-8000-000000000001', 'd1d1d1d1-0002-4000-8000-000000000002', 'Demonstra respeito pelos familiares', 1),
  ('e1e1e1e1-0005-4000-8000-000000000005', 'c0c0c0c0-0001-4000-8000-000000000001', 'd1d1d1d1-0002-4000-8000-000000000002', 'Colabora nas tarefas domésticas', 2),
  ('e1e1e1e1-0006-4000-8000-000000000006', 'c0c0c0c0-0001-4000-8000-000000000001', 'd1d1d1d1-0002-4000-8000-000000000002', 'Expressa afeto e carinho', 3);

-- Escola > Desempenho Acadêmico
insert into indicadores (id, contexto_id, categoria_id, nome, ordem) values
  ('e1e1e1e1-0007-4000-8000-000000000007', 'c0c0c0c0-0002-4000-8000-000000000002', 'd1d1d1d1-0003-4000-8000-000000000003', 'Realiza tarefas e deveres de casa', 1),
  ('e1e1e1e1-0008-4000-8000-000000000008', 'c0c0c0c0-0002-4000-8000-000000000002', 'd1d1d1d1-0003-4000-8000-000000000003', 'Demonstra interesse em aprender', 2),
  ('e1e1e1e1-0009-4000-8000-000000000009', 'c0c0c0c0-0002-4000-8000-000000000002', 'd1d1d1d1-0003-4000-8000-000000000003', 'Mantém concentração nas atividades', 3);

-- Escola > Comportamento em Sala
insert into indicadores (id, contexto_id, categoria_id, nome, ordem) values
  ('e1e1e1e1-0010-4000-8000-000000000010', 'c0c0c0c0-0002-4000-8000-000000000002', 'd1d1d1d1-0004-4000-8000-000000000004', 'Respeita regras da escola', 1),
  ('e1e1e1e1-0011-4000-8000-000000000011', 'c0c0c0c0-0002-4000-8000-000000000002', 'd1d1d1d1-0004-4000-8000-000000000004', 'Interage bem com colegas', 2),
  ('e1e1e1e1-0012-4000-8000-000000000012', 'c0c0c0c0-0002-4000-8000-000000000002', 'd1d1d1d1-0004-4000-8000-000000000004', 'Participa das atividades em grupo', 3);

-- Social > Habilidades Sociais
insert into indicadores (id, contexto_id, categoria_id, nome, ordem) values
  ('e1e1e1e1-0013-4000-8000-000000000013', 'c0c0c0c0-0003-4000-8000-000000000003', 'd1d1d1d1-0005-4000-8000-000000000005', 'Faz amizades com facilidade', 1),
  ('e1e1e1e1-0014-4000-8000-000000000014', 'c0c0c0c0-0003-4000-8000-000000000003', 'd1d1d1d1-0005-4000-8000-000000000005', 'Resolve conflitos de forma pacífica', 2),
  ('e1e1e1e1-0015-4000-8000-000000000015', 'c0c0c0c0-0003-4000-8000-000000000003', 'd1d1d1d1-0005-4000-8000-000000000005', 'Demonstra empatia pelos outros', 3);

-- Social > Comunicação
insert into indicadores (id, contexto_id, categoria_id, nome, ordem) values
  ('e1e1e1e1-0016-4000-8000-000000000016', 'c0c0c0c0-0003-4000-8000-000000000003', 'd1d1d1d1-0006-4000-8000-000000000006', 'Expressa opiniões com clareza', 1),
  ('e1e1e1e1-0017-4000-8000-000000000017', 'c0c0c0c0-0003-4000-8000-000000000003', 'd1d1d1d1-0006-4000-8000-000000000006', 'Escuta os outros com atenção', 2),
  ('e1e1e1e1-0018-4000-8000-000000000018', 'c0c0c0c0-0003-4000-8000-000000000003', 'd1d1d1d1-0006-4000-8000-000000000006', 'Usa linguagem adequada à situação', 3);

-- Saúde > Hábitos Saudáveis
insert into indicadores (id, contexto_id, categoria_id, nome, ordem) values
  ('e1e1e1e1-0019-4000-8000-000000000019', 'c0c0c0c0-0004-4000-8000-000000000004', 'd1d1d1d1-0007-4000-8000-000000000007', 'Alimenta-se de forma equilibrada', 1),
  ('e1e1e1e1-0020-4000-8000-000000000020', 'c0c0c0c0-0004-4000-8000-000000000004', 'd1d1d1d1-0007-4000-8000-000000000007', 'Mantém boa higiene pessoal', 2),
  ('e1e1e1e1-0021-4000-8000-000000000021', 'c0c0c0c0-0004-4000-8000-000000000004', 'd1d1d1d1-0007-4000-8000-000000000007', 'Dorme bem e na hora adequada', 3);

-- Saúde > Atividade Física
insert into indicadores (id, contexto_id, categoria_id, nome, ordem) values
  ('e1e1e1e1-0022-4000-8000-000000000022', 'c0c0c0c0-0004-4000-8000-000000000004', 'd1d1d1d1-0008-4000-8000-000000000008', 'Pratica atividades físicas regularmente', 1),
  ('e1e1e1e1-0023-4000-8000-000000000023', 'c0c0c0c0-0004-4000-8000-000000000004', 'd1d1d1d1-0008-4000-8000-000000000008', 'Demonstra boa coordenação motora', 2),
  ('e1e1e1e1-0024-4000-8000-000000000024', 'c0c0c0c0-0004-4000-8000-000000000004', 'd1d1d1d1-0008-4000-8000-000000000008', 'Participa de brincadeiras ativas', 3);

-- Emocional > Autoconhecimento
insert into indicadores (id, contexto_id, categoria_id, nome, ordem) values
  ('e1e1e1e1-0025-4000-8000-000000000025', 'c0c0c0c0-0005-4000-8000-000000000005', 'd1d1d1d1-0009-4000-8000-000000000009', 'Reconhece suas emoções', 1),
  ('e1e1e1e1-0026-4000-8000-000000000026', 'c0c0c0c0-0005-4000-8000-000000000005', 'd1d1d1d1-0009-4000-8000-000000000009', 'Identifica seus pontos fortes', 2),
  ('e1e1e1e1-0027-4000-8000-000000000027', 'c0c0c0c0-0005-4000-8000-000000000005', 'd1d1d1d1-0009-4000-8000-000000000009', 'Aceita suas limitações', 3);

-- Emocional > Regulação Emocional
insert into indicadores (id, contexto_id, categoria_id, nome, ordem) values
  ('e1e1e1e1-0028-4000-8000-000000000028', 'c0c0c0c0-0005-4000-8000-000000000005', 'd1d1d1d1-0010-4000-8000-000000000010', 'Lida com frustrações de forma adequada', 1),
  ('e1e1e1e1-0029-4000-8000-000000000029', 'c0c0c0c0-0005-4000-8000-000000000005', 'd1d1d1d1-0010-4000-8000-000000000010', 'Controla impulsos', 2),
  ('e1e1e1e1-0030-4000-8000-000000000030', 'c0c0c0c0-0005-4000-8000-000000000005', 'd1d1d1d1-0010-4000-8000-000000000010', 'Demonstra resiliência diante de desafios', 3);

-- ============================================================
-- Vinculos (link after signing up)
-- ============================================================
-- After creating your account in the app, find your avaliador_id
-- in the avaliadores table and uncomment/run:
--
-- insert into vinculos (avaliador_id, crianca_id) values
--   ('SEU_AVALIADOR_ID', 'a1a1a1a1-0001-4000-8000-000000000001'),
--   ('SEU_AVALIADOR_ID', 'a1a1a1a1-0002-4000-8000-000000000002'),
--   ('SEU_AVALIADOR_ID', 'a1a1a1a1-0003-4000-8000-000000000003');
