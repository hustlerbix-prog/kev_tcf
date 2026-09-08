-- ============================================================
--  TCF Canada App — Migration 005
--  Suivi des erreurs pour réécriture 10×
-- ============================================================

CREATE TABLE IF NOT EXISTS erreurs_suivi (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  essai_id            UUID
    CONSTRAINT fk_erreurs_suivi_essai
    REFERENCES essais_expression_ecrite(id) ON DELETE SET NULL,
  manuel              BOOLEAN NOT NULL DEFAULT FALSE,

  -- Clé typique d'une erreur correction (1 ErreurDétaillée)
  code                TEXT NOT NULL,  -- CONJ, REG, ORT, GR, ESP, LEX, COH, ACC, AUT
  gravite             TEXT NOT NULL,  -- haute | moyenne | basse
  original            TEXT NOT NULL,  -- la forme fautive (ex: preferé)
  correction          TEXT NOT NULL,  -- la forme juste (ex: préféré)
  contexte            TEXT,           -- phrase / segment où apparaît l'erreur (optionnel)
  explication         TEXT,           -- règle / pourquoi (optionnel, copié de l'erreur LLM)
  traduction_es       TEXT,           -- glose espagnole (optionnel)

  -- Métadonnées de révision (point clé: "l'écrire 10 fois")
  notes               TEXT,           -- notes libres utilisateur (règle mnémotechnique, etc.)
  ecrit_10x_fois      BOOLEAN NOT NULL DEFAULT FALSE,  -- = a été écrit 10 fois sur Seyès ✔
  nb_revisions        INTEGER NOT NULL DEFAULT 0,      -- compteur (combien de séances révisées)
  derniere_revision   TIMESTAMPTZ,                    -- date de la dernière révision 10×

  -- Pour classement futur (priorité de révision)
  prochaine_revision  TIMESTAMPTZ
);

-- Contraintes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_erreurs_suivi_gravite'
  ) THEN
    ALTER TABLE erreurs_suivi
      ADD CONSTRAINT chk_erreurs_suivi_gravite
      CHECK (gravite IN ('haute', 'moyenne', 'basse'));
  END IF;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_erreurs_suivi_code           ON erreurs_suivi(code);
CREATE INDEX IF NOT EXISTS idx_erreurs_suivi_gravite        ON erreurs_suivi(gravite);
CREATE INDEX IF NOT EXISTS idx_erreurs_suivi_ecrit10x       ON erreurs_suivi(ecrit_10x_fois);
CREATE INDEX IF NOT EXISTS idx_erreurs_suivi_essai          ON erreurs_suivi(essai_id);
CREATE INDEX IF NOT EXISTS idx_erreurs_suivi_prochaine      ON erreurs_suivi(prochaine_revision);
CREATE INDEX IF NOT EXISTS idx_erreurs_suivi_created        ON erreurs_suivi(created_at DESC);

-- Déduplication sûre: (essai_id XOR (manuel AND essai_id IS NULL)) + code + original + correction
-- Implémenté sous index unique partiel :
--  • Si essai_id est présent : unique par essai + code + original + correction
--  • Si essai_id est absent (manuel) : unique par (manuel=TRUE, code, original, correction)
CREATE UNIQUE INDEX IF NOT EXISTS uq_erreurs_suivi_par_essai
  ON erreurs_suivi(essai_id, code, original, correction)
  WHERE essai_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_erreurs_suivi_manuel
  ON erreurs_suivi(code, original, correction)
  WHERE essai_id IS NULL AND manuel = TRUE;

-- RLS
ALTER TABLE erreurs_suivi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS erreurs_suivi_lecture ON erreurs_suivi;
CREATE POLICY erreurs_suivi_lecture
  ON erreurs_suivi FOR SELECT USING (true);

DROP POLICY IF EXISTS erreurs_suivi_ecriture ON erreurs_suivi;
CREATE POLICY erreurs_suivi_ecriture
  ON erreurs_suivi FOR ALL USING (true) WITH CHECK (true);
