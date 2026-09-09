# Tasks · Knowledge Base TCF Canada (Tâche 1 + Tâche 3)

> Dossier `.trae/specs/connaissance-tcf-canada/`
> Parent: `spec.md`
> Plan-only document: pas d'implémentation avant approbation utilisateur.
> Toutes les tâches ont un ID stable `T##` (T1, T2, ...) et héritent d'ACs du spec.

---

## Règles d'ordre (DAG des dépendances)

```
T1 (Migration 006 table)
  └─▶ T2 (Seed 007 SQL 12 blocs exacts PDF)
       └─▶ T3 (GET /api/connaissance route)
            ├─▶ T4 (helpers checklist + T3 formules 18
            │       dans lib/heuristiques/taches.ts)
            ├─▶ T5 (A21 prompt rules injection +
            │       admin parametres sync byte-for-byte)
            │        └─▶ T9 (build green + typecheck)
            └─▶ T6 (BaseConnaissanceSidebar React)
                 ├─▶ T7 (PanneauLive checklist)
                 └─▶ T8 (NavLaterale + page.tsx accordéon)
                        └─▶ T9 build green
                               └─▶ T10 Verification runbooks + smoke
```

* * *

## Task 1: Migration SQL 006 — créer `base_connaissances_tcf` + RLS

| Champ | Valeur |
|---|---|
| ID | **T1** |
| Priorité | **HIGH** — toute feature en dépend |
| Dépendances | Aucune (première) |
| Bloque | T2, T3 |
| ACs parent | AC-R1, NF6, NF9 |

### Objectif

Créer la table stockant 12 blocs (6 T1, 6 T3) issus des fiches PDF, son enum `bloc_type`, et les policies RLS.

### What / Where

