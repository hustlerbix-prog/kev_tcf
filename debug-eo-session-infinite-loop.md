# Debug Session: `eo-session-infinite-loop`

- **sessionId:** eo-session-infinite-loop
- **Status:** [OPEN]
- **Date:** 2026-09-13
- **Reporter:** user screenshot + message: "Pls check this error and it should allows to simulate one tache at the time"

### Symptôme
React error overlay `/expression-orale/[archetypeId]/session`:
```
Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```
Next.js 15.0.3 warning outdated (cosmétique, non-fault).

### Reproduction steps
1. Naviguer vers `/expression-orale`
2. Cliquer n'importe quelle carte Task (T1 · T2 · T3)
3. Cliquer CTA "Drill Texte" ou "Drill Voix" → route `/expression-orale/<id>/session`
4. Attendre le rendu initial → crash overlay rouge.

### Hypothèses H1..H5
- **H1 · `useSpeechIo` voices array reference change** — useEffect dep on `voices` → setState retrigger.
- **H2 · `useEoTimer` onExpire callback** — nouvelle ref à chaque render parent → interval + onExpire → tick dispatch → re-render parent → new onExpire → useEffect cleanup+rearm → tick dispatch → loop.
- **H3 · Reducer renvoie systématiquement nouvel objet** — dispatch in useEffect depends on state → same data new ref → render → dispatch.
- **H4 · Room useEffect EXAMINER_OPENING gate** — transcript.length===0 & state.kind dep → retrigger dispatch multiple fois pendant le fetch runExaminerTurn.
- **H5 · Double useEoTimer instances PREP + DIAL** — les deux appellent dispatch TICK indépendamment; reducer TICK décrémente les deux; les chronos (prep+dial) s'interrompent mutuellement avec remainingMs.

### Trace files suspects
- lib/eo/useEoTimer.ts
- lib/eo/useSpeechIo.ts
- lib/eo/sessionReducer.ts
- app/expression-orale/\[archetypeId\]/session/page.tsx

### Evidence
| step | pre-fix | post-fix |
|---|---|---|
| static read | [pending] | - |
| dev-server console | [pending] | - |
| instrumentation logs | [pending] | - |
| user confirm reproduce | [pending] | - |
