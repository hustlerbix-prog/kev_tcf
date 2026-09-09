DO $$ BEGIN
  CREATE TYPE base_connaissance_bloc_type
    AS ENUM ('objectif', 'squelette', 'connecteurs', 'checklist', 'exemple', 'avertissement');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS base_connaissances_tcf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tache_num SMALLINT NOT NULL CHECK (tache_num IN (1, 2, 3)),
  slug TEXT NOT NULL UNIQUE,
  bloc_type base_connaissance_bloc_type NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  contenu_markdown TEXT NOT NULL,
  ordre INTEGER NOT NULL,
  actif BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_bc_tache_ordre
  ON base_connaissances_tcf (tache_num, ordre);

ALTER TABLE base_connaissances_tcf ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bc_anon_select_actif ON base_connaissances_tcf;
CREATE POLICY bc_anon_select_actif
  ON base_connaissances_tcf
  FOR SELECT
  TO anon
  USING (actif = TRUE);

DROP POLICY IF EXISTS bc_service_role_all ON base_connaissances_tcf;
CREATE POLICY bc_service_role_all
  ON base_connaissances_tcf
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);
