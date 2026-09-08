-- ============================================================
--  Progression & notes — extend essais_expression_ecrite
--  + dedicated progression_notes per attempt
-- ============================================================

ALTER TABLE essais_expression_ecrite
  ADD COLUMN IF NOT EXISTS score_100      NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB,
  ADD COLUMN IF NOT EXISTS feedback       TEXT,
  ADD COLUMN IF NOT EXISTS corrected_version TEXT,
  ADD COLUMN IF NOT EXISTS notes_user     TEXT,
  ADD COLUMN IF NOT EXISTS strengths      TEXT[],
  ADD COLUMN IF NOT EXISTS areas_for_improvement TEXT[],
  ADD COLUMN IF NOT EXISTS grammar_tips   JSONB,
  ADD COLUMN IF NOT EXISTS vocabulary_upgrades JSONB,
  ADD COLUMN IF NOT EXISTS example_responses JSONB;

CREATE INDEX IF NOT EXISTS idx_ee_score_100 ON essais_expression_ecrite (score_100 DESC);

-- -----------------------------------------------------------
--  PROGRESSION NOTES — free-form per-attempt private notes
--  (alternative/appendix to notes_user column)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS progression_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  essai_id     UUID NOT NULL REFERENCES essais_expression_ecrite(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL DEFAULT 'general',   -- general | to_retry | grammar_target | vocab_target
  contenu      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pn_essai ON progression_notes(essai_id);

ALTER TABLE progression_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_rw_progression_notes ON progression_notes;
CREATE POLICY anon_rw_progression_notes ON progression_notes
  FOR ALL USING (TRUE) WITH CHECK (TRUE);
