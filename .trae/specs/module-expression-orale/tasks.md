# Tasks — Module Expression Orale (EO) · Plan d'implémentation

- **Repos:** `/Users/kevche_mini/TFC App` · Next.js App Router · Supabase · `tsc strict`
- **Parent spec:** [spec.md](file:///Users/kevche_mini/TFC%20App/.trae/specs/module-expression-orale/spec.md)
- **Source de référence:** [EO-001_module_expression_orale.md](file:///Users/kevche_mini/TFC%20App/EO-001_module_expression_orale.md)
- **Non-négociable NF3:** 0 nouvelle dépendance npm

---

## PHASE 1 — Données & contenu (sans IA) · ACs: R1, R8, R10

### Task 1: Migration SQL 010 — schéma `eo_archetypes`, `eo_sessions`, `eo_task_runs`, `eo_turns`

- **Fichiers nouveaux:** `supabase/migrations/010_eo_module_tables.sql`
- **Contenu:**
  - `eo_archetypes (id PK, task SMALLINT CHECK 1..3, category TEXT, set TEXT quick/full, consigne TEXT NOT NULL, translation_es TEXT, duration_sec INT NOT NULL, prep_sec INT DEFAULT 0, examiner_role TEXT, candidate_role TEXT, objective TEXT, required_moves TEXT [], relances TEXT [], lexical_field TEXT [], scene_facts TEXT [], complication TEXT, arguments_pour TEXT [], arguments_contre TEXT [], exemples_concrets TEXT [], connecteurs TEXT [], plan_4t TEXT [], cheat_sheet JSONB, actif BOOL DEFAULT TRUE, ordre INT)`
  - `eo_sessions (id uuid PK gen_random_uuid, user_id TEXT, mode TEXT, started_at TIMESTAMPTZ, ended_at TIMESTAMPTZ, credits_spent INT DEFAULT 0, evaluation JSONB, incomplete BOOL DEFAULT FALSE)`
  - `eo_task_runs (id uuid PK, session_id FK eo_sessions CASCADE, task SMALLINT, archetype_id TEXT FK eo_archetypes(id), overtime_seconds INT DEFAULT 0, prep_notes TEXT, metrics JSONB, turns_order INT[])`
  - `eo_turns (id uuid PK, task_run_id FK eo_task_runs CASCADE, role TEXT examiner/candidate, text TEXT, start_ms INT, end_ms INT, internal_note TEXT)`
  - RLS + index composite.
- **TR Règle:** Mig apply 2× idempotent; `\d eo_archetypes` columns existe; supabase_apply_migration exit 0.
- **Status:** pending
- **Priority:** high
- **Blocage:** None

### Task 2: Seed SQL 011 — 72 archetypes EO (20 T1 · 24 T2 · 28 T3)

- **Fichiers nouveaux:** `supabase/migrations/011_eo_seed_72_archetypes.sql`
- **Contenu:** Idempotent DELETE WHERE id LIKE 'T%' + INSERT 72.
  - T1 (§8.1): 20 arch IDE-01..BEN-20. Toutes 8 QS marquées quick-set. Champ `relances[]` = chaîne de 4 questions (présent→passé→projet).
  - T2 (§8.2): 24 arch. Toutes ont `requiredMoves` + `examiner_role` + `candidate_role`. 6 QS quick (BEN-01, CUL-02, LOG-03, EMP-04, FOR-05, VOY-09, COL-19). **6 sceneFacts fixes** pour toutes les 24; complication idéalement 1 par arch (minimum 100 mots diff).
  - T3 (§8.3): 28 arch. 9 QS quick (TEC-01, TRA-04, ENV-07, ENV-09, EDU-11, IMM-16, FAM-20, MED-24). Chaque T3 QS: `arguments_pour[]×3, arguments_contre[]×3, exemples_concrets[]×2, connecteurs[]×6 (§14.1), plan_4t TEXT` (4 phases §14.2). Non-QS T3: champ minimal (pas de plan, 1 argument pour/contre).
- **TR Règle:** `SELECT task, count(*), count(*) FILTER (WHERE set='quick') FROM eo_archetypes GROUP BY task;` → **[[1,20,8], [2,24,7], [3,28,9]]** — quick total = 24, total = 72.
- **Status:** pending
- **Priority:** high
- **Depends:** Task 1

### Task 3: Type TS `lib/types/eo.ts` — Archetype, EoSession, SpeechMetrics, reducer

- **Fichiers nouveaux:** `lib/types/eo.ts`
- **Contenu:** Interfaces:
  - `TaskId = 1|2|3 ; ModeId`
  - `Archetype` (match schema SQL, TS optional nullable pour champ non remplis non-QS)
  - `EoSessionState` réducer états: IDLE/BRIEFING/PREPARING/EXAMINER_OPENING/LISTENING/THINKING/EXAMINER_TURN/TASK_COMPLETE/EVALUATING/REPORT
  - `EoSession`, `EoTaskRun`, `Turn` (§4.3 spec EO-001)
  - `SpeechMetrics` (§4.3: candidateSpeakingSec, silenceSec, longestSilenceSec.. + lexicalDiversity)
  - `Evaluation, CriterionScore, ErreurEO, UpgradeEO, EoGlobalResult` (§6.5)
  - `LEVELS: 0..6 = ['A1_non_atteint','A1','A2','B1','B2','C1','C2']` const
- **TR Règle:** Imports dans 5 autres fichiers (tests de compilation). `tsc --noEmit exit 0`.
- **Status:** pending
- **Priority:** high
- **Depends:** Task 2 (pour valider champ mapping SQL→TS)

### Task 4: Routes API `/api/eo/archetypes` (GET list + GET by id) + `/expression-orale` UI list replace placeholder

- **Fichiers nouveaux:** `app/api/eo/archetypes/route.ts`, `app/api/eo/archetypes/[id]/route.ts`
- **Fichiers modif:** `app/expression-orale/page.tsx` (remplace placeholder 2-col sidebar)
- **UI list:** Onglets [Tout · Task 1 · Task 2 · Task 3]; compteur chips `72 · 20 T1 · 24 T2 · 28 T3`; filtre set Quick Set/Full; carte archetype; bouton SIMULATION COMPLÈTE 12 MIN bar prominent.
- **TR Règle:** `curl /api/eo/archetypes | jq length` = 72; `?task=1 → 20`. `?task=2&set=quick → 7`. Onglets clic → liste count OK. T1 Task filter présent (gap G1 couvert).
- **Status:** pending
- **Priority:** high
- **Depends:** Task 1–3

---

## PHASE 2 — Machine à états + Cronos + persistence (sans IA réelle, tour statique) · ACs: R2

### Task 5: Reducer puro EO session + cronos hooks (lib/eo/sessionReducer.ts, useEoTimer)

- **Fichiers nouveaux:** `lib/eo/sessionReducer.ts`, `lib/eo/useEoTimer.ts`
- **Implémenter reducer:** `(state: EoSessionState, action: ActionUnion) => EoSessionState`. Test des transitions:
  - IDLE→BRIEFING (start archetype session)
  - BRIEFING→(PREPARING si T2 sinon EXAMINER_OPENING)
  - PREPARING 2min → AUTO EXAMINER_OPENING
  - LOOP LISTENING (candidat parle) → THINKING → EXAMINER_TURN (examineur parle) → LISTENING
  - Timer tache expire → TASK_COMPLETE (en full_exam next tâche AUTO; sinon → EVALUATING→REPORT)
  - OvertimeSeconds max 20, penalize non-blocking record
- **Hook crono:** `useEoTimer(durationSec, onTick, onExpire)`. Retourne `{remainingSec, progressPct, isRunning, amberAlert: remainingSec<=15}`.
- **TR Règle:** Test mock reducer 12 étapes. transitions PASS (jest-like: node --eval assertions). Crono hook: Amber alert fire true @ remaining=15s.
- **Status:** pending
- **Priority:** high
- **Depends:** Task 3

### Task 6: Salle session `/expression-orale/[archetypeId]/session` — layout, chrono géant, transcript, PREPARING T2

- **Fichiers nouveaux:** `app/expression-orale/[archetypeId]/session/page.tsx`
- **Fichiers modif potentiel:** `components/expression-orale/*` (dossier crée si besoin)
- **UI sobrio 1 colonne:** haut chip TÂCHE + chrono reverse GRAND + progress amber @15s; centre transcript EXAM/CAND 2 couleurs auto-scroll; statut examiner `· écoute · réfléchit · parle` ; bas MICRO BTN grand.
- **PREPARING T2 (TASK 2 only):** Remplacer centre par consigne SEULE + bloc-notes textarea mono (sans IA ni ortho check) + chrono 2:00. micro disable text gray pendant PREPARING.
- **TR Règle:** Visuel T1 = 2:00. T2 = PREPARING 2:00 PUIS 3:30 dialogue (total T2 = 5:30). T3 = 4:30. Console check remainingSec match.
- **Status:** pending
- **Priority:** high
- **Depends:** Task 5

### Task 7: Page détail archetype `/expression-orale/[archetypeId]` · étude mode

- **Fichiers nouveaux:** `app/expression-orale/[archetypeId]/page.tsx`
- **Contenu:** consigne → trad ES toggle → lexicalField accordéon → T2 requiredMoves visible → T3 args pour/contre + plan 4t. 3 boutons: 1) drill_text 0 crédit (mode text uniquement), 2) drill_voice 1 crédit, 3) conversation IA 3 crédits.
- **TR Règle:** Onglet drill_text → entrée text zone → OK. Boutons 2/3 disabled si browser pas Speech API detected + message `Votre navigateur ne supporte pas Web Speech API. Mode texte forcé.`
- **Status:** pending
- **Priority:** medium
- **Depends:** Task 3, 4

