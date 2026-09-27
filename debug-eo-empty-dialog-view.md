# Debug Session: eo-empty-dialog-view

> Generated: 2026-09-25
> Session ID: eo-empty-dialog-view
> Status: [OPEN]
> Bug: Expression Orale session room — Recording indicator shows active (red ⏹ + ENREGISTREMENT label)
> but NO dialog bubbles appear after clicking STOP/Toggle-off. Expected: candidate transcript bubble +
> examiner response bubble render in the conversation view.
> Environment: macOS · Chromium-family browser · Next dev server · Node >= 18

---

## Symptômes

### Actual
- Mode Toggle · On/Off :
  - Click 🎙 → bouton devient rouge ⏹, label ENREGISTREMENT s'affiche (✅ visiblement en cours)
  - Barre silence + ko progress non affichée ? (à confirmer)
  - Click ⏹ STOP → **RIEN ne s'affiche dans la zone conversation bulle** : transcript reste vide
  - Spinner « Transcription… » n'apparaît jamais (?)

### Expected
1. Click STOP → spinner `⏳ Transcription…` (state.isTranscribing === true)
2. POST `/api/eo/transcribe` 200 → `text`, `base64`, `durationSec` retournés
3. `handleCandidateTurnWithAudio` → `runExaminerTurn`
4. `dispatch(CANDIDATE_TEXT text + audio)` → transcript += bulle candidat
5. `dispatch(THINKING)` → fetch `/api/eo/examiner-turn` → transcript += bulle examinateur
6. Audio base64 + mime stockés dans `eo_turns` (SQL columns OK — utilisateur confirmé)

---

## 🔎 5 Hypothèses Falsifiables

| ID | Hypothèse | Comment invalider | Instrumentation point |
|----|-----------|--------------------|-----------------------|
| H1 | `useSpeechIo.stopRecording({commit:true})` **ne retourne pas de committed turn** — le while busy-wait sur `vbStartedRef` timeout à 2500ms car `recorder.onstop` déclenche `vbCommitTurn` avant stopRecording, ou l'inverse. | committed.ok=true & committed=object non null dans stopRecording callback | `stopRecording` return value + `vbCommitTurn` call count + vbStartedRef avant/après busy-wait |
| H2 | `useEffect [speechState.voice.lastTurn, state.kind]` **NE SE DÉCLENCHE JAMAIS** après commitTurn → lastTurn reste null OU state.kind !== 'LISTENING' au moment où lastTurn s'actualise (race), ou bien `processedTurnCommittedAtRef` n'est pas initialisé/incrémenté correctement. | Log useEffect entry + tous les guards du début (5 conditions) ET leurs valeurs actuelles | useEffect guard entry + each guard value + result bypass/or not |
| H3 | POST `/api/eo/transcribe` **FAIL 4xx/5xx** — Whisper API refus, clé invalide, problème route, FormData incomplet (blob vide/chunks.length=0). Mais erreur silencieuse car non visible par user UI. | HTTP status + response body API transcribe. | route transcribe: status line + response payload + error stack if exception |
| H4 | `state.kind` **≠ LISTENING quand dispatch CANDIDATE_TEXT** → reducer case rejette (early return if not LISTENING). Cause: pendant transcription Whisper (3-5s), chronometer timeout ou `ADVANCE_TASK` est passé → state kind = TASK_COMPLETE/EVALUATING, donc CANDIDATE_TEXT ignored, bulle candidat jamais ajoutée → transcript vide. | kind valeur exacte JUSTE avant dispatch CANDIDATE_TEXT | before-dispatch: state.kind + if(kind!==LISTENING) ERROR visiblement UI |
| H5 | `vbCommitTurn` NE CONSTUIT PAS de blob correct — `chunks.length = 0` (ondataavailable ne s'est jamais déclenché) OU MediaRecorder mimeType mal choisi → `Blob.size === 0` OU bytes<2048 threshold trop agressif pour réponses courtes <600ms qui sont pourtant valides mais skippées sans feedback visible. | Blob.size, chunks.length, turn.bytes, turn.durationMs dans commitTurn output | vbCommitTurn chunks count + blob.size + post-process skip reason (if any) |

---

## Instrumentation Plan

### Front-End (session room): Session page.tsx
- DP-E01 : `commitRecordingAndTranscribe` — PRE + POST stopRecording return (ok/error/committed?)
- DP-E02 : `useEffect [voice.lastTurn]` — log des 6 guards ENTIERS + valeurs
- DP-E03 : `transcribeBlob` — PRE POST + status code + payload.text.length si 200
- DP-E04 : `handleCandidateTurnWithAudio` — state.kind before dispatch
- DP-E05 : `runExaminerTurn(candidateText, audioFields)` — PRE examiner-turn call, PRE CANDIDATE_TEXT dispatch
- DP-E06 : `startNewTurnRecording` — startRecording return.ok + streamId
- DP-E07 : `vbPatchState` lastTurn render? — useEffect dep trigger check

### Back-End (Whisper transcribe): route.ts
- DP-T01 : file upload → audioFile.absPath exists? + size bytes + mime
- DP-T02 : fetch OpenAI → request timing + response.ok + response status + JSON parse text length
- DP-T03 : error handling stack trace + 4xx/5xx response body if JSON parseable

### useSpeechIo (VoiceBuffer low level)
- DP-V01 : `vbRecorderRef.onstop` handler appelé ou non? + `vbStartedRef` avant/après appel vbCommitTurn
- DP-V02 : `vbCommitTurn` — chunks.length, new Blob().size, vbStartedRef, vbLastTurnRef assigné ou non
- DP-V03 : `stopRecording` busy-wait: loop itérations, `vbStartedRef` valeur toutes les 20ms, exited normally or timeout-deadline?

---

## Pre-fix Log Evidence

*(will be populated by debug server)*

---

## Hypothesis Verdicts

| ID | Verdict | Evidence (log line) |
|----|---------|---------------------|
| H1 | PENDING | — |
| H2 | PENDING | — |
| H3 | PENDING | — |
| H4 | PENDING | — |
| H5 | PENDING | — |

---

## Fix Applied

*(Pending evidence)*

---

## Post-fix Log Evidence + Comparison Table

| Metric | Pre-fix | Post-fix |
|--------|---------|----------|
| transcript.bubbles après 1 Toggle on→off | 0 | ≥2 (candidat + examinateur) |
| isTranscribing true | ❌ jamais | ✅ 3-5s |
| POST /transcribe HTTP 200 | — | — |

---

## User Confirmation Gate: [PENDING]

A. ✅ Fixed — bulle candidat + examinateur s'affichent  
B. 🔁 Still reproducible  
C. 🔀 Symptoms changed  
D. ⏹ Abort debugging

---

## Cleanup Status

| Artefact | Deleted? |
|----------|----------|
| Instrumentation logs #region blocks | ⏳ NO |
| Debug server process (pid X) | ⏳ NO |
| trae-debug-log-eo-empty-dialog-view.ndjson | ⏳ NO |
| .dbg/eo-empty-dialog-view.env | ⏳ NO |
| debug-eo-empty-dialog-view.md → archived | ⏳ NO |
