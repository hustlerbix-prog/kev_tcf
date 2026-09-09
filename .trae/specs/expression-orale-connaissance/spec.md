# Spécification — Base de Connaissances TCF Canada : Extension Expression Orale (EO)

*Code reference spec mode for user request: « more » + 4 screenshots PDF TCF Canada Expression Orale Sujet d'actualité Septembre 2026 — Tâche 2 : conseils installation / santé / Nouvel An / emploi / végétarien / fête école / logement — Tâche 3 : 8 sujets débat (téléphone, éducation autoritaire, immigrés, animaux, bonheur travail, lecture, vie seule, manger équilibré) — Tâche 2 corrections 20 questions — Tâche 3 exemple manger équilibré 7 paragraphes.*

## 1. Problème, Utilisateurs, Objectifs

### 1.1 Problème actuel
La base de connaissances actuelle (migration 006/007) ne contient que les fiches **Expression Écrite** (EE T1 & T3). Les élèves n'ont pas de support consultatif, ni de checklist live, ni de référentiel LLM pour l'**Expression Orale** (EO), bien que la table `competences` 001 soit prévue pour être extensible (EE / EO / CE / CO).

Les 4 images ajoutées contiennent : **7 scénarios Tâche 2 (jeu de rôle conversationnel)** ; **8 sujets Tâche 3 (débat argumentatif)** ; **20 questions « Corrections » type (entretien)** ; et **1 exemple complet Tâche 3 « manger équilibré »** (7 paragraphes ~650 mots).

### 1.2 Utilisateurs
- Élève préparant TCF Canada : consultation fiches EO dans la sidebar accordéon, visualisation sujets Septembre 2026, checklist structure conversation.
- Correcteur LLM : injection section A22 référentiel EO dans `invite_correction` pour évaluer la structure Tâche 2 / Tâche 3 orale (si un jour on connecte EO à LLM — hors scope, mais référentiel préparé).
- Admin : édition depuis UI `/admin/parametres` prompts + éventuel seed idempotent.

### 1.3 Objectifs mesurables
1. Ajouter colonne `competence_code` (FK→competences.code) à la table `base_connaissances_tcf`, valeur par défaut `'EE'` pour 12 blocs existants (rétrocompatibilité parfaite, 0 régression EE).
2. Insérer **19 blocs nouveaux EO** (6 Tâche 2 + 8 Tâche 3 + 2 corrections + 1 exemple + 1 objectif + 1 connecteurs oraux) dans `base_connaissances_tcf` via seed idempotent `009`.
3. Adapter `GET /api/connaissance` pour accepter un paramètre `competence=EE|EO` (défaut `EE` si absent ; rétro 100% EE).
4. Adapter `BaseConnaissanceSidebar` pour accepter `competence` en props + onglets Tâche 2 (7 scenarios) / Tâche 3 (8 sujets) / Corrections (20 questions).
5. Ajouter section menu **🎙 Expression Orale** sous **🖋 Expression Écrite** dans `NavLaterale` (collapse par défaut, 2 entrées : `└ 📚 Fiches` → `/expression-orale?tab=connaissance` ; `└ 💬 Tous les sujets` → placeholder future page).
6. Zéro nouvelle dépendance npm. Même parser `markdownLite.ts`.
7. **Rétrocompatibilité 100% EE** : anciens 12 blocs (007 seed) marquent `competence_code='EE'` implicitement par défaut colonne ; calls `?tache=1` sans param competence → toujours EE.

### 1.4 Non-objectifs (CONFIRMÉS, hors scope)
- ❌ Intégration LLM en direct pour l'Expression Orale (pas de POST /api/corriger-oral)
- ❌ Nouvel éditeur spécifique EO (la sidebar de fiches est affichée sur une page `/expression-orale` placeholder avec instructions)
- ❌ Ajout de colonne `competence` à `essais_expression_ecrite` (table EE reste dédiée EE)
- ❌ Tâche 1 Expression Orale (non présente dans les sources PDF uploadées)
- ❌ Export PDF fiches (Q1 default NON)
- ❌ Multi-utilisateur auth (pas dans scope)

## 2. Exigences Fonctionnelles (FR)

