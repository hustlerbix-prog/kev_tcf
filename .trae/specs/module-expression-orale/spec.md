# Spec — Module Expression Orale (EO) · TCF Canada

**Root source of truth:** [EO-001_module_expression_orale.md](file:///Users/kevche_mini/TFC%20App/EO-001_module_expression_orale.md) (5 sections principales; §2 officielle France Éducation International).

**Target repo:** `/Users/kevche_mini/TFC App` · Next.js App Router · Supabase Postgres · 0 nouvelles dépendances npm (NF3).

---

## 1. Problème / Utilisateurs / Objectifs

**Problème:** Le module `Expression écrite` fonctionne (correction IA, note /20, CECRL, progression, etc.) mais `Expression Orale` n'existe pas dans ce repo — seulement une page placeholder consultative et une base de connaissance 21 fiches. Le candidat ne peut **pas** simuler l'épreuve orale de 12 minutes.

**Utilisateurs:**
1. Candidat hispanophone, objectif NCLC 7 = 10–11/20 = B2 TCF Canada.
2. Self-study : drills, conversations IA, examen complet 12 min, progression.

**Objectifs:**
- Simulateur EO fonctionnel 3 tâches enchaînées, 12 min total, avec timers officiels (T1=2:00, T2=2:00 prep + 3:30, T3=4:30).
- Examinateur IA (T1 questions progressives / T2 inversion rôle répond / T3 parle <15%).
- Note estimée /20 + CECRL + NCLC avec **double évaluation indépendante** + tie-break (réplique double cécité officiel).
- Historique sessions + courbe note20.
- Rapport 7 critères (P1/P2/P3/L1/L2/L3/S1), transcript annotée, reformulations B2.

**Non-objectifs v1:**
- Acoustique phonétique fine, analyse formants (uniquement heuristiques: transcription STT erronée + métriques rythme).
- Certificat officiel.
- Compréhension orale.
- Nouvelles dépendances npm : utiliser `window.SpeechRecognition` (Chrome/Edge) + `speechSynthesis` (navigateur natifs, 0 dep).

---

## 2. Exigences fonctionnelles

### EF1 — Catalogue 72 Archetypes (§8)
1. Tâche 1 (20 archetypes · §8.1 — `T1-IDE-01` … `T1-BEN-20`). Champs `id, task=1, category, set, consigne (question ouverture), relances: [string×4], examinerRole="Examinateur TCF", candidateRole="Candidat", durationSec=120, prepSec=0, objective, requiredMoves, lexicalField`.
2. Tâche 2 (24 archetypes · §8.2). Champs: `id, task=2, category, set, consigne, durationSec=210, prepSec=120, examinerRole, candidateRole, sceneFacts: string[6..10], complication: string, requiredMoves: string[5..7], lexicalField: string[12..20]`.
3. Tâche 3 (28 archetypes · §8.3). Champs: `id, task=3, category=Familia, set, consigne (question), durationSec=270, prepSec=0, argumentsPour[3], argumentsContre[3], exemplesConcrets[2], connecteurs[6], plan 4 temps, lexicalField`.
4. `set = 'quick' | 'full'`. Quick Set = 52 archs (§8 colonnes [QS]) marqués `**[QS]**` ; Full = 72.
5. Persistance: stocker via Supabase Postgres `eo_archetypes` table (migration SQL, seed). Pas de JSON import statique.

### EF2 — Modes (§3)
1. `drill_text` (0 crédit, voix text seul)
2. `drill_voice` (1 crédit — STT + évalu)
3. `conversation` (3 crédits — dialogue tour par tour IA)
4. `full_exam` (6 crédits — T1→T2→T3 enchaîné, 12 min sans pause)
5. `review` (0 — historique)

### EF3 — Machine à états Session (§4.2)
Réducer puro TypeScript, transport (audio/texte) sépare.

États: `IDLE → BRIEFING → PREPARING (seulement T2, 2min) → EXAMINER_OPENING → LISTENING → THINKING → EXAMINER_TURN → loop → TASK_COMPLETE → EVALUATING → REPORT`.

Règles crono dures:
1. Timer démarre `EXAMINER_OPENING`, pas chargement.
2. Jamais pausé. Silence = temps compté.
3. 15 s fin — barre ambre visuelle, pas sonore.
4. Expiration: examiner clôture ("Merci…"), attend fin de tour, overtimeSeconds max 20 s.
5. `full_exam`: 0 pause T1→T2 (prep) → T3.

### EF4 — Examinateur IA (§5)
Règles communes (T1/T2/T3): 1-2 phrases/tour, tuto/vouvoiement par consigne, silence >6 s → 1 relance neutre, réponse incompréhensible → 1 reformulation, **zéro correction pendant session**, sortie toujours `{ speech, internalNote, shouldAdvance }` JSON.
- T1: Question ouverture → fait → récit → projet/hypothèse; 5-8 questions en 2min; vous.
- T2 (rôle inversé §5.4): CANDIDAT pose questions. Examineur répond BRÈVEMENT, **jamais offre info non demandée**, 1 relance "Tu as d'autres questions?" si narration, mi-parcours complication injectée, fin 10 s clotûre.
- T3: Examinateur pose question UNE FOIS. Parle <15% du temps. Interventions 4 cas seulement: silence >6s / approfondissement / hors-sujet / 45 s sans conclusion.

### EF5 — Évaluation + Note (§6)
- 7 CRITÈRES (P1/P2/P3/L1/L2/L3/S1) × score 0..6 avec demi-points × `LEVELS = [A1_non_atteint, A1, A2, B1, B2, C1, C2]` (indices 0..6).
- PONDÉRATIONS CRITÈRES/PAR TÂCHE (config constante, commentée heuristique):
  T1 `{P1:.15 P2:.1 P3:.2 L1:.15 L2:.15 L3:.15 S1:.1}` ; T2 `{P1:.25 P2:.05 P3:.25 L1:.12 L2:.13 L3:.1 S1:.1}` ; T3 `{P1:.15 P2:.25 P3:.05 L1:.15 L2:.15 L3:.2 S1:.05}`.
- PONDÉRATIONS TÂCHES: T1=.25 T2=.35 T3=.40 (config, UI affichage transparence §11.5).
- **DOUBLE ÉVAL indéps** (evalA=temp 0.2 correcteur standard, evalB=temp 0.5 correcteur sévère). Tie-break 3ème si delta ≥1.5.
- CALCUL: ANCHORS = `[[0,0],[1,1],[2,3.5],[3,7.5],[4,11.5],[5,15.5],[6,19]]` piecewiseLinear level→note20 0..20 arrondi.
- NCLC: 16+→10+, 14+→9, 12+→8, 10+→7, <10→`<7 (estim)` avec TODO IRCC banner.
- **PÉNALITÉS DURES** §6.4: 0 turn candidat→level=0, >50% HS→level≤1, T2 0 question→P1≤1 P3≤1, <25% speech→L3≤2, autre langue >1 mot→S1≤2.
- SpeechMetrics EN CODE, PAS LLM: candidateSpeakingSec, silenceSec (>2 s acc), longestSilenceSec, WPM, turnCount, questionsAsked (fin phrase ?), fillerCount (/euh|hum|hein|bein|este|bueno|o sea/g), typeTokenRatio (lexDiv).
- Contrat JSON evaluator §6.5 strict. Max 8 errors/task, max 4 upgrades/task, comment ≤ 220 chars, evidence = citation littérale transcription.
- Fallback JSON (même architecture EE module): partial repair, plain-text si irréparable, retry bouton.

### EF6 — UI 5 Routes (§4.1 + §11)
1. `/expression-orale` (remplace placeholder) : Tab bar [All · Task 1 · Task 2 · Task 3] · label `72 archétypes · 20T1 · 24T2 · 28T3` · filtre set Quick Set (52) / Full Coverage (72) · filtre Done / Not done · carte par arch (durée exacte · dernière note chip) · bouton **« Simulation complète 12 min »** → `/expression-orale/exam`.
2. `/expression-orale/[archetypeId]` (étude mode): consigne + trad-ES toggle + lexicalField accordéon + T2 requiredMoves visible + T3 argumentsPour/Contre + plan 4t + 3 boutons lancement drill_text(0) / drill_voice(1) / conversation(3).
3. `/expression-orale/[archetypeId]/session` (salle). Layout sobrio: haut chip tâche + chrono géant reverse + progress bar; centre transcript 2 couleurs auto-scroll; status examiner (écoute / réfléchit / parle); bas microphone unique grand; PREPARING T2 = bloc-notes mono 0 IA + 2min; abandonner confirm.
4. `/expression-orale/session/[sessionId]` (rapport §11.4): 1/ Note globale (XX/20 · CECRL · NCLC · objectif-distance), 2/ Radar 7 critères + B2 threshold line, 3/ Par tâche (level + speaking ratio + questions + longest silence), 4/ Transcript annotée marge + audio player tour par tour, 5/ B2 upgrades, 6/ Les 3 corrections prioritaires, 7/ Prochaine session suggérée. Bloc pliable « Comment cette note est-elle calculée? » §11.5 transparence + disclaimer estim non officiel §6.6.
5. `/expression-orale/historique` (§11.6): tableau sessions + graph évolution note20 ligne objectif 10.

### EF7 — Stockage
- `eo_archetypes` table Supabase (migration SQL seed 72).
- `eo_sessions` + `eo_task_runs` + `eo_turns` (SQL mig 010, RLS anon insert user-own, service_role read/write all).
- Credits: réutiliser schema crédits EE existant (sinon colonne `credits_eo INT DEFAULT 0` users).
- Audio par tour: `URL.createObjectURL(Blob)` côté client session seule; v1 ne persiste pas upload blob hors session (Hors scope).

---

## 3. Exigences non-fonctionnelles

| # | Type | Valeur |
|---|---|---|
| NFR1 | Latence IA → TTS | < 2.5 s fin tour → début parole examinateur; <1.5s mode texte |
| NFR2 | Nouvelles dépendances npm | **ZÉRO** ; STT/TTS natifs navigateur ; fallback text si STT indisponible |
| NFR3 | Strict TypeScript | `tsc --noEmit` exit 0 ; no-Implicit-Any on |
| NFR4 | Next build | routes attendues: expression-orale ○ + ƒ/[id] + ƒ/[id]/session + ƒ/session/[id] + ƒ/historique + ƒ/exam + API ƒ/orale/* → routes count +7 |
| NFR5 | Sécurité crédits | dépense vérifiée côté SERVER avant appel LLM; client cannot bypass |
| NFR6 | Rétro-compat EE | 0 changement dans module Expression Écrite (pages, composants, prompts A15-A21) ; A22 EO injectée prompts.ts |
| NFR7 | Tests anclaje unitaire (§13): ALL PASS | level=4→11/20 B2 NCLC7; level=3→8/20 B1 NCLC<7; level=5→15/20 C1 NCLC9; T2 0 turn→level 0; transcrip vide→report 0 erreur |
| NFR8 | Accessibilité | Room session opérable clavier seule (tab/enter microphone) ; ARIA labels examiner status ; chrono aria-live |

---

## 4. Contraintes, dépendances, hypothèses, questions ouvertes

**Contraintes:**
- Palette correction sombre respectée; Sidebar consultation couleur inchangée.
- 0 npm deps: utiliser `window.webkitSpeechRecognition || SpeechRecognition` + `window.speechSynthesis`. Fallback: mode text (chat).
- OpenRouter crédits (critique: utilisateur doit top-up).
- Supabase Project xvdqxssxziixlhvxgfrk (même).

**Dépendances:**
- API openrouter existante [lib/llm/openrouter.ts](file:///Users/kevche_mini/TFC%20App/lib/llm/openrouter.ts).
- Parser/résultat EE existant [lib/llm/parser.ts](file:///Users/kevche_mini/TFC%20App/lib/llm/parser.ts) · réutiliser pattern repair JSON + DEFAULT_PROMPTS save.

**Hypothèses acceptées (risques marqués TODO VÉRIFIER):**
- H1: Poids T1/T2/T3 0.25/0.35/0.40 sont heuristiques (France Education Inter ne publie pas). → DISPLAYED §11.5.
- H2: NCLC <7 non vérifiés IRCC. → UI « NCLC <7 (estimation) ».
- H3: Prononciation = heuristiques à partir STT erreurs + rythme (pas acoustique). → mentionné rapport.
- H4: Locale voix TTS fr-CA disponible sur le système utilisateur; sinon fallback fr-FR (navigateur choix).

**Questions ouvertes (user answer before Approve si nécessaire, sinon default OUI):**
- Q1: Crédits par défaut attribués au user first sign-up? (default=10 crédits gratuits si table credits).
- Q2: Où mettre bouton « Simulation complète 12 min » — barre supérieure (oui) ou separate page exam? (default: barre sup + page exam confirm 6 cr + 12 min)

---

## 5. Critères d'acceptation

**Type: RÈGLE (valeur binaire, observable)**
- AC R1 · Seed 72 archetypes Supabase: T1=20, T2=24, T3=28; Set `quick`=52, `full`+=20 → total 72. SELECT task, count(*) GROUP BY task → [1:20, 2:24, 3:28].
- AC R2 · Timers: T1=2:00, T2 prep=2:00, T2 dialogue=3:30, T3=4:30; full_exam total ≤12min sans pause.
- AC R3 · T2 inverse rôles: Examinateur **jamais** pose question (sauf 1 relance si narration 2 tours). Output logs examinerTurn speech.endsWith("?") count = 0 (sauf relance). Max = 1.
- AC R4 · T3 parole: Temps parole examinateur ≤ 15% total tâche. Calcul metrics mots examiner / mots candidat.
- AC R5 · Double eval + tiebreak: 2 appels indépendants. If |levelA-task[i] - levelB-task[i]| ≥ 1.5 → 3rd appel + discard extremum. Tiebreak traceable.
- AC R6 · ANCHORS (§13 tests): level 4 → note20=11 B2 NCLC7; level 3 → 8 B1 NCLC<7; level 5 → 15 C1 NCLC9. Exact match.
- AC R7 · Pénalités dures: T2 sans question → P1≤1 & P3≤1; <25% parole → L3≤2; production 0 tour → A1 non atteint. All pass.
- AC R8 · Npm 0 deps: `git diff --stat package.json | wc -l` = 0; `npm ls react-markdown marked …` exit=1 same.
- AC R9 · Routes Next: `/expression-orale`, `/expression-orale/[id]`, `/expression-orale/[id]/session`, `/expression-orale/session/[id]`, `/expression-orale/historique`, `/expression-orale/exam` présentes build.
- AC R10 · Rétro EE: `curl /api/connaissance competence=EE len=12` PASS 0 changement.

**Type: RUBRIQUE (évaluatif, seuil 4/6)**
- AC U1 · UX Salle session: sobriété, 1 colonne, chrono visible, transcript lisible, micro accessible clavier. Seuil = Good /6 ≥ 4.
- AC U2 · Rapport lisibilité: note CTA, radar radar-chart 2D canvas 0-deps pure <canvas>, couleurs correction sombre. Threshold ≥4/6.
- AC U3 · Cohérence EE↔EO: composants note / KPI / correction card / reformulation B2 identiques style palette Expression écrite. ≥4/6.

---

*Fin spec v1.0. Root: EO-001 §0..§14.4.*