-   **Fichier**: [supabase/migrations/006_base_connaissances_tcf.sql](file:///Users/kevche_mini/TFC%20App/supabase/migrations/006_base_connaissances_tcf.sql)

### Contraintes

1.  **Doit être idempotent (NF6)**: `CREATE TABLE IF NOT EXISTS`.
2.  **Enum `bloc_type`**: `CREATE TYPE ... AS ENUM (…)` avec check ou DO block pour éviter échec si déjà créé.
3.  **RLS**: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
    -   Policy `anon_select_actif`: `SELECT` anon WHERE `actif = true`.
    -   Policy `service_role_all`: `service_role` a SELECT INSERT UPDATE DELETE sans restriction.
4.  Colonnes: `id UUID PK gen_random_uuid()` · `created_at timestamptz now()` · `tache_num SMALLINT CHECK (tache_num IN (1,2,3))` · `slug TEXT UNIQUE` · `bloc_type base_connaissance_bloc_type NOT NULL` · `titre TEXT NOT NULL` · `description TEXT` (optionnel) · `contenu_markdown TEXT NOT NULL` · `ordre INTEGER NOT NULL` · `actif BOOLEAN DEFAULT true NOT NULL`.
5.  **Index**: `idx_bc_tache_ordre` sur `(tache_num, ordre)`.

### Test Requirements (TRs)

| ID | Type | Vérification |
|---|---|---|
| T1-TR1 | **rule** | Dans Supabase SQL Editor RUN le fichier 1x → sortie "Success, no rows". RUN une 2e fois immédiatement → "Success" (pas de "relation exists", pas de "enum already exists"). |
| T1-TR2 | **rule** | `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='base_connaissances_tcf' ORDER BY ordinal_position;` → renvoie EXACTEMENT les 10 colonnes listées. |
| T1-TR3 | **rule** | `SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE tablename='base_connaissances_tcf';` → 2 policies, roles `anon` + `service_role`. |

---

## Task 2: Seed SQL 007 — 12 blocs exacts depuis les 5 captures PDF

| Champ | Valeur |
|---|---|
| ID | **T2** |
| Priorité | **HIGH** |
| Dépendances | T1 terminé |
| Bloque | T3, T6 |
| ACs parent | AC-R1, AC-U3 (rubrique 2/2 si match 100%) |

### Objectif

Remplir la table avec le contenu exact **texte brut** de chacune des fiches PDF (pas de résumé).

### Liste des 12 blocs à insérer (ordre)

| Ordre | `tache_num` | `bloc_type` | `slug` | Titre |
|---|---|---|---|---|
| 1 | 1 | **objectif** | `t1-objectif` | "Tâche 1 · Message, courriel ou annonce 60-120" |
| 2 | 1 | **squelette** | `t1-squelette-amical` | "Amical · Début / Milieu / Fin" |
| 3 | 1 | **squelette** | `t1-squelette-formel` | "Formel · Début / Questions / Fin" |
| 4 | 1 | **connecteurs** | `t1-connecteurs-minimum` | "Connecteurs minimum" |
| 5 | 1 | **exemple** | `t1-exemples-salutations` | "Exemples de salutations Amical vs Formel" |
| 6 | 1 | **checklist** | `t1-checklist-officielle` | "Vérification — 5 cases (Destinataire · Motif · 2-3 détails · Demande/attente · Formule fin · 60-120 mots)" |
| 7 | 3 | **objectif** | `t3-objectif` | "Tâche 3 · Comparer 2 opinions + donner son avis — 120-180 mots · 2 parties" |
| 8 | 3 | **squelette** | `t3-schema-retenir` | "Schéma à retenir — 7 rows · Mémoire: ILS PENSENT → ILS NE SONT PAS D'ACCORD → MOI JE PENSE → POURQUOI 1 → POURQUOI 2 → CONCLUSION" |
| 9 | 3 | **squelette** | `t3-partie1-deux-opinions` | "Partie 1 · Les Deux Opinions (40-60 mots) · ⚠️ TRÈS IMPORTANT rose + Extrait exemple bleu ciel Télétravail" |
| 10 | 3 | **squelette** | `t3-partie2-mon-avis` | "Partie 2 · Ton Opinion (80-120 mots) · Formule magique verte: AVIS→ARG→EX→ARG→NUANCE→CONCLUSION + Exemple Télétravail" |
| 11 | 3 | **connecteurs** | `t3-connecteurs-6categories` | "Connecteurs à connaître · 6 catégories × 3 = 18" |
| 12 | 3 | **checklist** | `t3-checklist-derniere-verification` | "Dernière vérification · 6 cases · 2 reformulées · Avis · 2 arguments · Exemple · Conclusion · 120-180" |

### Contraintes

1.  **Idempotence NF6**: Tout bloc commencer par `DELETE FROM base_connaissances_tcf WHERE slug='…';` avant `INSERT` (pas `ON CONFLICT` sur slug, plus simple sans id uuid aléatoire fixe).
2.  **Champ `contenu_markdown`** copie le contenu PDF avec marqueurs markdown simples :
    -   Titres colonnes fiches → `## PARTIE · CE QUE TU ÉCRIS`
    -   Les 6 cases Amical/Formel → table markdown `| AMICAL - DÉBUT | Salut [Prénom], … |`
    -   `⚠️ TRÈS IMPORTANT` rose → blocquote `> ⚠️ **TRÈS IMPORTANT** : … `
    -   **18 connecteurs** → listes `1. POUR COMPARER: En revanche / À l'inverse / Tandis que`
3.  Les exemples télétravail (Partie 1 / Partie 2 vert) sont inclus textuellement (identiques PDF).

### Test Requirements

| ID | Type | Vérification |
|---|---|---|
| T2-TR1 | **rule** | `SELECT tache_num, count(*), array_agg(slug ORDER BY ordre) FROM base_connaissances_tcf GROUP BY tache_num;` → T1 count 6 slugs 6 listés · T3 count 6 slugs 6 listés · Total rows = 12 |
| T2-TR2 | **rule** | RUN `007` 2× dans SQL Editor → count reste 12 (pas 24), pas de doublons. |
| T2-TR3 | **rubric** (AC-U3) | Check 2 cases checklists vertes + règle rose texte exact match PDF = 2/2. 1 case omise = 1/2 ; ≥2 = 0. |

---

## Task 3: Route API GET `/api/connaissance`

| Champ | Valeur |
|---|---|
| ID | **T3** |
| Priorité | **HIGH** |
| Dépendances | T1, T2 |
| Bloque | T6 (sidebar fetch) |
| ACs parent | AC-R2, NF5 (audit sécurité 10×), AC-R9 |

### Objectif

Route Server Component `app/api/connaissance/route.ts` qui retourne JSON trié par `ordre` des blocs `actif=true`.

### File

-   [app/api/connaissance/route.ts](file:///Users/kevche_mini/TFC%20App/app/api/connaissance/route.ts) (nouveau)

### Détails

1.  Importer `createClient` depuis `@/lib/supabase/server` (server.ts, **service_role**).
2.  Query param `tache` accepte `"1"|"2"|"3"` ; si absent → tout (sans filtre). Si valeur invalide (ex: `?tache=4`) → 400 JSON `{erreur:"tache invalide: attendu 1|2|3"}`.
3.  Requête Supabase: `SELECT * FROM base_connaissances_tcf WHERE (tache_num = $1 OR $1 IS NULL) AND actif = true ORDER BY tache_num ASC, ordre ASC`.
4.  Response headers:
    -   `Content-Type: application/json; charset=utf-8`
    -   `Cache-Control: s-maxage=60, stale-while-revalidate=300` (NF8).
5.  Try/catch: erreur Supabase → HTTP 500 JSON `{erreur:"serveur", detail: e.message}` — MAIS **JAMAIS inclure `process.env` ou credentials dans detail**. NF5: dans catch, filtrer toute sous-chaîne contenant `eyJ` (JWT Supabase) / `sk-or-v1-` (OpenRouter) avant JSON.stringify.

### Test Requirements

| ID | Type | Vérification |
|---|---|---|
| T3-TR1 | **rule** | `curl -s "http://localhost:3000/api/connaissance?tache=1" \| jq 'length'` → 6 ; `?tache=3` → 6 ; pas de param → 12 |
| T3-TR2 | **rule** | `curl -s "http://localhost:3000/api/connaissance?tache=4" \| jq '{code:.erreur}'` → contient "tache invalide" + HTTP 400. |
| T3-TR3 | **rule** (AC-R9) | `for i in $(seq 1 10); do curl -s http://localhost:3000/api/connaissance ; done \| grep -iE 'SUPABASE|sk-or|service_role' \| wc -l` → **ZÉRO**. |
| T3-TR4 | **rule** | Header `Cache-Control` dans `curl -I …/api/connaissance` contient `s-maxage=60`. |

---

## Task 4: Helpers Tâches — 18 connecteurs T3 + 2 checklists officielles

| Champ | Valeur |
|---|---|
| ID | **T4** |
| Priorité | **HIGH** |
| Dépendances | Aucun (fichiers lib indépendants) |
| Bloque | T5 (prompt A21), T7 (PanneauLive), T6 sidebar cases vertes |
| ACs parent | AC-R7, AC-R6 |

### Objectif

Dans `lib/heuristiques/taches.ts`:
1.  Exporter `CONNECTEURS_T3_GROUPE: Record<string, string[]>` 6 catégories × 3 = 18.
2.  **Remplacer** `TACHES[3].formules` (string[] plat, rétro-compat NF7) par les 18 éléments décomposés.
3.  Exporter **2 nouveaux helpers**: `checklistOfficielleT1(txt: string): [label, ok, aide][]` retourne 5 tuples · `checklistOfficielleT3(txt: string): [label, ok, aide][]` retourne 6 tuples (cases vertes PDF exactes + regexes basées sur `structure()` existant).

### Where

-   Fichier existant déjà: [lib/heuristiques/taches.ts](file:///Users/kevche_mini/TFC%20App/lib/heuristiques/taches.ts) — éditer sans toucher les fonctions `motsDe` / `couperT3` / `structure`.

### 18 connecteurs exacts à mettre (catégories PDF Page 8)

| Catégorie | 3 connecteurs |
|---|---|
| **POUR COMPARER** | `En revanche`, `À l'inverse`, `Tandis que` |
| **POUR AJOUTER** | `Tout d'abord`, `De plus`, `En outre` |
| **POUR EXPLIQUER** | `En effet`, `Car`, `Parce que` |
| **POUR DONNER UN EXEMPLE** | `Par exemple`, `Notamment`, `Par exemple,` (ok doublon ponctuation, garder 2) |
| **POUR NUANCER** | `Cependant`, `Pourtant`, `Néanmoins` |
| **POUR CONCLURE** | `Pour conclure`, `En somme`, `Finalement` |

> Ajustement: `Par exemple` apparaît 2 fois dans PDF (ligne 4). On garde "Par exemple", "Notamment", "À savoir" comme 3ème pour obtenir 18.

### Helpers checklist 5 cases T1:

1.  `Destinataire`: regexes `Salut [A-Z]|Bonjour (Madame|Monsieur|Cher|Chère)`.
2.  `Motif`: regex `(je t'écris|je vous écris) pour`.
3.  `2-3 détails concrets`: `motsDe(txt) >= 45` + présence QQOQCCP min 3.
4.  `Demande / attente`: `j'aimerais|pourriez-vous|attends de ta part`.
5.  `Formule de fin + 60-120`: `(à bientôt|cordialement|amicalement)` + `motsDe` dans [60,120].

### Helpers checklist 6 cases T3 (Dernière vérification Page 8):

1.  `2 opinions reformulées`: présence des marqueurs `premier document` + `second document` OU bien `Certains … Par contre d'autres …`.
2.  `Avis clair`: Opinion RE match (déjà `OPINION_RE`).
3.  `2 arguments`: 2x `Tout d'abord|De plus|En outre|En effet` dans partie 2.
4.  `Exemple`: `Par exemple|Notamment|À savoir`.
5.  `Conclusion`: `Pour conclure|En somme|Finalement|En définitive`.
6.  `120-180 mots`: `motsDe` dans [120, 180].

Et **ajouter un 7ème tuple optionnel couleur ROSE AVERTISSEMENT** *"⚠️ Partie 1: aucun « je pense » / argument personnel / copié-collé des docs"* — utilise négatif regex test sur txt prefix 60 premiers mots.

### Test Requirements

| ID | Type | Vérification |
|---|---|---|
| T4-TR1 | **rule** AC-R7 | `TACHES[3].formules.length === 18` + `Set(TACHES[3].formules).size === 18`. |
| T4-TR2 | **rule** | `CONNECTEURS_T3_GROUPE` Object.keys length === 6 · each value length === 3 · total entries 18. |
| T4-TR3 | **rule** AC-R6 | Copier texte Bernard marché Sami Fruits T1 de la spec (98 mots) → `checklistOfficielleT1(txt).filter(([,ok]) => ok).length === 5`. |
| T4-TR4 | **rule** AC-R6 | Concaténer l'exemple Télétravail T3 Partie 1 + Partie 2 des fiches → `checklistOfficielleT3(txt).filter(([,ok]) => ok).length === 6`. |
| T4-TR5 | **rule** | `checklistOfficielleT3(txtPartie1Seulement)` 7ᵉ tuple (⚠️ rose) retourne `[label, true, …]` (car Partie 1 n'a pas je/pense). |

---

## Task 5: Prompt A21 injecté — `prompts.ts` + `admin/parametres` sync

| Champ | Valeur |
|---|---|
| ID | **T5** |
| Priorité | **HIGH** |
| Dépendances | T4 checklists (on réutilise les textes pour écrire AC-U3 rubrique A21 en string) |
| Bloque | T9 build green |
| ACs parent | AC-R5, AC-U3 (rubrique 2/2 si match) |

### Objectif

Insérer section **A21 · Référentiel Connaissance officielle TCF Canada** EN-TÊTE DES RÈGLES (toujours après A20, avant A12 — comme dit C1). Synchro byte-for-byte:

1.  [lib/llm/prompts.ts](file:///Users/kevche_mini/TFC%20App/lib/llm/prompts.ts) `DEFAULTS.invite_correction`
2.  [app/admin/parametres/page.tsx](file:///Users/kevche_mini/TFC%20App/app/admin/parametres/page.tsx) `DEFAULT_PROMPTS.invite_correction`

### Contraintes

-   **C1 (ne touche pas A15-A20)** ; l'ordre après insertion doit être: `A14…A15, A16, A17, A18, A19, A20, A21, A12…`.
-   Échappement backtick triple `\`\`\`` idéalement déjà fait comme pré-requis. Vérifier TS compile après insertion (traitée dans T9).
-   Texte A21 contient EXACTEMENT:
    > *"A21. RÉFÉRENTIEL CONNAISSANCE OFFICIEL · Checklist T1 5 cases (Destinataire/Motif/2-3 détails concrets/Demande-attente/Formule fin + 60-120 mots) ; Checklist T3 6 cases (2 opinions reformulées/Avis/2 arguments/Exemple/Conclusion/120-180 mots) + RÈGLE ROSE PARTIE-1: « Dans la Partie 1 Tâche 3, ne pas écrire « je pense », ne pas avancer d'argument personnel, ne pas copier-coller des documents. » Tu pénaliseras dans les axes d'amélioration si ces règles sont enfreintes."*

### Test Requirements

| ID | Type | Vérification |
|---|---|---|
| T5-TR1 | **rule** AC-R5 | `grep -n "A21 · Référentiel\|A21. RÉFÉRENTIEL" lib/llm/prompts.ts app/admin/parametres/page.tsx \| wc -l` → exactement 2. |
| T5-TR2 | **rule** | Extraire sous-chaîne A21 dans les 2 fichiers ; `diff` entre eux (sans whitespace) → `exit 0`. |
| T5-TR3 | **rubric** AC-U3 | A21 checklist T1 5 cases match PDF = 2/2 (0 manquant = 2 ; 1 manquant = 1 ; 2+ manquant = 0). |

---

## Task 6: Composant React `BaseConnaissanceSidebar.tsx`

| Champ | Valeur |
|---|---|
| ID | **T6** |
| Priorité | **HIGH** |
| Dépendances | T2 (seed 12 blocs texte), T3 (API route), T4 (connecteurs checklists) |
| Bloque | T8 (intégration dans page.tsx), T9 build |
| ACs parent | AC-U1 (rubrique WCAG 2/2), AC-U2 (accordéon 2/2), AC-R8 (badge rose TRÈS IMPORTANT) |

### Objectif

Composant TS `components/expression-ecrite/BaseConnaissanceSidebar.tsx`. Props: `tache: 1|2|3`.

### Détails UI

1.  **Fetch via useEffect**: `GET /api/connaissance?tache=${tache}` JSON → useState `blocs`.
2.  **Wrapper accordéon**:
    -   Header fermé par défaut: `📚 Fiche officielle · Tâche ${N} ▸`, click → ouvre en `< 300 ms` (CSS transition max-height).
    -   Palette **bureau-beige `--color-papier`** (pas sombre).
3.  **Layout T1 (6 blocs)**: stack vertical — Objectif · Squelettes Amical/Formel 2 colonnes md · Connecteurs minimum · Exemples · Checklist officielle (5 badges verts/amber).
4.  **Layout T3 (6 blocs)**: tabs `[Schéma, Partie 1, Partie 2 + Connecteurs + Vérification]` 3 onglets, Tailwind `rounded-t-md border-b border-gray-300`.
5.  **Markdown léger inline (NF3)**: `utils/markdownLite.ts` < 50 lignes, regex → handle `# / ## / ###`, `- * 1.` listes, `**gras**`, `> quote`, tableaux simples `| a | b |`. Pas de dépendance `react-markdown` (NF3, AC-R10).
6.  **Badge rose TRÈS IMPORTANT (AC-R8)** dans onglet Partie 1: `style="background:rgba(239,143,160,.11);color:#A83C14;border:1px solid rgba(239,143,160,.28)"`.
7.  **Responsive mobile < 768 px**: devient une sheet bas plein écrant animée, pas de sidebar droite.
8.  TS strict: `blocs typed: Array<{slug, bloc_type, titre, description, contenu_markdown, ordre}>`.

### Test Requirements

| ID | Type | Vérification |
|---|---|---|
| T6-TR1 | **rule** | Build TS `npx tsc --noEmit` exit 0 (réussi à T9). |
| T6-TR2 | **rule** AC-R8 | Dans browser devtools "Inspect" sur Partie 1 badge TRÈS IMPORTANT → background contient `rgba(239,143,160,.11)` · color = `#A83C14`. |
| T6-TR3 | **rubric** AC-U1 (WCAG) | Calcul CR = ratioContrast(texte, fond-papier) · moyenne des 3 endroits (texte T1 checklist, onglet labels, badge rose) → **score 2 si ≥ 4.7, 1 si 4.0-4.7, 0 si < 4.0**. |
| T6-TR4 | **rubric** AC-U2 (accordéon) | Mesurer décalage PanneauLive (hauteur en px) AVANT clic ouverture sidebar · APRÈS ouverture · diff ≤ 30 px · pas de saut vertical gênant = 2. |
| T6-TR5 | **rule** NF3 | `git diff --cached package.json` 0 lignes modif. `npm ls react-markdown remark-gfm marked` → all "(empty)". |

---

## Task 7: PanneauLive ajoute blocs "Checklist officielle" T1 / T3

| Champ | Valeur |
|---|---|
| ID | **T7** |
| Priorité | MEDIUM |
| Dépendances | T4 helpers OK |
| Bloque | T9 build |
| ACs parent | AC-R6 |

### Where

-   [components/expression-ecrite/PanneauLive.tsx](file:///Users/kevche_mini/TFC%20App/components/expression-ecrite/PanneauLive.tsx)

### Change

-   Sous le bloc `structure()` existant, **ajouter un sous-bloc `<h4>✅ Checklist officielle</h4>`** avec conditionnel `tache === 1 → checklistOfficielleT1` / `tache === 3 → checklistOfficielleT3` (T2 ne rend rien).
-   Chaque ligne badge: fond `rgba(60,207,145,.11)` si ok, `rgba(232,168,60,.10)` si amber. Icônes vert ✅ / amber ⚠️. 7ᵉ ligne T3 rose avertissement si ok = faux (utilisateur a écrit "je pense" dans Partie 1) alors fond rouge `rgba(239,143,160,.11)` + icône ❌.

### TRs

| ID | Type | Vérification |
|---|---|---|
| T7-TR1 | **rule** AC-R6 | Coller Bernard marché 98 mots T1 → 5 badges verts. |
| T7-TR2 | **rule** AC-R6 | Coller concat Partie1+Partie2 Télétravail T3 → 6 badges verts. |

---

## Task 8: Intégration — page expression-ecrite + NavLaterale entrée

| Champ | Valeur |
|---|---|
| ID | **T8** |
| Priorité | HIGH |
| Dépendances | T6, T7 |
| Bloque | T9 build |
| ACs parent | AC-U2 (accordéon non-intrusif), F5 + F9 |

### Changes 2 fichiers:

#### A. `app/expression-ecrite/page.tsx` (F5)
-   Importer `BaseConnaissanceSidebar`.
-   Sous `<PanneauLive erreurs tache nMots dansCible …>` ajouter `<BaseConnaissanceSidebar tache={tacheActive} />` **accordéon fermé par défaut**.
-   Si `tab` = `?tab=connaissance` → ouvrir accordéon + appliquer classe `lg:fixed lg:right-0 lg:top-24 lg:bottom-8 lg:w-[480px] z-30`.

#### B. `components/NavLaterale.tsx` (F9)
-   Nouvelle ligne dans menu "Expression Écrite" → **`📚 Base Connaissance`** → lien `/expression-ecrite?tab=connaissance`.

### Test Requirements

| ID | Type | Vérification |
|---|---|---|
| T8-TR1 | **rule** | `NavLaterale` render HTML contient `Base Connaissance` · lien contient `?tab=connaissance`. |
| T8-TR2 | **rule** AC-U2 | Ouvrir `/expression-ecrite` → hauteur initiale page (avant clic éditor) ≈ pré-T8 (+0-20 px). |
| T8-TR3 | **rule** | Ouvrir `/expression-ecrite?tab=connaissance` → sidebar s'ouvre directement. |

---

## Task 9: TypeScript strict + Build vert + migrations smoke

| Champ | Valeur |
|---|---|
| ID | **T9** |
| Priorité | **BLOQUANT** |
| Dépendances | T1-T8 complétés |
| Bloque | T10 vérification |
| ACs parent | AC-R3, AC-R4 |

### Étapes à exécuter SÉQUENTIELLEMENT, exit non-0 = T9 `in_progress` reste

```bash
# 9a. TS strict
cd "/Users/kevche_mini/TFC App"
npx tsc --noEmit            # attendu exit 0, 0 err, 0 warn

# 9b. Next build
npm run build               # attendu Next 15: 10 static + 13 dynamic (23 routes) green

# 9c. Audit sécurité package.json pas nouvelles deps (AC-R10)
git diff --cached package.json | grep -E "^\+" | grep -E "dependenc" || echo "OK"

# 9d. (Optionnel, si CLI installé) Lint migrations + SQL
# Pour le moment: vérif manuellement 006/007 RUN 2× dans dashboard
```

### Test Requirements

| ID | Type | Vérification |
|---|---|---|
| T9-TR1 | **rule** AC-R3 | `npx tsc --noEmit` exit 0. |
| T9-TR2 | **rule** AC-R4 | `npm run build` exit 0 · stdout contient `ƒ /api/connaissance` ligne dynamic. |
| T9-TR3 | **rule** AC-R10 | Diff `package.json` 0 modif dependencies. |

---

## Task 10: Runbook vérification final + Smoke AC-U1/U2/U3 (visuel)

| Champ | Valeur |
|---|---|
| ID | **T10** |
| Priorité | HIGH |
| Dépendances | T9 vert |
| Bloque | Aucun (dernière) |

### Étapes (navigateur)

1.  `npm run dev` sur :3000.
2.  Appliquer 006 + 007 dans Supabase SQL Editor (si nouveau projet).
3.  Aller `/expression-ecrite` → T1 → voir accordéon `📚 Fiche officielle · Tâche 1` (AC-U2). Ouvrir. Vérifier 5 blocs. Calculer CR sur 3 emplacements (AC-U1).
4.  Coller texte Bernard Sami Fruits (98 mots). Voir PanneauLive checklist 5 badges verts (AC-R6).
5.  Switch Tâche 3 → ouvrir accordéon → onglet Schéma, Partie1 (badge rose TRÈS IMPORTANT, AC-R8), Partie2.
6.  Coller Partie1+Partie2 Télétravail → PanneauLive 6 badges verts + badge ⚠ Partie1 pas de "je pense".
7.  Aller `/admin/parametres` → login → confirm textarea prompt contient `A21. RÉFÉRENTIEL`. Clic Enregistrer (1 clic op obligatoire utilisateur).
8.  (Si OpenRouter crédits) → Corriger une copie et vérifier la section "Areas for Improvement" mentionne 1 règle checklist si violée.

### Test Requirements

| ID | Type | Vérification |
|---|---|---|
| T10-TR1 | **rubric** AC-U1 moyenne CR · score final ≥ 1.5/2. |
| T10-TR2 | **rubric** AC-U2 accordéon intrusif · score final ≥ 1.5/2. |
| T10-TR3 | **rubric** AC-U3 prompt A21 checklist texts match PDF ≥ 1.5/2. |

* * *

## Audit de couverture AC → Tasks

| AC | Tâches |
|---|---|
| AC-R1 | T1, T2 |
| AC-R2 | T3 |
| AC-R3 | T9 |
| AC-R4 | T9 |
| AC-R5 | T5 |
| AC-R6 | T4, T7, T10 |
| AC-R7 | T4 |
| AC-R8 | T6 |
| AC-R9 | T3 |
| AC-R10 | T6, T9 |
| AC-U1 | T6, T10 |
| AC-U2 | T6, T8, T10 |
| AC-U3 | T2, T5, T10 |
| NF1 | T9 |
| NF2 | T9 |
| NF3 | T6, T9 |
| NF4 | T6, T10 |
| NF5 | T3 |
| NF6 | T1, T2 |
| NF7 | T4 |
| NF8 | T3, T6 |
| NF9 | T1, T2 |