### FR-1 : Compétence multi — Schema Postgres
- La table `base_connaissances_tcf` reçoit une colonne `competence_code TEXT` :
  - Contrainte FK REFERENCES `competences(code)` ON DELETE RESTRICT
  - DEFAULT `'EE'` pour les 12 blocs existants 007 seed (pas de réécriture seed 007).
  - RLS policies existantes restent valides (vu que SELECT anon where actif = TRUE).
- Index `idx_bc_tache_ordre` remplacé par `idx_bc_comp_tache_ordre (competence_code, tache_num, ordre)`.
- Contrainte UNIQUE slug reste intacte (slugs EO préfixés `eo-*` ; aucun conflit).
- Migration **008** (ALTER + FK + index), **idempotente** via `IF NOT EXISTS / DO $$` pour colonne et FK.

### FR-2 : Seed idempotent Expression Orale — Migration **009**
- Insérer **au minimum 19 blocs EO** (DELETE WHERE slug LIKE 'eo-%' + INSERT dollar-quoted $bc$ pour apostrophes natives — v2 pattern 007 réutilisé) :
  1. `eo-objectif` → Objectif TCF Canada Expression Orale (3 épreuves non : T1 image, T2 dialogue, T3 exposé/débat)
  2. `eo-t2-schema` → Schéma Tâche 2 (structure conversation : salutation → sujet principal 4-5 échanges → approfondissement → conclusion)
  3. `eo-t2-scenario-installation` → scénario #1 "conseils installation ville" (texte exact 1ère image, Tâche 2 première vignette)
  4. `eo-t2-scenario-sante` → scénario #2 "tomber malade pays" (vignette 2)
  5. `eo-t2-scenario-nouvelan` → scénario #3 "Nouvel An Canada" (vignette 3 img 3)
  6. `eo-t2-scenario-emploi` → scénario #4 "travailler été Canada"
  7. `eo-t2-scenario-vegetarien` → scénario #5 "ami végétarien voyage affaires"
  8. `eo-t2-scenario-fete-ecole` → scénario #6 "fête école première fois"
  9. `eo-t2-scenario-logement` → scénario #7 "louer logement grande ville"
  10. `eo-t2-corrections-installation` → 10 questions Corrections (1ère image, liste 1-10 : arrivé depuis quand / impressions / logement quartier / conseils appart / démarches / documents / transports / courses / proximité / loisirs)
  11. `eo-t2-corrections-sante` → 10 questions (1ère image, 2e liste 1-10 : système santé / premier malade / RDV médecin / types médecins / consultation / gratuit ou payant / hôpital / urgences / urgence grave / pharmacies)
  12. `eo-t3-objectif-schema` → Objectif Tâche 3 + Schéma (Annonce → Thèse → 2 arguments + exemples → Nuance → Conclusion ; ~12-15 parlé)
  13. `eo-t3-sujet-telephone` → débat #1 "changer souvent téléphone portable" (img 4, 1er sujet)
  14. `eo-t3-sujet-autorite` → débat #2 "être autoritaire éduquer enfant"
  15. `eo-t3-sujet-immigres` → débat #3 "immigrés connaître pays accueil"
  16. `eo-t3-sujet-animaux` → débat #4 "protéger tous animaux danger"
  17. `eo-t3-sujet-bonheur-travail` → débat #5 "plus important : heureux au travail"
  18. `eo-t3-sujet-lecture` → débat #6 "lire perte temps"
  19. `eo-t3-sujet-vie-seule` → débat #7 "peut-être heureux vie seul"
  20. `eo-t3-sujet-manger-equilibre` → débat #8 + EXEMPLE COMPLET ~650 mots (img 2 texte intégral 7 paras)
  21. `eo-connecteurs-oraux` → 18 connecteurs oraux (reuse 18 EE + spécifiques oral : *"Écoute…", "Ben…", "Dis donc…", "Franchement…", "Justement…", "Après…", "En même temps…", "Enfin bref…"* — 12 ajoutés, 30 connecteurs oraux totaux organisés : INTRO | AJOUT | NUANCE | CONCLUSION | MARQUEURS HÉSITATION ORALE)
