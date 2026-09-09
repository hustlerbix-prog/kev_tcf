# Spec — Knowledge Base TCF Canada (Tâche 1 + Tâche 3)

> Dossier: `.trae/specs/connaissance-tcf-canada/`
> Date: 2026-09-08
> Auteur: TRAE · généré depuis les 5 captures écran PDF "TÂCHE 1/3" + squelettes/connecteurs

* * *

## 1. Problème

### 1.1 Contexte utilisateur

L'utilisateur dispose dans le repo `hustlerbix-prog/kev_tcf` d'une application **Next.js 15 · Supabase · OpenRouter** pour préparer l'épreuve d'**Expression Écrite du TCF Canada** (cible B2 / NCLC 8). La base heuristique existante (`lib/heuristiques/taches.ts`) propose déjà une structure légère (`plan` + `formules`) pour Tâches 1/2/3, mais n'implémente **pas** les connaissances TCF officielles présentes dans les 5 fiches PDF:

| Capture (ref) | Contenu concret | Où c'est utile |
|---|---|---|
| **TÂCHE 1 · Fiche à apprendre par cœur** (5ᵉ capture, Page 3) | 6 cases: Amical début/milieu/fin · Formel début/questions/fin · **connecteurs minimum** `D'abord→Ensuite→De plus→Enfin` · **checklist Vérification 5 cases** (Destinataire ✓·Motif✓·2-3 détails✓·Demande/attente✓·Fin✓·60-120✓) | Sidebar "Fiche mémoire" sur page `/expression-ecrite` quand Tâche 1 est sélectionnée ; checklist live dans PanneauLive ; context prompt A21 pour guider le LLM dans ses commentaires Tâche 1 |
| **TÂCHE 3 · Schéma à retenir** (4ᵉ capture, Page 5) · Objectif jaune · 5 colonnes Opinion1→Opinion2→MonAvis→Argument1→Argument2+Fin · 7 rows Partie1/Document1/Document2/Partie2/Argument1/Argument2/Conclusion · **Mémoire 7 cases "ILS PENSENT → ILS NE SONT PAS D'ACCORD → MOI JE PENSE → POURQUOI 1 → POURQUOI 2 → CONCLUSION"** | Sidebar Tâche 3 ; prompt A21 ; bandeau Objectif 120-180 mots |
| **TÂCHE 3 · Partie 1 LES DEUX OPINIONS** (3ᵉ capture, Page 6) · 5 rows Bleu ciel (Début/Opinion1/Opposition/Opinion2/Fin Partie1) · **Extrait exemple complet sur le télétravail** · **⚠ TRÈS IMPORTANT rose** (Pas de "je pense", pas d'argument personnel, pas de copier-coller) | Sidebar accordéon "Partie 1 Deux opinions" avec texte rose très visible ; vérification heuristique dans `structure()` T3 existant |
| **TÂCHE 3 · Partie 2 TON OPINION** (2ᵉ capture, Page 7) · 6 rows Vert (MonAvis/Argument1/Exemple1/Argument2/Nuance/Conclusion) · **Formule magique verte** : *MON AVIS → ARGUMENT → EXEMPLE → ARGUMENT → NUANCE → CONCLUSION* (exemple télétravail 80-120 mots) | Sidebar accordéon "Partie 2 Mon opinion" ; context prompt A21 ; checklist PanneauLive T3 |
| **TÂCHE 3 · Fiche à apprendre par cœur** (1ᵉ capture, Page 8) · IntroPartie1/Doc1/Doc2/MonAvis/Argument1/Argument2/Nuance/Conclusion 8 rows · **6 connecteurs à connaître** Orange 6 rows (Comparer · Ajouter · Expliquer · Exemple · Nuancer · Conclure) avec 3 connecteurs chacun (18 totaux: `En revanche / À l'inverse / Tandis que / Tout d'abord / De plus / En outre / En effet / Car / Parce que / Par exemple / Notamment / Cependant / Pourtant / Néanmoins / Pour conclure / En somme / Finalement`) · **Dernière vérification verte** (2 reformulées ✓·Avis clair✓·2 arguments✓·Exemple✓·Conclusion✓·120-180 mots✓) | Sidebar global + **REMPLACER les `formules` existantes Tâche 3 dans `taches.ts` par ces 18 connecteurs officiels** ; checklist dans PanneauLive 6 cases ; prompt A21 |

### 1.2 Problème concret

1.  L'étudiant doit mémoriser ces fiches papier — pas d'aide UI intégrée.
2.  Le prompt LLM actuel ne reçoit **pas** ces squelettes officiels en contexte, donc le LLM peut évaluer Tâche 1/3 avec des critères non alignés sur le référentiel officiel TCF Canada (ex: il ne pénalise pas l'absence de "pas d'avis personnel dans Partie 1").
3.  Les `formules` existantes pour Tâche 3 dans `taches.ts` sont un mélange de génériques ("De nos jours, la question de") mais ne correspondent **pas** à la grille officielle des 18 connecteurs × 6 catégories dans la fiche "Connecteurs à connaître".
4.  Il n'existe pas de **checklist en temps réel** dans `PanneauLive` qui vérifie les 6 conditions vertes ("Destinataire · Motif · 2-3 détails · Demande · Fin · 60-120" pour T1, "2 reformulées · Avis · 2 arguments · Exemple · Conclusion · 120-180" pour T3) — le PanneauLive actuel ne possède que `structure()` générique, sans ces checklists officielles nommées.
5.  Il n'y a pas de **fiches imprimables / sidebar consultables pendant la rédaction** de style SRS + Anki — l'étudiant ne consulte pas son matériel TCF sans quitter la page.

### 1.3 Public cible

-   Étudiant unique préparant TCF Canada B2/NCLC 8 (cas actuel owner du repo).
-   Futur multi-tenant possible (pas hors scope AC minimal — voir non-goals).
-   Routes: `/expression-ecrite` · `/admin/parametres` · `/progression/essai/[id]`.

### 1.4 Buts utilisateur mesurables

-   **B1** Sur la page `/expression-ecrite`, quand Tâche 1 est sélectionnée, l'étudiant dispose d'un panel "Connaissance officielle Tâche 1" **sans quitter l'éditeur Seyes**, scrollable, contenant la grille Amical/Formel 6 cases + Connecteurs minimum + Checklist Vérification 6 cases.
-   **B2** Quand Tâche 3 est sélectionnée, **3 onglets**: (i) Objectif + Schéma Mémoire · (ii) Partie 1 Deux opinions (avec rose TRÈS IMPORTANT + Exemple bleu ciel télétravail) · (iii) Partie 2 Mon opinion (verte Formule magique + exemple) + Connecteurs 18 + Dernière vérification 6 cases.
-   **B3** Les **18 connecteurs officiels Tâche 3** remplacent l'ancien mélange de `formules` Tâche 3 dans `taches.ts` (backport compatible, perte de 0 features) ; les 6 cases Connecteurs sont groupées par catégorie.
-   **B4** Le prompt LLM reçoit un micro-appendice **A21 · Référentiel d'évaluation Connaissance officielle** qui reprend exactement:
    -   Tâche 1: 5 cases checklist Vérification (Destinataire, Motif, 2-3 détails, Demande-attente, Formule fin, 60-120 mots).
    -   Tâche 3: 6 cases Dernière vérification (2 opinions reformulées · Avis clair · 2 arguments · Exemple · Conclusion · 120-180 mots) + la **règle rose Partie 1 "pas de je pense / pas d'argument personnel / pas de copier-coller des documents"**.
-   **B5** Une **nouvelle Supabase table `base_connaissances_tcf`** stocke ces 12 blocs (fiches, squelettes, connecteurs) avec métadonnées `tache_num`, `bloc_type` (`squelette`/`connecteurs`/`checklist`/`exemple`/`avertissement`), `slug`, `contenu_markdown` + colonne `ordre` — afin que Admin UI puisse éditer sans toucher le code ; les seeds `006_base_connaissances_seed.sql` populent la table depuis les fiches PDF.
-   **B6** `PanneauLive` ajoute **2 blocs dédiés "Checklist officielle T1" / "Checklist officielle T3"** avec les emojis/icônes des fiches (rose TRÈS IMPORTANT devient badge `⚠️` dans T3).
-   **B7** TypeScript strict: `npx tsc --noEmit exit 0` ; `npm run build` 22 routes green ; test de fumée `curl /api/connaissance` renvoie JSON avec 12 blocs.

## 2. Hors scope / Non-goals

-   ❌ **NO**: Inclure Tâche 2 Blog/Forum dans cette spec — elle n'apparaît dans aucune des 5 captures. Elle conservera son `taches.ts` actuel.
-   ❌ **NO**: Multi-utilisateurs authentifiés / SSO / rôles (hors scope immédiat).
-   ❌ **NO**: Export PDF fiches (hors scope minimum).
-   ❌ **NO**: Anki / SRS flashcards séparés hors `erreurs_suivi` — la base connaissance ne génère pas de cartes flash.
-   ❌ **NO**: Modifier `ResultatCorrection.tsx` dans cette spec (hors scope minimal) — on n'injecte les connaissances **que dans le prompt A21, pas encore dans les cartes de correction**.

## 3. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| **F1** | `supabase/migrations/006_base_connaissances_tcf.sql` crée table `base_connaissances_tcf` (id uuid PK · created_at · tache_num SMALLINT 1|2|3 · slug text unique · bloc_type enum('squelette','connecteurs','checklist','exemple','avertissement','objectif') · titre text · description text · contenu_markdown text · ordre INTEGER · actif BOOLEAN default true) + RLS: `anon` SELECT WHERE actif=true, `service_role` SELECT/INSERT/UPDATE/DELETE. |
| **F2** | `007_base_connaissances_seed.sql` SEED 12 blocs exacts issus des 5 captures (6 T1 · 6 T3): <br>T1: objectif · squelette amical · squelette formel · connecteurs-minimum · exemple-salutations · checklist-verification-5cases <br>T3: objectif-120-180 · schema-retenir · partie1-deux-opinions + avertissement-rose · partie2-mon-avis-formule-magique · connecteurs-6categories-18mots · derniere-verification-6cases. |
| **F3** | Nouvelle route `GET /api/connaissance?tache=1|2|3` en `app/api/connaissance/route.ts` qui utilise `createClient(service_role)`. Renvoie JSON Array trié par `ordre` de la table, cache-control `s-maxage=60`. |
| **F4** | Nouveau composant React TS `components/expression-ecrite/BaseConnaissanceSidebar.tsx`. Props: `tache: 1|2|3`. Récupère F3 via `useEffect()` + `useMemo`. Rend T1 simple panel, T3 **3 tabs "Schéma" · "Partie 1" · "Partie 2 + Connecteurs + Verif"** avec Tailwind v4, palette **bureau-beige comme PanneauLive / Expression-Écrite page, PAS fons sombre correction** (contraste WCAG AA sur papier). Markdown via `react-markdown` (NE PAS installer si absent? → fallback `<pre>` formaté avec `white-space: pre-wrap` + simple markdown-to-HTML minimal inline sans dépendance, voir contrainte C3). |
| **F5** | `app/expression-ecrite/page.tsx` intègre `BaseConnaissanceSidebar` **à droite de l'éditeur Seyes** sous `PanneauLive`, **sous forme d'accordéon fermé par défaut** `📚 Fiche officielle Tâche N` — n'augmente pas la hauteur initiale de la page ; s'ouvre en cliquant, ne cache pas PanneauLive, responsive mobile: passe en plein écrant modal sheet bas. |
| **F6** | Réécriture de `TACHES[3].formules` dans `lib/heuristiques/taches.ts` — remplacé par **18 connecteurs groupés 6×3** (`CONNECTEURS_T3_GROUPE` export constant séparé, inséré dans champ `formules` plat pour rétro-compat). Garder `TACHES[1].formules` + `TACHES[2]` intacts. |
| **F7** | `lib/llm/prompts.ts` (et synchro byte-for-byte `app/admin/parametres/page.tsx` DEFAULT_PROMPTS.invite_correction) ajouter la section **A21 · Référentiel Connaissance officielle TCF Canada** INSÉRÉE entre A20 et A12 (ordre déjà: A14… A15-A20 inséré avant). A21 liste textuellement les checklists T1 5 cases et T3 6 cases + la règle rose T3 Partie 1. Ne PAS casser l'échappement triple backtick déjà en place (validation tsc strict après). |
| **F8** | `components/expression-ecrite/PanneauLive.tsx` ajoute un sous-bloc **Checklist officielle** sous `structure()`, implémentée avec helpers: `checklistOfficielleT1(txt)` et `checklistOfficielleT3(txt)` dans `lib/heuristiques/taches.ts`. Chaque checklist retourne `[label, ok, aide]` tuples, 5 T1 · 6 T3. Style badges: vert `bg-vert-fond` si ok, amber sinon (palette déjà connue erreurs dashboard). |
| **F9** | `components/NavLaterale.tsx` ajoute une entrée "📚 Base connaissance" qui renvoie vers `/expression-ecrite?tab=connaissance` (ne crée PAS de nouvelle route, le `?tab=connaissance` ouvre `BaseConnaissanceSidebar` en plein écran sur la page existante). |

## 4. Exigences non-fonctionnelles

| ID | Exigence |
|---|---|
| **NF1 · TS strict** | `npx tsc --noEmit` exit 0, AUCUN warning. Règle: tout paramètre/retour typé, pas `any`. Si besoin de type libre, utiliser `Record<string, unknown>` + narrowing comme fait dans `normaliserClient` de `page.tsx`. |
| **NF2 · Build** | `npm run build` exit 0, 22 routes (initial) → 23 routes (après ajout `/api/connaissance`) : 10 static + 13 dynamic all green. |
| **NF3 · 0 nouvelles dépendances lourdes** | Interdiction d'ajouter `react-markdown`, `remark-gfm`, etc. — F4 utilise un parser markdown ultra-léger inline (<50 lignes) supportant titres `##`, gras `**x**`, listes `1.` `-`, guillemets `>`. Règle: taille bundle ajoutée < 2 ko. |
| **NF4 · WCAG AA contraste** | Tous les textes dans BaseConnaissanceSidebar et PanneauLive checklist ≥ 4.5:1 sur `--color-papier` (pas sombre correction). Ne pas toucher la correction palette dark. Règle: inspecter les 3 emplacements (T1 checklist, T3 rose avertissement, boutons tabs) et prouver CR calculé ≥ 4.5 par visual smoke. |
| **NF5 · Audit sécurité** | Vérifier que `.env.local` + `.github_deploy_keys/` ne sont JAMAIS loggés par `GET /api/connaissance`. Lancer 10 fois le endpoint et grep response. |
| **NF6 · idempotence seed** | Exécuter `006 + 007` SQL 2 fois d'affilée dans Supabase SQL Editor → 0 erreur, pas de doublons (DELETE INSERT où DELETE sur slug, pas d'INSERT en vrac conflictuel). |
| **NF7 · Rétro-compatibilité** | Le `TACHES` export reste de type `Record<1|2|3,Tache>` dans `types/tcf.ts`. Le champ `formules: string[]` T3 doit rester `string[]` mais contient maintenant 18 connecteurs, ce qui ne change pas la signature du type. |
| **NF8 · Performance** | Chargement BaseConnaissanceSidebar en < 50 ms quand `actif=true`, pas de re-render inutile. |
| **NF9 · Build Supabase local PAS requis** | Pas besoin d'installer `supabase` CLI global. L'utilisateur applique 006/007 via SQL Editor dashboard (même flux que 001-005 déjà documenté dans README). |

## 5. Contraintes, dépendances, hypothèses

### 5.1 Contraintes dures

-   **C1 · Couche prompts**: Ne JAMAIS supprimer A15-A20 existants (blacklist 24 clés, CECRL pas +). A21 s'insère **juste avant A12**, pas entre A14 et A15 (ordre déjà validé).
-   **C2 · Correction palette sombre**: NE PAS modifier ResultatCorrection.tsx dans cette spec. La base connaissance est visible **seulement dans la page d'édition claire**.
-   **C3 · Pas de nouvelle dépendance npm**: NF3 est une contrainte DURE. `npm ls react-markdown` retourne actuellement nothing. Aucun nouveau package.json modif.
-   **C4 · Ordre 3 tiers "Exercise view, Analysis Dashboard, then rest"**: Ce layout (fixé dans User Msg #5 et validé) ne change PAS. BaseConnaissanceSidebar est un **accordéon annexe, pas une réorganisation du flux principal**.
-   **C5 · CECRL hard mapping**: Ne touche pas le tableau 0-3 A1 / 10-12 B2 / 16-20 C2. Ce sont des connaissances rédactionnelles, pas de scoring.

### 5.2 Dépendances

-   Supabase migrations 006 (création table) exécutée AVANT 007 (seed) — ordre topologique, comme 001→005.
-   Admin prompt save A21 dans Supabase DB: **le propriétaire doit ré-effectuer le clic Enregistrer** (cf. point Admin dans README). Sans ça, la DB garde l'ancien prompt avant A21. Ceci est une dépendance opérationnelle, pas de code.
-   Accès `/api/connaissance` utilise SUPABASE_SERVICE_ROLE_KEY déjà existant dans .env.local — pas de nouvelle clé.

### 5.3 Hypothèses

-   H1: L'utilisateur veut les fiches EXACTES des 5 PDFs capturées, pas une version "améliorée" ou résumée. (Si pas, le seed SQL peut être édité post-implémentation).
-   H2: L'utilisateur utilisera BaseConnaissanceSidebar SANS connecteur LLM — c'est du référentiel statique, mais on l'injecte en A21 pour améliorer les commentaires ciblés.
-   H3: Le `bloc_type enum` n'évoluera pas de sitôt. Si évolution, c'est une migration ALTER TYPE (facile, mais prévu dans NF6).

## 6. Questions ouvertes — à l'utilisateur de décider AVANT implémentation (ou peut répondre inline)

| # | Question | Hypothèse par défaut |
|---|---|---|
| **Q1** | Veux-tu aussi exporter ces fiches en PDF (bouton "Imprimer la fiche") dans le sidebar, ou non ? | Par défaut: NON — reste UI web accordéon. |
| **Q2** | Veux-tu également étendre A21 pour que le correctif LLM signale avec un badge ⚠️ quand il n'y a PAS de "pas de je pense" dans Partie 1 de T3 ? Aujourd'hui structure() teste partiellement. | Par défaut: OUI, avec simple regex A21+structure() déjà existante étendue. |
| **Q3** | Le connecteur "Tandis que" (18e) est générique. L'ajouter aux mots autorisés pour `insererAuCurseur` du menu à côté des autres formules ? | Par défaut: OUI, déjà couvert par F6 (remplissage TACHES[3].formules). |
| **Q4** | Faire apparaître la base connaissance aussi sur la page historique `/progression/essai/[id]` pour consultation post-correction ? | Par défaut: NON — réservé page editeur. |

## 7. Critères d'acceptation (ACs) — type strict `rule` OU `rubric`

### Règles (booléen, pass/fail)

-   **AC-R1 · 006 + 007 migrations**: Exécuter dans Supabase SQL Editor `006` puis `007` une première fois → 0 erreur ; puis RUNNER une DEUXIÈME fois → 0 erreur, row count = 12 stables.
-   **AC-R2 · /api/connaissance?**: `curl http://localhost:3000/api/connaissance?tache=1` renvoie JSON array length=6, chaque item a `tache_num=1`, trié par `ordre`. `?tache=3` → length=6.
-   **AC-R3 · TS strict**: `npx tsc --noEmit` exit 0 ; 0 occurence de `any`.
-   **AC-R4 · Build 23 routes**: `npm run build` → Next affiche `ƒ /api/connaissance` ligne dynamic ; exit 0.
-   **AC-R5 · Prompt A21**: Grep `app/admin/parametres/page.tsx` + `lib/llm/prompts.ts` pour `A21 · Référentiel` → présent EXACTEMENT 2 fois, byte-for-byte. A15 puis A16 puis A20 puis A21 puis A12 (ordre).
-   **AC-R6 · Checklists T1 5 cases T3 6 cases dans PanneauLive**: Ecrire texte "Salut Bernard, …" T1 de la page 98 mots Bernard marché (utilisé verification) → PanneauLive affiche 5 badges verts checklist T1 5/5. Ecrire extrait T3 exemple Télétravail (fiche 3 + 2 concaténés) → 6/6 verts.
-   **AC-R7 · 18 connecteurs officiels T3**: `TACHES[3].formules` length === 18 ; `new Set(TACHES[3].formules).size === 18` (pas de doublons). Contenu: exactement 6 catégories × 3 mots de la fiche "Connecteurs à connaître".
-   **AC-R8 · Règle rose T3 Partie 1**: Dans BaseConnaissanceSidebar onglet Partie 1 → le badge `⚠️ TRÈS IMPORTANT` est rendu avec fond `rgba(239,143,160,.11)` + texte `#A83C14` (couleur déjà utilisée erreurs page précedente).
-   **AC-R9 · Audit sécurité 10 requêtes**: Boucle for 10× `curl :3000/api/connaissance` ; grep réponses pour `SUPABASE_SERVICE_ROLE_KEY` ou `OPENROUTER` → 0 match.
-   **AC-R10 · Pas de npm install nouvelles dépendances**: `git diff --cached package.json` contient 0 lignes `+` dans `dependencies` et `devDependencies`.

### Rubriques (0-2, seuil 1.5/2)

-   **AC-U1 · Lisibilité sidebar WCAG AA (rubric)**: Échelle 0–2. Score 2 = texte couleur `encre` sur papier, onglets labels > 14px, icônes claires, rose avertissement contraste CR ≥ 5.0:1 ; 1 = lisible, un onglet contrast < 4.5 ; 0 = illisible.
-   **AC-U2 · UX accordéon non intrusif (rubric)**: 0-2. 2 = F5 accordéon fermé par défaut, n'allonge pas la page initiale > 20 px, s'ouvre en < 300 ms, pas de décalage vertical PanneauLive. 1 = petit décalage mais acceptable ; 0 = cache PanneauLive.
-   **AC-U3 · Prompt A21 est aligné avec fiches PDF (rubric)**: 0-2. 2 = 100% checklist identique aux cases vertes des 2 fiches, règle rose textuellement copiée ; 1 = 1 case omise, 0 = 2+ cases manquantes.