### Task 8: `/expression-orale/exam` · simulateur full_exam confirm + start

- **Fichiers nouveaux:** `app/expression-orale/exam/page.tsx`
- **Contenu:** Confirmation: 3 cartes (T1=2:00 T2=2+3:30 T3=4:30) + durée totale 12:00 **SANS PAUSE** + coût 6 crédits + warning non pausable. Bouton start → room session full_exam.
- **TR Règle:** Check full exam room IDLE→T1→T2 prep→T2→T3→REPORT chain. Crono total max = 12*60s + overtime < 120s.
- **Status:** pending
- **Priority:** medium
- **Depends:** Task 6

---

## PHASE 3 — Examinateur IA · §5 ACs R3 (T2 0 question), R4 (T3 ≤ 15% parole)

### Task 9: System prompts IA T1/T2/T3 + parser réponse `{speech, internalNote, shouldAdvance}`

- **Fichiers nouveaux:** `lib/llm/examinerPrompts.ts`, `app/api/eo/examiner-turn/route.ts`
- **Contenu prompts:** Reproduire §5.2 (T1), §5.3 (T3), §5.4 (T2) VERBATIM + variables mustache. `examinerRole={{examinerRole}}`. Prompt commun §5.1 règles 1..9.
- **API route:** POST `{task, archetypeId, transcript: Turn[], remainingSec, sceneFacts?}` → call OpenRouter chat → parse JSON strict. JSON repair fallback si invalide.
- **TR Règle:** Output API response keys = speech + internalNote + shouldAdvance (3 clés seulement). Mock call: réponse non JSON → fallback string speech `Je vous écoute.` + note "Réponse LLM invalide; fallback".
- **Status:** pending
- **Priority:** high
- **Depends:** Task 3, Task 2 (arch ids)