- **Total minimum = 21 blocs EO** (au lieu de 19, car scenario 7 s'étend + exemple complet + schema objectif double T2/T3).
- Bloc `competence_code='EO'` sur TOUS les INSERT 009.
- `tache_num` : T2 scenarios/corrections → 2 ; T3 objectifs/sujets/exemples → 3 ; eo-objectif général → tache_num=NULL (TODO: mieux, tache_num=0 ou CHECK tache_num IN (0,1,2,3) ? Answer: étendre CHECK à tache_num IN (0,1,2,3) dans migration 008 — 0 = "compétence générale").

### FR-3 : API `GET /api/connaissance` — paramètres nouveaux
- Paramètre **`competence=EE|EO`** (défaut = `'EE'` si absent). Tout autre valeur → HTTP 400 `{erreur:'competence invalide'}`.
- Paramètres actuels `?tache=1|2|3` restent inchangés, filtrage combiné :
  - `?competence=EO` → tous blocs EO (tous tache_num)
  - `?competence=EO&tache=2` → scenarios + corrections T2
  - `?competence=EO&tache=3` → objectif sujet + 8 débats + exemple
- Sanitizer 5 SECRET_PATTERNS réutilisé identique NF5.
- Cache 60s réutilisé identique.
- Type TS `BlocConnaissance` reçoit champ `competence_code?: string` (optionnel pour rétro EE, requis côté base).

### FR-4 : `BaseConnaissanceSidebar.tsx` — props `competence`
- Nouvelles props optionnelles :
  - `competence?: 'EE' | 'EO'` (défaut = `'EE'`)
  - `ongletsEO?: {t2: true, t3: true, corrections: true}` default true
- Quand `competence === 'EO'` :
  - Titre header = "🎙 Fiches · Expression Orale · Tâche {tache}"
  - Onglets Tâche 2 role-play → 1 bouton par scenario (7 puces) ; onglet Corrections T2 → 2 listes 10 questions numérotées
  - Onglets Tâche 3 → 8 sujets cliquables ; onglet Schéma + exemple ; onglet Connecteurs oraux (30)
- Quand `competence === 'EE'` : rendu strictement identique actuel (pas touché — rétro FR-7).
- `useEffect fetch` → `/api/connaissance?competence=${competence}&tache=${tache}`.
- Rendu de chaque scénario Tâche 2 : cadre papier vert pale `rgba(60,207,145,.06)` border 1px `rgba(60,207,145,.2)`, icône 🎤.
- Rendu Tâche 3 exemple complet manger équilibré (7 paragraphes) → scroll vertical interne 320px.

### FR-5 : `NavLaterale.tsx` — Section **🎙 Expression Orale**
- Après la section 🖋 **Expression Écrite** (actuellement seule dans la marque). *Recommandation : refactor légère de `marque-laterale` en deux menus. Réalisation simple : ajouter 1 ligne séparateur + titre H3 🎙 Expression Orale + 2 sous liens indented `└` :*
  1. `└ 📚 Base EO Fiches` → href=`/expression-orale?tab=connaissance`
  2. `└ 💬 Tous les sujets oraux` → placeholder (future page prompts orale EO)
- Aucun aria-current cassé ; `routeActive` matching ajoute `/expression-orale`.

### FR-6 : Page `/expression-orale/page.tsx` — placeholder consultatif simple
- Layout 2 colonnes **PanneauIntro gauche (instru)** + **Sidebar BaseConnaissance EO droite** (ouvert par défaut si `?tab=connaissance`).
- *PanneauIntro gauche* : 3 blocs en-tête (Objectif épreuve Tâche 1 / Tâche 2 / Tâche 3 + durées approximatives TCF Canada). Pas d'éditeur de texte, de bouton corriger, de KPIs — juste une page d'accueil EO informative.
- Utilise `BaseConnaissanceSidebar` avec `competence='EO'`, par défaut la sidebar affiche Tâche 2 (la plus riche).

### FR-7 : Rétrocompatibilité 100% Expression Écrite (RÈGLE DURE)
- **Aucun changement** dans les 12 blocs seed 007 (competence_code='EE' implicitement par DEFAULT 'EE' colonne nouvelle en 008).
- **Aucun changement** de rendu EE sidebar `BaseConnaissanceSidebar` lorsque `competence`=EE (prop absente).
- **Aucun changement** sur /expression-ecrite/page.tsx JSX col-droite.
- `GET /api/connaissance` SANS param `competence` → filtre implicitement competence='EE' (valeur default). 12 blocs exactement rendus comme avant.

## 3. Exigences Non-Fonctionnelles (NFR)

### NF-1 — SÉCURITÉ
- **NF-1a (RÈGLE)** : Pas de `service_role` exposé côté JSX client ; tous calls EO/SQL côté server (`route.ts` runtime=nodejs).
- **NF-1b (RÈGLE)** : Sanitizer SECRET_PATTERNS (5 regex) appliqué aux rows succès ET erreurs `/api/connaissance`.
- **NF-1c (RÈGLE)** : RLS anon SELECT actif=TRUE ; `service_role` write/all uniquement server-side.

### NF-2 — PERFORMANCE
- **NF-2a (RÈGLE)** : Index composite `(competence_code, tache_num, ordre)` garantit 20 blocs × 5k utilisateurs/jour = temps réponse <50ms.
- **NF-2b (RÈGLE)** : Cache `s-maxage=60, stale-while-revalidate=300` sur réponse GET HTTP (réutilisé comme EE).

### NF-3 — DÉPENDANCES ZÉRO (RÈGLE DURE — VÉRIFIÉE PRÉCÉDENT)
- 0 nouvelles librairies npm : **PAS** de `react-markdown`, `remark-gfm`, `marked`, `lucide-react` etc. Parser markdownLite.ts réutilisé **tel quel**.
- Vérification à commit : `git diff --cached package.json` → 0 lignes ajoutées dans `dependencies`.

### NF-4 — IDÉMPOTENCE MIGRATIONS
- Migration 008 (ALTER) : `ADD COLUMN IF NOT EXISTS` / `ADD CONSTRAINT IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` / `DO $$` pour éviter duplicate_object.
- Migration 009 (seed) : pattern `DELETE WHERE slug LIKE 'eo-%'; INSERT` — run 2× donne toujours 21 blocs EO + 12 blocs EE = 33 blocs totaux.
- Apostrophes natives via `$bc$…$bc$ dollar-quoting` partout (v2 pattern seed 007).

### NF-5 — Fuite credentials
- Route GET /api/connaissance filtre 5 patterns regex (JWT eyJ.header.payload, sk-or-v1-, SUPABASE_SERVICE_ROLE_KEY literal, case-insensitive service_role).
- Smoke 10× curl grep credentials → 0 match.

### NF-6 — STRICTE TypeScript
- `npx tsc --noEmit` exit 0 strict mode.
- `npm run build` Next routes count incrémente +1 route `ƒ /expression-orale`. Total 25 routes green.

### NF-7 — POURSUITE DES INVARIANTS PROJET (RÈGLES DURES JAMAIS CASSÉES — inchangées)
- **A15-A20 prompts.ts** toujours ordre clos-schema 24 blacklist keys CECRL 6 overwrite sans `+`. NOUVELLE section **A22 EO référence** insérée entre A21 et A12 (jamais avant A20). Admin parametres byte-for-byte sync.
- **CECRL mapping (règle)** 0-3 A1, 4-6 A2, 7-9 B1, 10-12 B2, 13-15 C1, 16-20 C2 sans suffixe `+` — 6 lieux enforced (route corriger · resultbadge · essaiToResultat · SVG historique · normaliserClient · D3 purge).
- **Palette correction sombre #0E141B + rail ScoreBreakdown #2FA671→#3CCF91** — **AUCUN FICHIER RESULTATCORRECTION.TSX touché** ce tour.
- **3× padding examples B1/B2/C1 D-4 pipeline** toujours 3.
- **Layout 3 tiers Exercise view → Analysis dashboard → rest** toujours.
- **Col-droite EE** toujours `PanneauLive → BaseConnaissance(EE) → codes`.

## 4. Contraintes, Dépendances, Hypothèses, Questions ouvertes

### Contraintes
- Compte GitHub deploy key Ed25519 existante (push HTTPS impossible — SSH seul OK, VÉRIFIÉ préc).
- OpenRouter crédits épuisés ~277 tokens → **PAS de live test `/api/corriger`** ; référentiel A22 injecté mais validation runtime hors scope (ce sera pour Q2-Action utilisateur).
- Supabase Postgres MCP apply uniquement. DDL hors migration impossible.

### Dépendances
- `lib/utils/markdownLite.ts` réutilisé 1:1 pour rendu EO. Scope features : headings, UL/OL, bold `**`, `>blockquote`, simple `|pipe|` table.
- `CONNECTEURS_T3_GROUPE` EE réutilisé comme base pour `CONNECTEURS_ORAUX_GROUPE` (EO) : 18 EE + 12 spécifiques oral → 30.

### Hypothèses
- H1 : Slugs prefixés `eo-*` n'entrent PAS en conflit avec 12 slugs EE existants (`t1-*`, `t3-*`). VRAI → UNIQUE slug constraint OK.
- H2 : User ne souhaite PAS d'éditeur oral LLM live (seulement KB consultative fiches). → On se limite à placeholder page `/expression-orale`.
- H3 : Extension CHECK tache_num IN (0,1,2,3) via ALTER migration 008 n'échoue PAS (CHECK accepte nouveaux membres dans Postgres via DROP CONSTRAINT + ADD).

### Questions ouvertes — defaults raisonnables (user peut changer post-appro)
- **Q1 (default NON)** : Ajouter bouton "Imprimer" fiches EO sidebar ? → Non (trop tôt).
- **Q2 (default OUI)** : Injecter A22 dans prompt EE aussi (section "si EO, alors critères oraux") ? → OUI, section A22 + note "ignorer si EE".
- **Q3 (default OUI)** : 30 connecteurs oraux — catégorie MARQUEURS HÉSITATION ORALE 12 expressions (Écoute…, Ben…, Dis donc, Franchement, Justement, Après, En même temps, Enfin bref, Bon, Bah, Voyons, Tiens) ? → OUI.
- **Q4 (default NON)** : Page `/expression-orale` reçoit aussi PanneauLive checklists oraux ? → Non (hors scope ; EE garde son PanneauLive exclusive).

## 5. Critères d'Acceptation (AC)

### AC · RÈGLES
- **AC-R1 (RÈGLE)** : Migrations 008 + 009 appliquées 2× successives → exit 0 Supabase MCP. Run 1 = 33 blocs ; run 2 = 33 blocs.
- **AC-R2 (RÈGLE)** : `GET /api/connaissance?competence=EO` → jq length >=21. `?competence=EO&tache=2` len >=9. `?competence=EO&tache=3` len >=10.
- **AC-R3 (RÈGLE)** : `GET /api/connaissance` sans competence param → len=12 (rétro EE, 0 régression). `competence=XX` → HTTP 400.
- **AC-R4 (RÈGLE)** : `tsc --noEmit` exit strict 0. `npm run build` → 25 routes Next green (contient `ƒ /expression-orale` + `ƒ /api/connaissance`).
- **AC-R5 (RÈGLE)** : `git diff --cached package.json dependencies` → 0 lignes `+`; `npm ls react-markdown remark-gfm marked` → exit 1.
- **AC-R6 (RÈGLE)** : 10× curl `?competence=EO` grep credentials → 0 match.
- **AC-R7 (RÈGLE)** : Slug UNIQUE constraint 33 blocs (12 EE + 21 EO) → 0 erreur Postgres. FK competence_code references competences.code → `'EE'` row existe (seed 002) + `'EO'` row existe (rajout seed 002 ou 008 ? → H4: ajout 'EO' si abs dans migration 008 `INSERT IF NOT EXISTS competences`).
- **AC-R8 (RÈGLE)** : `BaseConnaissanceSidebar` appelé SANS prop competence → rendu EE identique actuel (3 onglets T3). Test: snapshot HTML taille ~≈.
- **AC-R9 (RÈGLE)** : `NavLaterale` contient 2 nouvelles sous entrées menu "🎙 Expression Orale" avec prefix `└` indented et aria-current fonctionnel sur `/expression-orale`.
- **AC-R10 (RÈGLE)** : A22 injecté JUSTE APRÈS A21 et JUSTE AVANT A12 dans DEFAULTS.invite_correction (prompts.ts + admin/parametres). Identique byte-for-byte.

### AC · RUBRIQUES
- **AC-U1 (RUBRIQUE 0-2)** : Cohérence palette sidebar EO (papier pale + scenarios T2 vert pale #rgba(60,207,145,.06) + corrections numérotées lisibilité). Seuil ≥2 (WCAG CR>4.5).
- **AC-U2 (RUBRIQUE 0-2)** : Ergonomie onglets Tâche 2 / 3 EO ; scroll long exemples 7 paragraphes sans lag. Seuil ≥1.5.
- **AC-U3 (RUBRIQUE 0-2)** : Rétrocompat EE 0 régression visuelle sur /expression-ecrite. Seuil =2 obligatoire.
