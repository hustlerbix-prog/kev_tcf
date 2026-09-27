# Tâche 1 EO — Présentation 1 tour → relance 1 → Évaluation TCF Automatique

## Repository Research (état actuel)

### Architecture
- **Flux actuel T1 examiner prompt (`examinerPrompts.ts:T1-6`)** : `shouldAdvance=true` UNIQUEMENT après **5-8 tours cumulés** (beaucoup d'aller-retour). LLM décide librement quand clore.
- **Relances** : Colonne `relances: string[]` dans chaque archetype T1 DB (EO-001 spec: ex T1-IDE-01: D'où venez-vous? Depuis quand? Le plus dur? 5 ans?). MAIS **NE SONT PAS ENVOYÉES** actuellement dans `fetchExaminerTurn` (body archetype: L229-L239 session/page n'inclut PAS le champ `relances`). Résultat: LLM ignore complètement les relances scriptées → improvisation.
- **Évaluation `/api/eo/evaluate`** : 120s budget, double-evaluator A + B personas, tie-break C si diverge >1 point sur taskLevel, critères P1-P3/L1-L3/S1 × score 0-6 demi-points → CECRL, `scoring.ts` weights + penalties. FONCTIONNE MAIS nécessite user click bouton "Évaluer" (`session/page.tsx L1269 START_EVAL` manuel).
- **`ADVANCE_TASK` → `TASK_COMPLETE`** : déclenché SEULEMENT si `examiner-turn JSON.shouldAdvance === true` → `handleExaminerResponse L291 dispatch ADVANCE_TASK`.
- **sessionReducer transitions** : `LISTENING | THINKING | EXAMINER_TURN + ADVANCE_TASK → TASK_COMPLETE` (déjà OK) ; `TASK_COMPLETE + START_EVAL → EVALUATING → EVAL_DONE → REPORT` (OK).
- **Prérequis bloquant toujours ouvert (debug `eo-empty-dialog-view`)** : user doit valider que Toggle/Auto mode affiche bulle candidat AVANT ce changement. Mais le changement T1-2-turns est orthogone et peut s'appliquer indépendamment (la logique de dispatch transcript est inchangée).

### Bug connu non lié (OPEN — instrumentation + debug server en attente logs pre-fix)
* Session page: transcript bulle vide après toggle stop enregistrement — instrumentations 12 debug-points posées mais logs=0 (user n'a pas cliqué à travers scenario). Seront réactivées après ce plan, ou user peut tester pendant validations.

## Files and Modules (impactés)

| # | Chemin | Changement |
|---|--------|------------|
| F1 | [lib/llm/examinerPrompts.ts](file:///Users/kevche_mini/TFC%20App/lib/llm/examinerPrompts.ts#L10-L20) | Remplace règle T1-6 (5-8 tours) + T1-2 (2-3 relances) PAR **nouveau scénario TCF : exact 2 réponses candidat = 1 présentation + 1 relance suite** puis `shouldAdvance=true` |
| F2 | [app/api/eo/examiner-turn/route.ts](file:///Users/kevche_mini/TFC%20App/app/api/eo/examiner-turn/route.ts#L12-L26) | ÉTEND interface `ExaminerTurnRequest.archetype` avec champ `relances?: string[] \| null`. INJECTE dans `extraContextParts` → section `RELANCES_TCF_OFFICIELLES`. |
| F3 | [app/expression-orale/[archetypeId]/session/page.tsx](file:///Users/kevche_mini/TFC%20App/app/expression-orale/%5BarchetypeId%5D/session/page.tsx#L229-L240) | fetchExaminerTurn body: AJOUT `relances: archetypeData.relances ?? null` |
| F4 | Même [session/page.tsx](file:///Users/kevche_mini/TFC%20App/app/expression-orale/%5BarchetypeId%5D/session/page.tsx#L1269-L1305) (auto-eval T1) | AJOUT useEffect `[state.kind, state.currentTask, state.mode]` : SI kind==='TASK_COMPLETE' && currentTask===1 && mode!=='full_exam' → AUTO-dispatche `START_EVAL` puis appelle `POST /api/eo/evaluate` payload body `{session:{mode}, tasks:[{task:1, archetype, turns: transcript, prep_notes, metrics}]}` + dispatch EVAL_DONE + redirect `/expression-orale/session/${id}`. Garde bouton manuel si full_exam. |
| F5 | Même [session/page.tsx](file:///Users/kevche_mini/TFC%20App/app/expression-orale/%5BarchetypeId%5D/session/page.tsx#L291-L293) (fallback safety guard code-level) | APRÈS `if(result.shouldAdvance) dispatch ADVANCE_TASK` : AJOUT fallback guard HARD si `task===1` + `candidateTurnCount >= 2` → forcer dispatch ADVANCE_TASK même si LLM a oublié shouldAdvance=true (contre 502/JSON raté). |

## Implementation Steps (ordre dépendances)

1. **[F2 + F3] — Wiring relances DB → LLM examiner-turn**
   - Ajout TS champ `relances?: string[] \| null` dans `ExaminerTurnRequest.archetype` (route.ts).
   - Dans route.ts L58 `extraContextParts.push` : bloc `RELANCES_TCF_OFFICIELLES (1 SEULE doit être utilisée après réponse présentation) : 1. X 2. Y 3. Z`.
   - Dans session/page `fetchExaminerTurn` body: `relances: archetypeData.relances ?? null`.

2. **[F1] — Règles examinateur T1 (prompt LLM) ⇒ stricto 2 tours candidat → shouldAdvance=true**
   - Remplace T1-2 (2-3 relances MAX) PAR :
     `T1-2. FLUX RIGIDE TCF CANADA (2 réponses candidat MAX, 1 RELANCE FORCÉE) :
       - TOUR 1 (première réponse candidat après question_ouverture) : PARLE brièvement, puis UTILISE OBLIGATOIREMENT 1 question depuis RELANCES_TCF_OFFICIELLES[0] pour obtenir plus de détails (ex: D'où venez-vous ? / Depuis quand… ?). Ne termine PAS la conversation. shouldAdvance = false.
       - TOUR 2 (seconde réponse candidat à la relance) : remercie brièvement « Merci pour ces précisions… », termine la conversation, shouldAdvance = true.
       - MAXIMUM 2 réponses candidat = exactement 1 présentation + 1 relance. Pas de 3e tour.`
   - Remplace T1-6 : `shouldAdvance = true UNIQUEMENT après la 2ème réponse candidat complète (celle à la relance). Dans TOUS les autres cas, shouldAdvance = false.`
   - Garde T1-1 question_ouverture, T1-4 max 2 questions/tour, T1-5 terminer par question ouverte (PRÉSERVER tour 1). Tour 2: pas de question, shouldAdvance=true + remerciement.

3. **[F5] — Code guard fallback ADVANCE_TASK (niveau Route frontend)**
   - Dans sessionReducer / handleExaminerResponse L291, **ajoute fallback HARD indépendant du LLM** :
     ```ts
     const candidateTurnCount = transcriptSnapshot.filter(t => t.role==='candidate').length;
     if (task === 1 && candidateTurnCount >= 2 && !result.shouldAdvance) {
       dispatch({type:'ADVANCE_TASK'});
     }
     ```
   - Justification: contre LLM JSON error (repairExaminerJson fallbacks), 502 OpenRouter, prompt drift. On ne veut jamais boucle infinie T1 au delà de 2 réponses.

4. **[F4] — Auto START_EVAL + call evaluate endpoint (TASK_COMPLETE && task===1)**
   - useEffect `[state.kind, state.currentTask, state.mode, state.transcript, archetype, sessionId]`.
   - Entry: `if (state.kind !== 'TASK_COMPLETE') return; if (state.currentTask !== 1) return; if (mode === 'full_exam') return; if (autoEvalInFlightRef.current) return;`.
   - Set `autoEvalInFlightRef.current = true; dispatch({type:'START_EVAL'})` + setState `evaluating = true`.
   - `const body: EvaluateBody = { session: {mode, archetype_id:archetype.id}, tasks: [ { task:1, archetype:{id,consigne,categorie,required_moves,scene_facts,complication,duration_sec}, turns: state.transcript, prep_notes: state.notes ?? null, metrics: calcSpeechMetrics?.(state.transcript, archetype) ?? null } ] }` POST `/api/eo/evaluate`.
   - Si 200 OK: `dispatch({type:'EVAL_DONE'}); router.push('/expression-orale/session/' + sessionId)`.
   - Si catch: dispatch ERROR kind reste EVALUATING → `TASK_COMPLETE` avec message user + bouton manuel pour réévaluer.
   - Garde bouton manuel existant L1269 pour cas full_exam ou échec retry.

5. **[Step 5] — Build + smoke checks**
   - `npx tsc --noEmit` strict 0.
   - `npx next build` 35 routes PASS.
   - Push commit main (sans deploy si pas demandé).

## Dependencies and Considerations

- ⚠ OpenRouter crédits 277 tokens restants (msg #8 dernier état) → examiner-turn 502 quota triggerera F5 fallback mais LLM speech réutilisera `repairExaminerJson` fallback speech "Je n'ai pas compris…". Merci $5 top-up OpenRouter ASAP.
- ⚠ Auto-eval `/api/eo/evaluate` coûte ~2× LLM calls (A + B). Vérifier OPENROUTER_API_KEY active.
- ⚠ debug session `eo-empty-dialog-view` toujours OPEN — servers toujours actifs, instruments posés (pas de cleanup avant confirm fix final). Ça n'impacte pas ce plan (aucun fichier touché aux points déjà instrumentés sauf prompts + route relances + session page TASK_COMPLETE — dans session page on garde instruments #region).
- ℹ NF3 0 new npm deps: 0 ajout.
- ℹ Archetype `relances: string[]` : déjà dans `lib/types/eo.ts` + DB 011_eo_seed_72_archetypes.sql (migrations appliquées). Aucun schema DB change requis.
- ℹ scoring.ts, speechMetrics, evaluate/route.ts: 0 change (déjà prêts).

## Validation

1. **tsc strict 0** ✅ avant commit.
2. **next build 35 routes PASS** ✅ avant commit.
3. **Test smoke runtime (3 checks)** :
   - 🔗 `http://localhost:3000/expression-orale/T1-IDE-01/session?mode=drill_text` (safe test rapide sans micro).
   - Vérification Tour 1 examiner speech = question_ouverture (affichage).
   - Saisir texte réponse candidat 1 "Je m'appelle Jean, 28 ans, Montréal depuis 2 ans."
     → examiner speech DOIT contenir 1 relance (ex: "D'où venez-vous exactement en France ?") tirée de RELANCES_TCF_OFFICIELLES [0].
   - Saisir réponse candidat 2.
     → examiner speech = "Merci pour ces détails" + shouldAdvance = true ADVANCE_TASK → kind devient TASK_COMPLETE.
     - useEffect auto-eval `START_EVAL` → spinner évaluation 10~15s.
     - `/expression-orale/session/${id}` rapport auto-rendu avec CECRL scores P1..L3 + tasks[0].taskLevel, synthesis + erreurs.
4. **Test fallback guard F5** : si on force `shouldAdvance=false` dans le JSON LLM, code fallback 2 tours count trigger ADVANCE_TASK quand même (vérifiable via console state.kind).
5. Rappel: pour valider `drill_voice` mode (enregistrement audio + transcript Whisper), il faut d'abord clore le bug `eo-empty-dialog-view`. Le fix T1-2-tours fonctionne aussi en voice une fois transcript bulle candidat fonctionnel.

## Risks

| # | Risque | Niveau | Handling |
|---|--------|--------|----------|
| R1 | LLM ignore prompt T1-2 + utilise relance libre au lieu de `RELANCES_TCF_OFFICIELLES[0]` | Medium | Code guard hard fallback F5 arrête après 2 candidats max quoi qu'il arrive. |
| R2 | RepairExaminerJson fallback → speech générique shouldAdvance=false → 3e tour non désiré | Low | F5 guard candidatTurnCount≥2 force ADVANCE_TASK hors LLM. |
| R3 | Auto-eval 500 côté evaluate (crédits) | Low | UI error affichée + bouton « Réessayer » manuel garde backout. |
| R4 | Mode full_exam T1 passe auto-eval par erreur | Low | Guard `mode!=='full_exam'` strictement. |
| R5 | Prompt T1 (examinerPrompts.ts) modification imprime T2/T3 accidentellement | Low | Changer SEULEMENT les blocs T1-*. |