### Task 10: Intégration STT/TTS natifs navigateur (0 npm dep) + barge-in + fin de tour 1.8s

- **Fichiers nouveaux:** `lib/eo/useSpeechIo.ts` hook
- **Use:** `window.SpeechRecognition || window.webkitSpeechRecognition` (fr-CA par défaut, fr-FR fallback). `speechSynthesis` (parler).
- **Features hook:** `{startListening(onPartial, onFinal, silenceMs=1800 → end turn) ; stopListening ; speak(text, opts{lang, rate, bargeIn: ()=>stopSpeaking}) ; speaking bool ; listening bool}`.
- **Barge-in:** candidat parle pendant TTS → immédiatement `speechSynthesis.cancel()`.
- **TR Règle:** Test 1 phrase STT. Mock cancel TTS si barge-in fire ≤200 ms après microphone start.
- **Status:** pending
- **Priority:** high
- **Depends:** Task 9 (dépendance indirecte)

### Task 11: Filer examiner IA dans Salle session (connecter reducer + API examiner turn + speech IO)

- **Fichiers modif:** `app/expression-orale/[archetypeId]/session/page.tsx`
- **Intégrer:**
  - `THINKING` state → POST API examiner-turn → `EXAMINER_TURN speak`
  - `EXAMINER_TURN` fin → `LISTENING` microphone on
  - silence >6s → fallback relance statique `Oui… je vous écoute.` (1× max par silence)
  - T2 mid-time inject complication; T1 questions progressif; T3 ≤1 intervention/45s
  - logs: examiner speech ends with ? count for T2 = 0 or 1 max only for relance narration (R3)
