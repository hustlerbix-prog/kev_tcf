-- ============================================================
--  010 — Module Expression Orale : tables archetypes, sessions,
--  task_runs, turns + RLS + index
--  Idempotent (IF NOT EXISTS / DO $$)
-- ============================================================

-- 1. eo_archetypes — catalogue des 72 exercices (T1=20, T2=24, T3=28)
CREATE TABLE IF NOT EXISTS public.eo_archetypes (
  id                 TEXT PRIMARY KEY,                           -- T1-IDE-01
  task               SMALLINT NOT NULL CHECK (task IN (1,2,3)),
  category           TEXT NOT NULL DEFAULT 'Général',
  "set"              TEXT NOT NULL DEFAULT 'full' CHECK ("set" IN ('quick','full')),
  consigne           TEXT NOT NULL,
  translation_es     TEXT,
  duration_sec       INT  NOT NULL DEFAULT 120,                   -- T1=120 / T2=210 / T3=270
  prep_sec           INT  NOT NULL DEFAULT 0,                     -- T2=120, sinon 0
  examiner_role      TEXT,
  candidate_role     TEXT,
  objective          TEXT,
  required_moves     TEXT[] DEFAULT '{}',
  relances           TEXT[] DEFAULT '{}',                         -- T1 chaîne 4 questions progressives
  lexical_field      TEXT[] DEFAULT '{}',
  scene_facts        TEXT[] DEFAULT '{}',                         -- T2: 6-10 faits fixes inventés
  complication       TEXT,                                        -- T2: 1 complication mi-parcours
  arguments_pour     TEXT[] DEFAULT '{}',                         -- T3 QS: 3 arguments
  arguments_contre   TEXT[] DEFAULT '{}',                         -- T3 QS: 3 contre
  exemples_concrets  TEXT[] DEFAULT '{}',                         -- T3 QS: 2 exemples
  connecteurs        TEXT[] DEFAULT '{}',                         -- T3 QS: 6 du §14.1
  plan_4t            TEXT[] DEFAULT '{}',                         -- T3 QS: 4 phases
  cheat_sheet        JSONB DEFAULT '{}'::jsonb,
  actif              BOOLEAN NOT NULL DEFAULT TRUE,
  ordre              INT  NOT NULL DEFAULT 0
);

-- 2. eo_sessions — une simulation ou un drill
CREATE TABLE IF NOT EXISTS public.eo_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL DEFAULT 'anon',
  mode            TEXT NOT NULL CHECK (mode IN ('drill_text','drill_voice','conversation','full_exam','review')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  credits_spent   INT  NOT NULL DEFAULT 0,
  evaluation      JSONB,
  incomplete      BOOLEAN NOT NULL DEFAULT FALSE,
  target_note_20  SMALLINT DEFAULT 10                               -- objectif NCLC 7 = 10-11
);

-- 3. eo_task_runs — une exécution de tâche dans une session
CREATE TABLE IF NOT EXISTS public.eo_task_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES eo_sessions(id) ON DELETE CASCADE,
  task            SMALLINT NOT NULL CHECK (task IN (1,2,3)),
  archetype_id    TEXT REFERENCES eo_archetypes(id) ON DELETE SET NULL,
  overtime_seconds INT NOT NULL DEFAULT 0,
  prep_notes      TEXT,
  metrics         JSONB,
  turns_order     UUID[] DEFAULT '{}'
);

-- 4. eo_turns — un tour de parole (examinateur ou candidat)
CREATE TABLE IF NOT EXISTS public.eo_turns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_run_id   UUID NOT NULL REFERENCES eo_task_runs(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('examiner','candidate')),
  "text"        TEXT NOT NULL DEFAULT '',
  start_ms      INT  NOT NULL DEFAULT 0,
  end_ms        INT  NOT NULL DEFAULT 0,
  internal_note TEXT
);

-- 5. Index performance
CREATE INDEX IF NOT EXISTS idx_eo_arch_task_set      ON public.eo_archetypes (task, "set");
CREATE INDEX IF NOT EXISTS idx_eo_arch_actif          ON public.eo_archetypes (actif) WHERE actif = TRUE;
CREATE INDEX IF NOT EXISTS idx_eo_sessions_user       ON public.eo_sessions (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_eo_task_runs_session   ON public.eo_task_runs  (session_id, task);
CREATE INDEX IF NOT EXISTS idx_eo_turns_taskrun       ON public.eo_turns      (task_run_id);

-- 6. RLS (Row Level Security) — L'utilisateur ne voit que SES sessions
ALTER TABLE public.eo_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eo_task_runs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eo_turns       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eo_archetypes  ENABLE ROW LEVEL SECURITY;

-- 6a. eo_archetypes : anonyme select sur les actifs
DROP POLICY IF EXISTS eo_arch_select ON public.eo_archetypes;
CREATE POLICY eo_arch_select ON public.eo_archetypes
  FOR SELECT USING (actif = TRUE);

-- 6b. eo_sessions : utilisateur voit ses propres lignes
DROP POLICY IF EXISTS eo_sess_select ON public.eo_sessions;
CREATE POLICY eo_sess_select ON public.eo_sessions
  FOR SELECT USING (user_id = current_user OR user_id = 'anon' OR current_setting('role', TRUE) = 'service_role');
DROP POLICY IF EXISTS eo_sess_insert ON public.eo_sessions;
CREATE POLICY eo_sess_insert ON public.eo_sessions
  FOR INSERT WITH CHECK (true);

-- 6c. eo_task_runs : cascade via session_id policy
DROP POLICY IF EXISTS eo_tr_select ON public.eo_task_runs;
CREATE POLICY eo_tr_select ON public.eo_task_runs
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.eo_sessions s WHERE s.id = session_id));
DROP POLICY IF EXISTS eo_tr_insert ON public.eo_task_runs;
CREATE POLICY eo_tr_insert ON public.eo_task_runs
  FOR INSERT WITH CHECK (true);

-- 6d. eo_turns : idem
DROP POLICY IF EXISTS eo_turns_select ON public.eo_turns;
CREATE POLICY eo_turns_select ON public.eo_turns
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.eo_task_runs r WHERE r.id = task_run_id));
DROP POLICY IF EXISTS eo_turns_insert ON public.eo_turns;
CREATE POLICY eo_turns_insert ON public.eo_turns
  FOR INSERT WITH CHECK (true);
