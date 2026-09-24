-- 013 — Ajout colonnes audio + durée aux tours EO pour buffer vocal Whisper
ALTER TABLE IF EXISTS eo_turns
ADD COLUMN IF NOT EXISTS audio_data_base64 TEXT NULL;

ALTER TABLE IF EXISTS eo_turns
ADD COLUMN IF NOT EXISTS audio_mime_type TEXT NULL;

ALTER TABLE IF EXISTS eo_turns
ADD COLUMN IF NOT EXISTS duration_sec NUMERIC(6, 2) NULL;

COMMENT ON COLUMN eo_turns.audio_data_base64 IS
  'Enregistrement audio du tour candidat encodé base64 (format audio/webm;codecs=opus). NULL si tour examinateur ou réponses texte uniquement.';

COMMENT ON COLUMN eo_turns.audio_mime_type IS
  'MIME type exact de l''enregistrement audio (audio/webm;codecs=opus, audio/ogg;codecs=opus, audio/mp4 selon navigateur).';

COMMENT ON COLUMN eo_turns.duration_sec IS
  'Durée réelle du tour enregistré en secondes (maximum 9999.99 = 2h46).';

CREATE INDEX IF NOT EXISTS idx_eo_turns_candidate_audio
  ON eo_turns (role) WHERE role = 'candidate' AND audio_data_base64 IS NOT NULL;