- **TR Règle R3:** Script 5 min T2 conversation test, question examen <2 (pass). R4: T3 parole examiner <15% mots.
- **Status:** pending
- **Priority:** high
- **Depends:** Task 6, 9, 10

---

## PHASE 4 — Évaluation + calcul note · ACs R5, R6, R7

### Task 12: Calculs purs `lib/eo/scoring.ts` (0 LLM, code TS only)

- **Fichiers nouveaux:** `lib/eo/scoring.ts`
- **Contenu:**
  - `CRITERION_WEIGHTS` × 3 tâches ; `TASK_WEIGHTS = {1:.25 2:.35 3:.4}`
  - `ANCHORS=[[0,0],[1,1],[2,3.5],[3,7.5],[4,11.5],[5,15.5],[6,19]]`
  - `taskScore(critères, t) ; globalScore(taskScores) ; toNote20(level) clamp 0..20 arrondi entier`
  - `toNclcEo(note): {nclc, cefr}` (§6.3 spec, <7 = TODO IRCC banner text)
  - `applyHardPenalties(evaluation, transcriptMetrics): Evaluation` (§6.4 6 règles)
- **TR Règle:** Cas anclajes (R6) PASS exact:
  - All 4.0 → levelScore 4.0 → note20 **11** B2 → NCLC **7**
  - All 3.0 → note20 **8** B1 → NCLC **<7**
  - All 5.0 → note20 **15** C1 → NCLC **9**
  - T2 0 question → P1≤1 P3≤1 → check PASS
  - speakingRatio <0.25 → L3 ≤ 2
- **Status:** pending
- **Priority:** high
- **Depends:** Task 3 (types)

### Task 13: SpeechMetrics calc en code (0 LLM) `lib/eo/speechMetrics.ts`

- **Fichiers nouveaux:** `lib/eo/speechMetrics.ts`
- **Fonction `calcSpeechMetrics(turns: Turn[], taskDurationSec: number): SpeechMetrics`:**
  - speakingSec: `candidat turns sum(endMs-startMs)/1000`
  - silenceSec: sum inter-turn gaps candidat → examiner → candidat > 2000ms
  - longestSilenceSec: max gap
  - WPM: `(mots candidat × 60) / speakingSec`
  - turnCount, questionsAsked (`count /[¿?]$/gm` sur texte candidat)
  - fillerCount: regex `/\b(euh|hein|hum|bein|ben|este|bueno|o sea|so|like)\b/gi` count
  - lexicalDiversity (TTR): `uniqueLemma / totalMots` (lemma simple lowercase no-punct stopwords 50 fréquence)
- **TR Règle:** Input turns mockés: 1 turn 60s / 120 mots / 2 questions / 3 euh → output validée par assertions node.
- **Status:** pending
- **Priority:** high
- **Depends:** Task 3

### Task 14: Evaluator LLM `lib/llm/eoEvaluatorPrompt.ts` + API `/api/eo/evaluate/route.ts`

- **Fichiers nouveaux:** les deux ci-dessus
- **Contrat evaluateur §6.5:** INPUT JSON tasks (transcrits + metrics) → OUTPUT tasks[criteria(P1..S1 × score+level+evidence+comment), taskLevel, penalties, errors, upgrades], global, synthesis. STRICT JSON. Double eval (temp 0.2 correcteur standard + temp 0.5 correcteur sévère). Tie-break si delta_task_level >= 1.5 any (3eme call temp 0.3 discard extreme).
- **Appel LLM séquentiel 2 + 1 tiebreak si. JSON repair fallback.**
- **TR Règle R5:** Script double-eval mock: cas discrepancy 2 points → tiebreak lancé + log.
- **Status:** pending
- **Priority:** high
- **Depends:** Task 12, openrouter existant

### Task 15: Tests unitaires anchored `lib/eo/__tests__/scoring.test.mjs` + calc metrics + pénalités

- **Fichiers nouveaux:** `lib/eo/__tests__/scoring.test.mjs`, `lib/eo/__tests__/speechMetrics.test.mjs`
- **Run script:** `node --test lib/eo/__tests__/*`
- **TR Règle:** exit code = 0 · 10+ tests PASS. Couvrir R6 anclajes, R7 penalites, R5 tiebreak.
- **Status:** pending
- **Priority:** high
- **Depends:** Task 12, 13, 14

