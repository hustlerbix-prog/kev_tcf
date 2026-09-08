-- ============================================================
--  TCF Canada App — initial schema
--  Expression Écrite (B2 CLB 8) + extensible competences
-- ============================================================

-- Enable UUID & pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------
--  COMPETENCES (extensible: EE, EO, CE, CO)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS competences (
  code         TEXT PRIMARY KEY,
  nom          TEXT NOT NULL,
  niveau_cible TEXT NOT NULL DEFAULT 'B2',
  clb_cible    INTEGER NOT NULL DEFAULT 8,
  active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- -----------------------------------------------------------
--  ADMIN SETTINGS — UI-editable (LLM picker, prompts, etc.)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);

-- -----------------------------------------------------------
--  ESSAIS EXPRESSION ÉCRITE — history of attempts (progress to CLB 8)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS essais_expression_ecrite (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  tache_num    INTEGER NOT NULL CHECK (tache_num IN (1,2,3)),
  consigne     TEXT,
  copie        TEXT NOT NULL,
  nb_mots      INTEGER,
  note_20      NUMERIC(4,1),
  cecrl        TEXT,
  nclc         TEXT,
  longueur_ok  BOOLEAN,
  verdict      TEXT,
  criteres     JSONB,          -- [{nom,note,commentaire}]
  commentaires TEXT[],
  erreurs      JSONB,          -- [{code,gravite,original,correction,explication,es}]
  points_forts TEXT[],
  gap_7        JSONB,          -- {atteint, manque[], actions[]}
  gap_8        JSONB,          -- {manque[], actions[]}
  modele_b2    TEXT,
  formules_b2  TEXT[],
  heuristiques JSONB,          -- snapshot of live regex detections
  model_used   TEXT            -- which LLM produced the score
);

CREATE INDEX IF NOT EXISTS idx_ee_created_at ON essais_expression_ecrite (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ee_tache_num  ON essais_expression_ecrite (tache_num);
CREATE INDEX IF NOT EXISTS idx_ee_note       ON essais_expression_ecrite (note_20 DESC);

-- -----------------------------------------------------------
--  STATS CONJUGAISON — daily aggregation per session-day
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS stats_conjugaison (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_jour  DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  nb_justes  INTEGER NOT NULL DEFAULT 0,
  nb_total   INTEGER NOT NULL DEFAULT 0,
  fautes_acc INTEGER NOT NULL DEFAULT 0,
  meilleure_serie INTEGER NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------
--  RLS — single-user app, anon role trusted, explicit policies
-- -----------------------------------------------------------
ALTER TABLE competences             ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE essais_expression_ecrite ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats_conjugaison       ENABLE ROW LEVEL SECURITY;

-- anon: read all competences
DROP POLICY IF EXISTS anon_read_competences ON competences;
CREATE POLICY anon_read_competences ON competences FOR SELECT USING (TRUE);

-- anon: read essais
DROP POLICY IF EXISTS anon_rw_essais ON essais_expression_ecrite;
CREATE POLICY anon_rw_essais ON essais_expression_ecrite
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- anon: read/write stats conjugaison
DROP POLICY IF EXISTS anon_rw_stats_conj ON stats_conjugaison;
CREATE POLICY anon_rw_stats_conj ON stats_conjugaison
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- anon: read admin_settings (EXPOSE values for model/prompt in UI)
-- Sensible keys (API keys) MUST NOT live in this table — they stay in .env
DROP POLICY IF EXISTS anon_read_admin_settings ON admin_settings;
CREATE POLICY anon_read_admin_settings ON admin_settings FOR SELECT USING (TRUE);

-- Service role only (API route) can write admin_settings
DROP POLICY IF EXISTS service_write_admin_settings ON admin_settings;
CREATE POLICY service_write_admin_settings ON admin_settings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
