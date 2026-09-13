-- ============================================================
--  010A — Ajustements eo_archetypes pour seed 011
--  Ajoute colonnes utilisées dans le seed (created_at, updated_at, question_ouverture)
--  Renomme category → categorie pour compatibilité seed
-- ============================================================

DO $$ BEGIN
  ALTER TABLE public.eo_archetypes RENAME COLUMN category TO categorie;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.eo_archetypes ADD COLUMN IF NOT EXISTS question_ouverture TEXT;
ALTER TABLE public.eo_archetypes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.eo_archetypes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
