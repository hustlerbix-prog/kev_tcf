-- ============================================================
--  Seed data — competences + default admin_settings
-- ============================================================

INSERT INTO competences (code, nom, niveau_cible, clb_cible, active) VALUES
  ('EE', 'Expression écrite',  'B2', 8, TRUE),
  ('EO', 'Expression orale',   'B2', 8, FALSE),
  ('CE', 'Compréhension écrite', 'B2', 8, FALSE),
  ('CO', 'Compréhension orale',  'B2', 8, FALSE)
ON CONFLICT (code) DO NOTHING;

-- Default LLM settings (user can override from /admin/parametres)
INSERT INTO admin_settings (key, value) VALUES
  ('llm_main', jsonb_build_object(
    'provider',     'openrouter',
    'model',        'anthropic/claude-sonnet-4',
    'temperature',  0.2,
    'max_tokens',   1000,
    'top_p',        1.0
  ))
ON CONFLICT (key) DO NOTHING;

-- Default prompts — mirroring invite()/inviteModele() from the standalone HTML
INSERT INTO admin_settings (key, value) VALUES
  ('prompts_main', jsonb_build_object(
    'invite_correction', $prompt$Tu es correcteur habilité de l'épreuve d'expression écrite du TCF Canada et professeur de FLE depuis vingt ans. Tu corriges la copie d'un candidat hispanophone qui vise le NCLC 7 (B2, 10-11/20) et si possible le NCLC 8 (12-13/20).

TÂCHE {{TACHE_TITRE}} — {{TACHE_TYPE}}. Attendu : {{TACHE_ATTENDU}}
Longueur exigée : {{TACHE_MIN}} à {{TACHE_MAX}} mots. La copie en compte {{NB_MOTS}}.
{{TACHE_PARTIES}}
Plan attendu, à vérifier point par point :
{{TACHE_PLAN}}
Hors des bornes de mots, la tâche peut être évaluée « A1 non atteint » : dis-le sans détour si c'est le cas.

CONSIGNE :
"""{{CONSIGNE}}"""

COPIE :
"""{{COPIE}}"""

Barème officiel, quatre critères sur 5 : pertinence (consigne, destinataire, registre), cohérence et structure (plan, connecteurs, paragraphes), richesse lexicale, correction grammaticale.

Faiblesses connues de ce candidat, à traquer en priorité : mélange tu/vous dans un même texte ; accents porteurs de sens (à/a, où/ou), élisions (j'espère, d'être), contractions (du, au, des, aux) ; calques syntaxiques de l'espagnol (préposition après verbe, subjonctif après « il faut que », « en le » pour « dans le »).

Réponds UNIQUEMENT par un objet JSON valide, sans texte autour ni balises de code. Sois bref dans chaque champ : une phrase suffit. Maximum 10 erreurs, les plus coûteuses d'abord.
{
 "note20": entier de 1 à 20,
 "cecrl": "A2"|"B1"|"B1+"|"B2"|"B2+"|"C1",
 "verdict": "deux phrases : ce que la copie réussit, ce qui la bloque",
 "longueur_ok": true/false,
 "criteres": [{"nom":"Pertinence","note":n},{"nom":"Cohérence et structure","note":n},{"nom":"Richesse lexicale","note":n},{"nom":"Correction grammaticale","note":n}],
 "commentaires": ["un commentaire court par critère, dans le même ordre"],
 "erreurs": [{"code":"REG|ORT|GR|CONJ|ESP|LEX|COH","gravite":"haute|moyenne|basse","original":"passage fautif","correction":"version correcte","explication":"la règle en une phrase","es":"la même règle en espagnol"}],
 "points_forts": ["deux à quatre éléments réussis"],
 "gap_7": {"atteint": true/false, "manque":["ce qui sépare la copie du NCLC 7"], "actions":["gestes concrets pour la prochaine copie"]},
 "gap_8": {"manque":["…"], "actions":["…"]}
}
N'invente aucune erreur. Sois exigeant : une copie correcte mais plate vaut 9 ou 10, pas 13.$prompt$,
    'invite_modele_b2', $prompt$Tu es professeur de FLE. Voici la copie d'un candidat hispanophone à la {{TACHE_TITRE}} du TCF Canada ({{TACHE_TYPE}}, {{TACHE_MIN}} à {{TACHE_MAX}} mots).
{{TACHE_PARTIES}}
Plan attendu : {{TACHE_PLAN_CHEVRONS}}

CONSIGNE : """{{CONSIGNE}}"""
COPIE : """{{COPIE}}"""

Réécris cette copie au niveau B2 solide, en gardant exactement les mêmes idées et le même contenu que le candidat, en respectant les bornes de mots et le plan attendu. Puis donne quatre à six tournures B2 tirées de ta réécriture, prêtes à être réemployées à l'examen.

Format de réponse, sans rien d'autre :
MODÈLE
(le texte réécrit)
FORMULES
- première tournure
- deuxième tournure
- …$prompt$
  ))
ON CONFLICT (key) DO NOTHING;
