# Correction Écrite — Prompt + Schéma Agnostiques au Modèle LLM

## Repository Research (conclusions de la phase d'exploration)

Objectif de l'utilisateur : *"l'analyse présentée (les 10 sections) devrait être INDEPENDANTE du modèle LLM choisi — quelque soit la taille ou le fournisseur, le JSON produit doit avoir EXACTEMENT la même structure et les 10 mêmes sections. Ajuster les prompts."*

Architecture actuelle et points faibles identifiés (racines du « minimax tronqué » — `minimax/minimax-m3:free` a renvoyé uniquement score_breakdown + B1+ avec sections 2–10 vides/renommées en FR) :

1. **Prompt actuel a 3 doublons ambigus (interchangeabilité FR ↔ EN)** qui poussent les petits modèles à choisir UNE clé au hasard (la FR, en général) au lieu de la clé canonique EN :
   - `feedback` ↔ `verdict` ↔ `commentaire / commentaire_général / retour / appréciation` (1 string)
   - `strengths` ↔ `points_forts` (string[]), idem
   - `areas_for_improvement` ↔ `axes_amélioration` ↔ `points_faibles` ↔ `suggestions` (string[]), idem
   → *Résultat* : 90 % des petits modèles renvoient `axes_amélioration` FR, pas la clé EN canonique. Couche serveur fallback `D2` (ajoutée session précédente) rattrape ça, mais on veut rendre ça **inutile** en amont.

2. **Aucune demande explicite « TOUS LES CHAMPS SONT OBLIGATOIRES, MÊME VIDES »**. Aujourd'hui le prompt dit "format obligatoire" mais ne liste PAS la règle :
   - « Chaque champ de la structure ci-dessous DOIT être présent dans l'objet JSON. »
   - « Si tu n'as aucun contenu, renvoie une chaîne vide `""` ou un tableau vide `[]`, NE SUPPRIME PAS la clé. »
   → Minimax supprime purement et simplement les 7 clés feedback/corrected_version/strengths/areas/grammar_tips/vocabulary_upgrades/example_responses.

