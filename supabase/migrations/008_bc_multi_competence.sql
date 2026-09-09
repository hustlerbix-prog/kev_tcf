-- ============================================================
--  008 — base_connaissances_tcf : multi-compétence EE / EO
--  Ajout colonne competence_code (FK competences.code) DEFAULT 'EE'
--  CHECK tache_num étendu (0=compétence générale, 1-3 tâches)
--  Index composite + activation EO dans la table competences
--  Idempotent (IF NOT EXISTS / DO $$ / ON CONFLICT)
-- ============================================================

-- 1. Activer la compétence EO si elle existe (seed 002 la créée FALSE)
UPDATE competences
   SET active = TRUE,
       nom    = 'Expression orale'
 WHERE code   = 'EO';

-- 2. Ajouter colonne competence_code si absente, DEFAULT='EE'
ALTER TABLE base_connaissances_tcf
  ADD COLUMN IF NOT EXISTS competence_code TEXT NOT NULL DEFAULT 'EE';

-- 3. Étendre CHECK tache_num IN (0,1,2,3)
--    Postgres ne supporte pas ALTER CHECK ADD VALUE → on drop+add
DO $$ BEGIN
  ALTER TABLE base_connaissances_tcf
    DROP CONSTRAINT IF EXISTS base_connaissances_tcf_tache_num_check;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE base_connaissances_tcf
  ADD CONSTRAINT base_connaissances_tcf_tache_num_check
  CHECK (tache_num IN (0, 1, 2, 3));

-- 4. Ajouter FK vers competences (idempotent)
DO $$ BEGIN
  ALTER TABLE base_connaissances_tcf
    ADD CONSTRAINT base_connaissances_tcf_competence_code_fkey
    FOREIGN KEY (competence_code) REFERENCES competences(code)
    ON DELETE RESTRICT;
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN OTHERS THEN NULL;
END $$;

-- 5. Nouvel index composite (performance filtres compétence+tâche)
DROP INDEX IF EXISTS idx_bc_tache_ordre;

CREATE INDEX IF NOT EXISTS idx_bc_comp_tache_ordre
  ON base_connaissances_tcf (competence_code, tache_num, ordre);