---

## PHASE 5 — Rapport + progression UI · Rubriques U1, U2, U3

### Task 16: `/expression-orale/session/[sessionId]` page rapport

- **Fichiers nouveaux:** `app/expression-orale/session/[sessionId]/page.tsx`, `components/expression-orale/RadarChart.tsx` (canvas pure 0-dep)
- **Ordre rapport §11.4:** 1. Note globale + distance objectif (composant identique Expression Ecrite palette) 2. Radar 7 critères P1..S1 × line B2 threshold. 3. Cards par tâche. 4. Transcript annoté marge + audio bouton play par tour. 5. B2 upgrades cards. 6. Les 3 choses à corriger prioritaires. 7. Recommandation prochaine session → link archetype.
- Bloc pliable transparence « Comment cette note est calculée » (§6.6 disclaimer estim non officiel + poids config heuristique déclarée)
- **TR Règle:** Transcript vide → report rendu sans erreur (taskLevel = 0, A1_non_atteint).
- **Status:** pending
- **Priority:** medium
- **Depends:** Task 12, 14

### Task 17: `/expression-orale/historique` · tableau + graph courbe progression

- **Fichiers nouveaux:** `app/expression-orale/historique/page.tsx`, `components/expression-orale/ProgressionGraph.tsx` (canvas pure line chart note20)
- **UI:** Liste sessions (date, mode, tâches, note, NCLC) + graphique évolution note20 ligne objectif=10. Filtres mode/tâche.
- **TR Règle:** 0 sessions → état vide. 5 sessions mock → graphique points 5 × line tracée ok.
- **Status:** pending
- **Priority:** medium
- **Depends:** Task 16

### Task 18: Persister eo_sessions dans Supabase (routes API upsert + read)

- **Fichiers nouveaux:** `app/api/eo/sessions/route.ts (POST list GET)`, `app/api/eo/sessions/[id]/route.ts`
- **Crédits côté serveur vérifié: pas de crédit? 402 Payment Required.**
- **TR Règle:** curl /api/eo/sessions sans credits → response.status=402; create full_exam avec 6 credits → ok.
- **Status:** pending
- **Priority:** high
- **Depends:** Task 8, 14, Task 1 mig schema sessions

### Task 19: NavLaterale section Expression Orale → 4 liens (ajouter Historique + Simulateur)

- **Fichier modif:** `components/NavLaterale.tsx` (section Expression Orale ajouter liens supplémentaires si existe: └ ⚙ Simulateur complet /expression-orale/exam · └ 📊 Historique /expression-orale/historique)
- **TR Règle:** 4 liens indented EO; routeActive highlight OK.
- **Status:** pending
- **Priority:** medium
- **Depends:** Task 7, 8, 17

---

## PHASE 6 — Polissage

### Task 20: Keyboard accessibility + erreurs gracieuses room session

- **Room session:** Tab order: micro (Espace/Entrer toggle), abandonner (Entrer), focus trap chrono ARIA-live polite, examiner status aria-label. Micro accessible via clavier.
- **Erreurs:** LLM HTTP 429 Rate → afficher message gentil; OpenRouter quota 502 → "Quota OpenRouter épuisé. Mode texte fallback, IA désactivée."; STT erreur → fallback text chat.
- **TR Règle:** test Keyboard manual 5 étapes. Audit axe-core-like: pas aria-hidden sur éléments focussables.
- **Status:** pending
- **Priority:** low
- **Depends:** Task 11

### Task 21: Latence < 1.5 s mode texte + fr-CA TTS

- **Optimisation:** Streaming si possible via OpenRouter stream API; préchargement relances statiques; TTS par phrases.
- **Check:** logs E2E `start candidate turn end → exam speak start` moyen ≤1500 ms mode texte.
- **TR Règle:** 5 runs conversation mock, mean latency <1.5s.
- **Status:** pending
- **Priority:** low
- **Depends:** Task 11, 10

---

## Vérifications finales globales (T9 comme livrée précédente)

- TSC strict noEmit exit 0
- npm build exit 0, routes count +7
- git diff package.json 0 lignes
- retro EE: `curl /api/connaissance?competence=EE | jq length` = 12
- deploy key audit 0 leaks

*Fin tasks.md v1.0*