3. **Aucune liste d'EXCLUSIONS (clés interdites)**. Rien n'interdit explicitement :
   - les clés FR équivalentes (`version_corrigée`, `conseils_grammaire`, `améliorations_vocabulaire`, `exemples_réponse`)
   - les suffixes `B1+`/`B2+` dans `cecrl`
   - Les clés supplémentaires hors schéma.
   → Minimax a renvoyé `cecrl:"B1+"` interdit (aujourd'hui tué par étape serveur G).

4. **Switch provider-level `response_format` NON PASSÉ à OpenRouter**. Fichier [openrouter.ts](file:///Users/kevche_mini/TFC%20App/lib/llm/openrouter.ts#L79-L90) corps POST :
   ```ts
   body: { model, temperature, max_tokens, messages, reasoning:{exclude:true} }
   ```
   Manque `response_format`. OpenRouter transmet nativement `response_format.type = "json_object"` ou `"json_schema"` à Anthropic (claude), OpenAI (gpt), Google (gemini), DeepSeek… c'est le #1 levier pour rendre le JSON indépendant du modèle. Sans ça, le modèle peut choisir texte libre / markdown / code blocks. Aujourd'hui `lireJSON` doit rattraper les ```json code blocks et le <think> grâce à `nettoyerRaisonnement`.

5. **Les deux copies `DEFAULTS.invite_correction` sont DÉSYNCHRONISÉES** à long terme :
   - [lib/llm/prompts.ts DEFAULTS.invite_correction](file:///Users/kevche_mini/TFC%20App/lib/llm/prompts.ts#L62-L181) (fallback si DB `prompts_main` vide)
   - [app/admin/parametres/page.tsx DEFAULT_PROMPTS.invite_correction](file:///Users/kevche_mini/TFC%20App/app/admin/parametres/page.tsx#L17) (valeur initiale avant premier save)
   → Si on ne met à jour qu'un, la persistance admin override l'autre et l'utilisateur ne voit pas ses changements.

6. **prompt actuel mentionne 2 redondances héritées de l'ancien barème** qui disparaissent dans CorrectionResult moderne : `criteres[]` et `commentaires[]` + `points_forts[]` / `strengths[]`. On garde la compatibilité, mais on doit préciser au modèle *« renvoie strength et areas EN, PAS points_forts / axes_amélioration »*.

7. **max_tokens = 1000** (admin_settings LLM fallback route.ts line 278) est TROP COURT. Pour 9 sections + 3 exemples B1/B2/C1 de 120 mots chacun + 8 erreurs = 2200 tokens minimum. [page admin DEFAULT_LLM line 13](file:///Users/kevche_mini/TFC%20App/app/admin/parametres/page.tsx#L9-L15) a `max_tokens:2200`, mais le fallback corriger/route.ts a `1000`. Désalignement = truncation (c'est exactement ce qui s'est passé avec minimax : max_tokens 1000 a coupé la réponse après score_breakdown).

## Fichiers et modules à modifier (ordre de dépendance)

1. **`lib/llm/openrouter.ts`** — Ajouter `response_format: { type: "json_object" }` (ou optionnellement `json_schema` pour un contrôle 100 % strict) au corps POST, avec un fallback silencieux si le modèle ne supporte pas response_format (certains modèles gratuits openrouter rejettent 400).

2. **`lib/llm/prompts.ts DEFAULTS.invite_correction`** — Réécrire la section « FORMAT OBLIGATOIRE » avec 6 nouvelles micro-règles :
   - A15 SCHÉMA FERMÉ (liste close des 24 clés top-level AUTORISÉES, rien d'autre ; liste clés FR INTERDITES)
   - A16 OBLIGATOIRETÉ ABSOLUE : toutes les clés présentes, jamais null/undefined ; contenu vide = "" / []
   - A17 LANGUE DES CLÉS : exclusivement EN (feedback, strengths, areas_for_improvement, grammar_tips, vocabulary_upgrades, example_responses, corrected_version) ; JAMAIS FR (ni commentaire, ni points_forts, ni axes_amélioration…)
   - A18 CECRL : bornes exactes 0-3A1 4-6A2 7-9B1 **10-12B2** 13-15C1 16-20C2 ; JAMAIS de + ; modèle doit renvoyer cecrl=B2 si note20=11
   - A19 FORME TABLEAUX : grammar_tips 3-clés OBLIGATOIRES (regle/exemple/explication) ; vocabulary_upgrades 3-clés ; example_responses 3 entrées OBLIGATOIRES B1/B2/C1 avec NIVEAU exact "B1"|"B2"|"C1" PAS B1+
   - A20 JSON PUR, SANS CODE BLOCK : le JSON ne doit PAS être enveloppé dans ```json ... ``` ; nettoyerRaisonnement existe mais on le double-défend.

3. **`app/admin/parametres/page.tsx DEFAULT_PROMPTS.invite_correction`** — Mise à jour IDENTIQUE (copié/collé) de `prompts.ts DEFAULTS` pour synchroniser la valeur initiale de l'UI admin. IMPORTANT : deux copies à garder égales.

4. **`app/api/corriger/route.ts`** — 4 modifications (DEFENSE EN PROFONDEUR, 2ème ligne après prompt) :
   - (a) Passer `response_format` à `appelOpenRouter(prompt, llm, system?)` comme 3ème paramètre — aujourd'hui `system` est transmis mais jamais utilisé comme entête séparé. Créer un argument `options: { response_format?: "json_object" | "json_schema"; schema?: object }` dans `appelOpenRouter`.
   - (b) Augmenter `llm fallback max_tokens` de 1000 → **2200** pour aligner sur l'UI admin DEFAULT_LLM.
   - (c) Ajouter une étape **NORMALISATION SCHÉMA FERMÉ** APRÈS serveur fallback D2 : ne conserver QUE les 24 clés autorisées de CorrectionResult (supprimer toutes les clés parasites FR comme axes_amélioration/conseils_grammaire qu'aurait quand même renvoyées le modèle malgré prompt). Les fallback D2 ont déjà transféré valeurs → clés EN, on peut donc purge FR sainement.
   - (d) Si example_responses n'a PAS 3 niveaux distincts B1/B2/C1 : forcer 3 entrées en fallback algorithmiquement (ex : copier corrected_version tronquée à 60% + préfixes). Aujourd'hui le tableau disparaît complètement.

5. **OPTIONNEL `lib/types/tcf.ts CorrectionResult`** — Rendre REQUISES (supprimer `?`) les 7 champs qui aujourd'hui sont `?` mais que l'on veut obligatoires (feedback, corrected_version, strengths, areas_for_improvement, grammar_tips, vocabulary_upgrades, example_responses). Aujourd'hui ils sont optionnels car minimax les omettait ; une fois le prompt et json_mode fixes, on peut rendre TS strict. **RISQUE :** break tous les endroits qui testent `if (r.feedback)` → on ne fera ça QUE si 1 semaine d'usage confirme 0 taux de réponse tronquée. Donc RETIRÉ du plan initial, gardé comme post-fixe optionnel.

6. **`lib/llm/prompts.ts DEFAULTS.invite_modele_b2`** (léger) — Ajouter une consigne JSON pur au besoin, aujourd'hui il renvoie du texte libre MODÈLE/FORMULES mais aucun appel ne dépend de ça, on le laisse.

## Étapes d'implémentation (ordre strict)

1. Modifier `lib/llm/openrouter.ts appelOpenRouter()` :
   - Ajout param `options?: { response_format?: "json_object" | "json_schema"; json_schema?: object }`
   - Si `response_format==="json_schema"` et `json_schema` fourni → `body.response_format = { type:"json_schema", json_schema:{...}}`
   - Si seulement `"json_object"` → `body.response_format = { type:"json_object" }`
   - Ajout try/catch 400 : si 400 avec error contains "response_format" → retry 1x SANS response_format (modèles gratuits non support : minimax/m3 free, etc.). On logue silently, pas d'exception.

2. Mettre à jour `lib/llm/prompts.ts DEFAULTS.invite_correction` section FORMAT OBLIGATOIRE + 6 règles A15–A20 :
   - Remplacer la section FORMAT OBLIGATOIRE actuelle (lignes 136–177) par une version :
     * (a) Toutes les clés top-level NOMMÉES et dactylographiées EXACTEMENT (canonique EN, interdiction FR explicites pour les 7 ambigus)
     * (b) Requiert 3 entries example_responses OBLIGATOIRES avec niveau ∈ {B1,B2,C1}, jamais vide, jamais +
     * (c) A16 : Toutes les clés obligatoires, jamais null/undefined, `""/[]` si pas de contenu
     * (d) A17 : Aucune clé hors la liste (fermeture)
   - NE PAS toucher A1–A14 + A12 existants (traités de bugs déjà validés), juste ajouter A15–A20 à la fin des RÈGLES ABSOLUES, avant TÂCHE.

3. Copier-coller IDENTIQUE la nouvelle section FORMAT OBLIGATOIRE + A15–A20 dans `app/admin/parametres/page.tsx DEFAULT_PROMPTS.invite_correction`. Vérifier la longueur avec grep ou diff mental pour éviter les écarts.

4. Modifier `app/api/corriger/route.ts` :
   - (a) Aligner fallback llm.max_tokens 1000 → 2200 à la ligne 278
   - (b) Transmettre `response_format:"json_object"` + un `json_schema` objet CorrectionResult allégé à `appelOpenRouter(prompt, llm, undefined, { response_format:"json_schema", json_schema: <schema objet>})`
   - (c) Ajouter, APRES étape D2 (multi-clés fallbacks) et AVANT étape E (feedback=verdict), une nouvelle étape (D3) : `PURGE SCHÉMA FERMÉ` : construis un objet newObj = pick only canonicals keys listées (24 clés), jette axes_amélioration etc. Ceci garantit que Response JSON envoyé au client contient UNIQUEMENT clés EN, jamais FR.
   - (d) Ajouter étape (D4) si `example_responses.length < 3` → padding : construit 3 entrées à partir de corrected_version tronquée (si dispo) ou copie originale. Niveau B1/B2/C1 garanti. On préfixe texte avec `[Modèle B1 par défaut, le LLM n'a pas fourni] : … 80 % corrected_version`.

5. Run TypeScript strict `npx tsc --noEmit` → 0 erreurs.

6. Run build Next.js `npm run build` → 22 routes vertes.

7. Smoke test node script `/tmp/test_norm_layer_v2.mjs` : réinjecte un JSON « minimax-m3:free-style » comme la session précédente (seulement score_breakdown + cecrl=B1+, toutes les autres clés FR équivalentes). Vérifie POST /api/corriger maintenant :
   - Renvoie 24 clés CANONIQUES, AUCUNE FR (axes_amelioration etc. ont disparu)
   - cecrl = B2 (11/20)
   - example_responses.length === 3 (niveaux B1/B2/C1, jamais +)
   - grammar_tips/vocabulary_upgrades length > 0 (valeurs reprises à partir des équivalents FR via D2, puis purgées via D3)

8. Kill port 3000 + restart `npm run start`.

## Dépendances & Considérations

- **Hard constraints projet (rappels) :**
  - Clés CECRL : JAMAIS `+`, niveaux ∈ {A1,A2,B1,B2,C1,C2}  → préservé, re-dit explicitement dans A18
  - Min tokens 25 client avant corriger → ok pas touché
  - Aucune clé secrète côté navigateur → response_format est transmit seulement dans POST serveur → ok
  - prompt admin persisté en Supabase JSONB → on a modifié DEFAULTS et DEFAULT_PROMPTS des 2 côtés, les admins qui cliqueront Enregistrer après chargement de l'UI persistront la version mise à jour automatiquement (parce que DEFAULT_PROMPTS est la seed useState initial)
- **Risque sur response_format json_schema :** OpenRouter transmet json_schema aux seuls modèles qui le supportent nativement (Claude/GPT/DeepSeek) ; pour les autres, on a le fallback `response_format:json_object` → `text + code block` → `nettoyerRaisonnement` + `lireJSON` s'en chargent comme aujourd'hui. On prévoit donc un retry 400 si réponse format 400.
- **Backward compatible :** tous les essais existants dans la base ont potentiellement des clés FR ; le viewer essaiToResultat dans `progression/essai/[id]` applique la normaliseur client (fallback multi-clés), donc pas de risque d'affichage.
- **Prompt admin UI :** l'utilisateur peut aller dans ⚙ Admin, voir les nouvelles règles A15–A20, éditer, Enregistrer → ça écrase DB prompts_main JSONB et le prend immédiatement en compte au prochain POST corriger.

## Validation (après implémentation)

1. **TS strict** : 0 erreur.
2. **Build** : routes green.
3. **Smoke test shell** `/tmp/test_norm_layer_v2.mjs` : 9 assertions (comme session précédente) + 3 nouvelles assertions clés :
   - (#10) Objet final ne contient AUCUNE clé FR (axes_amelioration/points_forts/…)
   - (#11) example_responses.length === 3
   - (#12) example_responses a les 3 niveaux distincts B1, B2, C1 (pas B1+)
4. **Visuel navigateur** : corriger une copie avec `minimax/minimax-m3:free` OU (si crédits insuffisants) un modèle `nousresearch/hermes-4-llama-3.1-8b:free` (supporte json_object) → les 10 sections apparaissent en place, AUCUNE placeholder dashed-card si le modèle a répondu correctement. Si le modèle est vraiment petit et répond rien, les placeholders restent (comportement acceptable, on prévient l'user).

## Risques & Gestion

1. 🟡 Risque MINEUR — response_format 400 sur des modèles gratuits. **Gestion :** retry automatique sans response_format dans appelOpenRouter (silencieux, aucune ex user).
2. 🟡 Risque MINEUR — utilisateur a un prompt admin déjà enregistré dans `prompts_main` JSONB (pas null/undefined). Par défaut `prompts.ts corriger/route.ts line 280-283` override DEFAULTS par DB prompts_main si non null. Donc prompt enregistré écrase notre nouvelle version. **Gestion :** dans l'Admin UI, on affichera un bandeau visuel si hash du prompt != hash du nouveau DEFAULTS. Option plus simple : on l'indique à l'user explicitement dans la réponse finale ("⚠ Si tu as déjà enregistré un prompt custom dans ⚙ Admin → Réinitialiser puis Enregistrer pour charger la nouvelle version avec A15-A20."). On implémente juste le message, pas bandeau UI.
3. 🟢 Faible — Schéma fermé purge étape D3 peut retirer par erreur une clé qui aurait dû être gardée. **Gestion :** on liste explicitement toutes les clés de CorrectionResult (24), pas de vague. Test du script smoke avec toutes les 24 clés.
