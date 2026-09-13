"use client";

import { Suspense, useEffect, useReducer, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import NavLaterale from "@/components/NavLaterale";
import {
  eoSessionReducer,
  createInitialState,
  type SessionState,
} from "@/lib/eo/sessionReducer";
import { useEoTimer } from "@/lib/eo/useEoTimer";
import { useSpeechIo, type RecordingMode } from "@/lib/eo/useSpeechIo";
import type { Archetype, ExaminerTurnResult, ModeId, TaskId, Turn } from "@/lib/types/eo";

function formatTaskDuration(a: Archetype): string {
  const total = a.duration_sec;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatPrepDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function taskChipStyle(task: TaskId): React.CSSProperties {
  if (task === 1) {
    return {
      background: "rgba(40, 86, 158, 0.12)",
      color: "#28569E",
      border: "1px solid rgba(40, 86, 158, 0.25)",
    };
  }
  if (task === 2) {
    return {
      background: "rgba(37, 111, 81, 0.12)",
      color: "#256F51",
      border: "1px solid rgba(37, 111, 81, 0.25)",
    };
  }
  return {
    background: "rgba(181, 94, 40, 0.12)",
    color: "#B55E28",
    border: "1px solid rgba(181, 94, 40, 0.25)",
  };
}

function examinerStatusFromKind(kind: SessionState["kind"]): {
  label: string;
  color: string;
  bg: string;
} {
  switch (kind) {
    case "EXAMINER_TURN":
      return { label: "parle", color: "#BE2F46", bg: "rgba(190, 47, 70, 0.12)" };
    case "THINKING":
      return { label: "réfléchit", color: "#B57C10", bg: "rgba(181, 124, 16, 0.15)" };
    case "LISTENING":
    case "EXAMINER_OPENING":
      return { label: "écoute", color: "#256F51", bg: "rgba(37, 111, 81, 0.14)" };
    case "PREPARING":
      return { label: "préparation", color: "#28569E", bg: "rgba(40, 86, 158, 0.12)" };
    default:
      return { label: "attend", color: "#4C5A6E", bg: "rgba(0,0,0,0.05)" };
  }
}

function SessionRoomInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const archetypeId = params.archetypeId as string;
  const modeParam = (searchParams.get("mode") as ModeId) || "drill_text";

  const [state, dispatch] = useReducer(eoSessionReducer, undefined, createInitialState);
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [textInput, setTextInput] = useState("");
  const [networkError, setNetworkError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const examinerTurnRef = useRef<Promise<unknown> | null>(null);

  const mode: ModeId = archetypeId === "FULL-EXAM" ? "full_exam" : modeParam;
  const isVoiceMode = mode === "drill_voice" || mode === "conversation" || mode === "full_exam";

  const handleCandidateTurnRef = useRef<(text: string) => void>(() => {});
  const handleExaminerResponseRef = useRef<(r: ExaminerTurnResult) => Promise<void>>(
    async () => {}
  );

  const [speechState, speechApi] = useSpeechIo({
    onFinalText: (text) => {
      const trimmed = text.trim();
      if (trimmed.length === 0) return;
      handleCandidateTurnRef.current?.(trimmed);
    },
    silenceThresholdMs: 1800,
    continuous: false,
  });

  const prepTimer = useEoTimer({
    totalMs: state.prepTotalMs,
    running: state.kind === "PREPARING",
    intervalMs: 250,
    onTick: (ms) => {
      if (state.kind === "PREPARING") {
        dispatch({ type: "TICK", payload: ms });
      }
    },
  });

  const mainTimer = useEoTimer({
    totalMs: state.totalMs,
    running:
      state.kind === "EXAMINER_OPENING" ||
      state.kind === "LISTENING" ||
      state.kind === "THINKING" ||
      state.kind === "EXAMINER_TURN" ||
      state.kind === "EVALUATING",
    intervalMs: 250,
    onTick: (ms) => {
      const k = state.kind;
      if (
        k === "EXAMINER_OPENING" ||
        k === "LISTENING" ||
        k === "THINKING" ||
        k === "EXAMINER_TURN" ||
        k === "EVALUATING"
      ) {
        dispatch({ type: "TICK", payload: ms });
      }
    },
  });

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [state.transcript]);

  useEffect(() => {
    const loadArchetype = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        if (archetypeId === "FULL-EXAM") {
          const mock: Archetype = {
            id: "FULL-EXAM",
            task: 1,
            ordre: 0,
            categorie: "Simulation complète 12 min",
            consigne: "3 tâches enchaînées sans pause.",
            duration_sec: 720,
            prep_sec: 120,
            set: "full",
            required_moves: [],
            relances: [],
            lexical_field: [],
            actif: true,
          };
          setArchetype(mock);
          return;
        }
        const res = await fetch(`/api/eo/archetypes/${archetypeId}`);
        if (res.status === 404) {
          router.replace("/expression-orale");
          return;
        }
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}`);
        }
        const d = await res.json();
        setArchetype(d.archetype || d);
      } catch (e) {
        setFetchError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    loadArchetype();
  }, [archetypeId, router]);

  useEffect(() => {
    if (!archetype) return;
    dispatch({
      type: "INIT",
      payload: {
        archetypeId: archetype.id,
        task: archetype.task,
        mode,
        durationSec: archetype.duration_sec,
        prepSec: archetype.prep_sec,
      },
    });
  }, [archetype, mode]);

  useEffect(() => {
    if (state.kind === "IDLE" && archetype && !loading) {
      dispatch({ type: "START" });
    }
  }, [state.kind, archetype, loading]);

  const fetchExaminerTurn = async (
    task: 1 | 2 | 3,
    archetypeData: Archetype,
    transcriptArr: Turn[]
  ): Promise<ExaminerTurnResult> => {
    const trimmedTranscript = transcriptArr.slice(-8).map((t) => ({
      role: t.role as "examiner" | "candidate",
      text: t.text,
    }));

    const res = await fetch("/api/eo/examiner-turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task,
        archetype: {
          id: archetypeData.id,
          consigne: archetypeData.consigne,
          question_ouverture: archetypeData.question_ouverture ?? null,
          required_moves: archetypeData.required_moves ?? null,
          examiner_role: archetypeData.examiner_role ?? null,
          scene_facts: archetypeData.scene_facts ?? null,
          complication: archetypeData.complication ?? null,
          arguments_pour: archetypeData.arguments_pour ?? null,
          arguments_contre: archetypeData.arguments_contre ?? null,
        },
        transcript: trimmedTranscript,
      }),
    });

    if (!res.ok) {
      let detail = "";
      try {
        const data = await res.json();
        detail = data?.error || data?.detail || `HTTP ${res.status}`;
      } catch {
        detail = `HTTP ${res.status}`;
      }
      throw new Error(detail);
    }

    return (await res.json()) as ExaminerTurnResult;
  };

  const handleExaminerResponse = async (result: ExaminerTurnResult) => {
    const lastTurn = state.transcript[state.transcript.length - 1];
    const startMs = lastTurn ? lastTurn.end_ms : 0;
    const endMs = startMs + result.speech.length * 80;

    const turn: Turn = {
      role: "examiner",
      text: result.speech,
      start_ms: startMs,
      end_ms: endMs,
      internal_note: result.internalNote,
    };

    dispatch({ type: "EXAMINER_SPEAK", payload: turn });
    setNetworkError(null);

    try {
      if (isVoiceMode) {
        await speechApi.speak(result.speech, { rate: 0.95 });
      }
    } catch {
      // noop
    }

    dispatch({ type: "EXAMINER_DONE_SPEAKING" });

    if (result.shouldAdvance) {
      dispatch({ type: "ADVANCE_TASK" });
    }
  };

  useEffect(() => {
    handleExaminerResponseRef.current = handleExaminerResponse;
  }, [handleExaminerResponse]);

  const runExaminerTurn = async (candidateText?: string) => {
    if (!archetype) return;

    if (candidateText) {
      dispatch({
        type: "CANDIDATE_TEXT",
        payload: { text: candidateText },
      });
    }

    dispatch({ type: "THINKING" });
    setNetworkError(null);

    const transcriptSnapshot = candidateText
      ? [
          ...state.transcript,
          { role: "candidate" as const, text: candidateText },
        ]
      : state.transcript;

    try {
      const p = fetchExaminerTurn(
        archetype.task as 1 | 2 | 3,
        archetype,
        transcriptSnapshot.map((t) => ({
          role: t.role as "examiner" | "candidate",
          text: t.text,
        })) as Turn[]
      );
      examinerTurnRef.current = p;
      const result = await p;
      await handleExaminerResponse(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setNetworkError(`⚠ Erreur examinateur: ${msg}`);
      dispatch({ type: "ERROR", payload: `Réseau: ${msg}` });
    } finally {
      examinerTurnRef.current = null;
    }
  };

  useEffect(() => {
    if (!archetype) return;
    if (state.kind !== "EXAMINER_OPENING") return;
    if (examinerTurnRef.current) return;
    if (state.transcript.length > 0) return;

    runExaminerTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.kind, archetype]);

  const handleCandidateTurn = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    if (state.kind !== "LISTENING") return;
    void runExaminerTurn(trimmed);
  };

  useEffect(() => {
    handleCandidateTurnRef.current = handleCandidateTurn;
  }, [handleCandidateTurn]);

  const handleSubmitText = () => {
    const t = textInput.trim();
    if (!t) return;
    setTextInput("");
    handleCandidateTurn(t);
  };

  const toggleMicro = () => {
    const rMode = speechState.recordingMode;
    if (speechState.isListening) {
      speechApi.stopListening();
    } else if (rMode === "ptt") {
      // PTT: single click means start immediately (no hold), same as toggle for accessibility
      if (state.kind === "LISTENING" || state.kind === "EXAMINER_OPENING") {
        speechApi.cancelSpeak();
        speechApi.startListening();
      }
    } else if (state.kind === "LISTENING" || state.kind === "EXAMINER_OPENING") {
      speechApi.cancelSpeak();
      speechApi.startListening();
    }
  };

  const pttStart = (e?: React.SyntheticEvent) => {
    if (speechState.recordingMode !== "ptt") return;
    if (speechState.isListening) return;
    if (!(state.kind === "LISTENING" || state.kind === "EXAMINER_OPENING")) return;
    e?.preventDefault?.();
    speechApi.cancelSpeak();
    speechApi.startListening();
  };

  const pttStop = (e?: React.SyntheticEvent) => {
    if (speechState.recordingMode !== "ptt") return;
    if (!speechState.isListening) return;
    e?.preventDefault?.();
    speechApi.stopListening();
  };

  const setRecordingModeStable = (m: RecordingMode) => {
    if (speechState.recordingMode === m) return;
    // When switching mode while listening, stop first to release the mic with the correct silence semantics
    if (speechState.isListening) {
      try {
        speechApi.stopListening();
      } catch {
        // noop
      }
    }
    speechApi.setRecordingMode(m);
  };

  const handleQuitter = () => {
    speechApi.cancelSpeak();
    speechApi.stopListening();
    router.push("/expression-orale");
  };

  const examinerStatus = examinerStatusFromKind(state.kind);
  const chronoFormatted =
    state.kind === "PREPARING" ? prepTimer.formatted : mainTimer.formatted;
  const isLast15s =
    state.kind === "PREPARING" ? prepTimer.isLast15s : mainTimer.isLast15s;

  const canUseMicro =
    isVoiceMode &&
    speechState.sttAvailable &&
    (state.kind === "LISTENING" || state.kind === "EXAMINER_OPENING");

  if (loading || !archetype) {
    return (
      <div className="coquille">
        <NavLaterale routeActive="/expression-orale" />
        <main
          className="contenu-principal"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-encre-3)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Chargement…
        </main>
      </div>
    );
  }

  return (
    <div className="coquille">
      <NavLaterale routeActive="/expression-orale" />
      <main
        className="contenu-principal"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          paddingTop: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                fontWeight: 700,
                padding: "5px 12px",
                borderRadius: 999,
                letterSpacing: "0.02em",
                ...taskChipStyle(archetype.task),
              }}
            >
              Tâche {archetype.task} · {formatTaskDuration(archetype)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-encre-3)",
                fontWeight: 600,
              }}
            >
              {archetype.categorie}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "5px 12px",
                borderRadius: 999,
                background: isVoiceMode
                  ? "rgba(37, 111, 81, 0.10)"
                  : "rgba(0,0,0,0.05)",
                border: isVoiceMode
                  ? "1px solid rgba(37, 111, 81, 0.25)"
                  : "1px solid rgba(0,0,0,0.08)",
                color: isVoiceMode ? "#256F51" : "var(--color-encre-2)",
                fontWeight: 600,
              }}
            >
              {mode === "drill_text"
                ? "Mode texte"
                : mode === "drill_voice"
                ? "Mode vocal"
                : mode === "conversation"
                ? "Conversation"
                : "Examen complet"}
            </span>
          </div>
          <button
            onClick={handleQuitter}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "var(--color-papier)",
              fontFamily: "var(--font-sans)",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Quitter ←
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            padding: "16px 22px",
            background: "var(--color-papier)",
            borderRadius: 16,
            boxShadow: "0 8px 28px rgba(0,0,0,0.20)",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 999,
                background: examinerStatus.bg,
                color: examinerStatus.color,
                border: `1px solid ${examinerStatus.color}33`,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
              }}
            >
              🎙 Examinateur: {examinerStatus.label}
            </span>
            {archetype.prep_sec > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11.5,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  fontWeight: 600,
                  color: "var(--color-encre-2)",
                }}
              >
                Préparation: {formatPrepDuration(archetype.prep_sec)}
              </span>
            )}
            {isVoiceMode && !speechState.sttAvailable && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "rgba(190, 47, 70, 0.08)",
                  border: "1px solid rgba(190, 47, 70, 0.2)",
                  color: "#BE2F46",
                  fontWeight: 600,
                }}
                title="Reconnaissance vocale non disponible sur ce navigateur (préférez Chrome/Edge/Safari macOS)"
              >
                ⚠ STT indisponible
              </span>
            )}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "0.02em",
              lineHeight: 1,
              padding: "4px 24px",
              borderRadius: 14,
              background: isLast15s ? "rgba(245, 158, 11, 0.18)" : "rgba(0,0,0,0.04)",
              color: isLast15s ? "#B45309" : "var(--color-encre)",
              border: isLast15s
                ? "1px solid rgba(245, 158, 11, 0.4)"
                : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            {chronoFormatted}
          </div>
          <div style={{ minWidth: 120 }} />
        </div>

        {fetchError && (
          <div
            style={{
              padding: "16px 18px",
              borderRadius: 12,
              background: "rgba(190, 47, 70, 0.08)",
              border: "1px solid rgba(190, 47, 70, 0.25)",
              color: "#BE2F46",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            ⚠ {fetchError}
          </div>
        )}

        {networkError && (
          <div
            style={{
              padding: "16px 18px",
              borderRadius: 12,
              background: "rgba(245, 158, 11, 0.10)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#92400E",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {networkError}
          </div>
        )}

        {state.error && !networkError && (
          <div
            style={{
              padding: "16px 18px",
              borderRadius: 12,
              background: "rgba(190, 47, 70, 0.08)",
              border: "1px solid rgba(190, 47, 70, 0.25)",
              color: "#BE2F46",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            ⚠ {state.error}
          </div>
        )}

        {state.kind === "PREPARING" ? (
          <div
            style={{
              background: "var(--color-papier)",
              borderRadius: 16,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              boxShadow: "0 8px 28px rgba(0,0,0,0.20)",
              flex: 1,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--color-encre-2)",
                fontWeight: 600,
              }}
            >
              Phase de préparation
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 20,
                fontWeight: 600,
                color: "var(--color-encre)",
                marginBottom: 4,
              }}
            >
              {archetype.consigne}
            </div>
            {archetype.task === 2 && archetype.required_moves && archetype.required_moves.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 20, color: "var(--color-encre-2)" }}>
                {archetype.required_moves.map((m, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    {m}
                  </li>
                ))}
              </ul>
            )}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={14}
              placeholder="Notez 3-4 questions ouvertes + scénarios pour le jeu de rôle. Aucun micro ici."
              style={{
                width: "100%",
                padding: "16px 18px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.6)",
                fontSize: 15,
                lineHeight: 1.6,
                fontFamily: "var(--font-serif)",
                resize: "vertical",
                color: "var(--color-encre)",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => dispatch({ type: "PREP_DONE" })}
                style={{
                  padding: "12px 26px",
                  borderRadius: 11,
                  background: "var(--color-encre)",
                  color: "var(--color-papier)",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "1px solid rgba(0,0,0,0.2)",
                  cursor: "pointer",
                }}
              >
                Passer au dialogue →
              </button>
            </div>
          </div>
        ) : state.kind === "TASK_COMPLETE" ? (
          <div
            style={{
              background: "var(--color-papier)",
              borderRadius: 16,
              padding: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
              boxShadow: "0 8px 28px rgba(0,0,0,0.20)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 56 }}>✅</div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 26,
                fontWeight: 700,
                color: "var(--color-encre)",
              }}
            >
              Tâche {state.currentTask} terminée · Merci !
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--color-encre-2)",
                maxWidth: 560,
                lineHeight: 1.55,
              }}
            >
              {state.transcript.length} échanges enregistrés. Vous pouvez reprendre,
              évaluer votre performance pour cette tâche seule, ou consulter
              l'historique global.
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={() => dispatch({ type: "RESET" })}
                style={{
                  padding: "12px 24px",
                  borderRadius: 11,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "var(--color-papier-2)",
                  color: "var(--color-encre)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                ↻ Reprendre (rejouer cette tâche)
              </button>
              <button
                onClick={async () => {
                  if (!archetype) return;
                  dispatch({ type: "START_EVAL" });
                  try {
                    const evalRes = await fetch("/api/eo/evaluate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        session: { mode, target_note_20: 10 },
                        tasks: [
                          {
                            task: archetype.task,
                            archetype: {
                              id: archetype.id,
                              task: archetype.task,
                              consigne: archetype.consigne,
                              question_ouverture: archetype.question_ouverture ?? null,
                              required_moves: archetype.required_moves ?? null,
                              examiner_role: archetype.examiner_role ?? null,
                              scene_facts: archetype.scene_facts ?? null,
                              complication: archetype.complication ?? null,
                              arguments_pour: archetype.arguments_pour ?? null,
                              arguments_contre: archetype.arguments_contre ?? null,
                            },
                            turns: state.transcript,
                            prep_notes: notes || null,
                          },
                        ],
                      }),
                    });
                    if (!evalRes.ok) throw new Error(`HTTP ${evalRes.status}`);
                    const evalData = await evalRes.json();
                    const sessRes = await fetch("/api/eo/sessions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        mode,
                        target_note_20: 10,
                        evaluation: evalData.evaluation,
                        tasks_snapshot: [
                          {
                            task: archetype.task,
                            archetype_id: archetype.id,
                            turns: state.transcript,
                          },
                        ],
                      }),
                    });
                    let sessionId = archetype.id + "-" + Date.now();
                    if (sessRes.ok) {
                      const s = await sessRes.json();
                      sessionId = s.session?.id || sessionId;
                    }
                    router.replace(`/expression-orale/session/${encodeURIComponent(sessionId)}`);
                  } catch (e) {
                    const msg = e instanceof Error ? e.message : String(e);
                    dispatch({ type: "ERROR", payload: `Évaluation: ${msg}` });
                    setNetworkError(`⚠ Évaluation échouée: ${msg} · Réessayez plus tard.`);
                  }
                }}
                disabled={state.transcript.length === 0}
                style={{
                  padding: "12px 26px",
                  borderRadius: 11,
                  background: state.transcript.length === 0 ? "rgba(0,0,0,0.08)" : "#BE2F46",
                  color: "var(--color-papier)",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "1px solid rgba(0,0,0,0.2)",
                  cursor: state.transcript.length === 0 ? "not-allowed" : "pointer",
                  opacity: state.transcript.length === 0 ? 0.6 : 1,
                }}
              >
                📊 Évaluer ma performance (cette tâche seule)
              </button>
              <Link
                href="/expression-orale/historique"
                style={{
                  padding: "12px 24px",
                  borderRadius: 11,
                  background: "#256F51",
                  color: "var(--color-papier)",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "1px solid rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                📚 Historique global
              </Link>
            </div>
            {state.transcript.length === 0 && (
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--color-encre-3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ⚠ transcript vide — commencez un tour de dialogue pour évaluer.
              </div>
            )}
          </div>
        ) : state.kind === "EVALUATING" ? (
          <div
            style={{
              background: "var(--color-papier)",
              borderRadius: 16,
              padding: 60,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              boxShadow: "0 8px 28px rgba(0,0,0,0.20)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: "4px solid rgba(37,111,81,0.2)",
                borderTopColor: "#256F51",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 20,
                fontWeight: 600,
                color: "var(--color-encre)",
              }}
            >
              Évaluation en cours…
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "var(--color-papier)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 280px)",
              minHeight: 500,
              boxShadow: "0 8px 28px rgba(0,0,0,0.20)",
              overflow: "hidden",
            }}
          >
            <div
              ref={transcriptRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {state.transcript.length === 0 ? (
                <div
                  style={{
                    margin: "auto",
                    textAlign: "center",
                    color: "var(--color-encre-3)",
                    fontFamily: "var(--font-serif)",
                    fontSize: 16,
                    maxWidth: 480,
                  }}
                >
                  {state.kind === "THINKING"
                    ? "L'examinateur prépare sa première intervention…"
                    : "Le dialogue va commencer. Préparez-vous à répondre à l'examinateur."}
                </div>
              ) : (
                <>
                  {state.transcript.map((turn, idx) => {
                    const isExaminer = turn.role === "examiner";
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: isExaminer ? "flex-start" : "flex-end",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            maxWidth: "80%",
                            alignItems: "flex-start",
                            flexDirection: isExaminer ? "row" : "row-reverse",
                          }}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: isExaminer
                                ? "rgba(37, 99, 235, 0.10)"
                                : "rgba(180, 83, 9, 0.12)",
                              color: isExaminer ? "#2563EB" : "#B45309",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "var(--font-mono)",
                              fontSize: 12,
                              fontWeight: 700,
                              flexShrink: 0,
                              border: `1px solid ${
                                isExaminer
                                  ? "rgba(37, 99, 235, 0.2)"
                                  : "rgba(180, 83, 9, 0.2)"
                              }`,
                            }}
                          >
                            {isExaminer ? "EX" : "VO"}
                          </div>
                          <div
                            style={{
                              padding: "12px 16px",
                              borderRadius: isExaminer
                                ? "4px 14px 14px 14px"
                                : "14px 4px 14px 14px",
                              background: isExaminer
                                ? "rgba(37, 99, 235, 0.08)"
                                : "rgba(180, 83, 9, 0.08)",
                              color: "var(--color-encre)",
                              fontSize: 14.5,
                              lineHeight: 1.55,
                              border: isExaminer
                                ? "1px solid rgba(37, 99, 235, 0.15)"
                                : "1px solid rgba(180, 83, 9, 0.15)",
                            }}
                          >
                            <div style={{ whiteSpace: "pre-wrap" }}>{turn.text}</div>
                            {turn.internal_note && (
                              <div
                                style={{
                                  marginTop: 8,
                                  fontSize: 12,
                                  color: "var(--color-encre-3)",
                                  fontStyle: "italic",
                                }}
                              >
                                {turn.internal_note}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {speechState.isListening && speechState.partialTranscript && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          maxWidth: "80%",
                          alignItems: "flex-start",
                          flexDirection: "row-reverse",
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "rgba(180, 83, 9, 0.12)",
                            color: "#B45309",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0,
                            border: "1px solid rgba(180, 83, 9, 0.2)",
                          }}
                        >
                          VO
                        </div>
                        <div
                          style={{
                            padding: "12px 16px",
                            borderRadius: "14px 4px 14px 14px",
                            background: "rgba(180, 83, 9, 0.05)",
                            color: "var(--color-encre-2)",
                            fontSize: 14.5,
                            lineHeight: 1.55,
                            border: "1px dashed rgba(180, 83, 9, 0.25)",
                            fontStyle: "italic",
                          }}
                        >
                          <div style={{ whiteSpace: "pre-wrap" }}>
                            {speechState.partialTranscript}…
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {state.kind === "THINKING" && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          padding: "12px 16px",
                          borderRadius: "4px 14px 14px 14px",
                          background: "rgba(181, 124, 16, 0.08)",
                          color: "#B57C10",
                          fontSize: 13,
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                          border: "1px solid rgba(181, 124, 16, 0.15)",
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            border: "2px solid rgba(181, 124, 16, 0.25)",
                            borderTopColor: "#B57C10",
                            borderRadius: "50%",
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                        L'examinateur réfléchit…
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(0,0,0,0.08)",
                padding: "18px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                background: "rgba(0,0,0,0.02)",
              }}
            >
              {isVoiceMode && speechState.sttAvailable && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  {(["auto", "toggle", "ptt"] as RecordingMode[]).map((m) => {
                    const active = speechState.recordingMode === m;
                    const label =
                      m === "auto"
                        ? "Auto (1,8s silence)"
                        : m === "toggle"
                        ? "Cliquer pour On / Off"
                        : "Maintenir pour parler";
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setRecordingModeStable(m)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 999,
                          border: active
                            ? "1px solid #256F51"
                            : "1px solid rgba(0,0,0,0.14)",
                          background: active
                            ? "rgba(37, 111, 81, 0.12)"
                            : "rgba(255,255,255,0.6)",
                          color: active ? "#1F523A" : "var(--color-encre-3)",
                          fontSize: 12,
                          fontWeight: active ? 700 : 500,
                          cursor: "pointer",
                          letterSpacing: 0.1,
                          fontFamily: "var(--font-mono)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "center", gap: 20, alignItems: "center" }}>
                <button
                  onClick={toggleMicro}
                  onPointerDown={pttStart}
                  onPointerUp={pttStop}
                  onPointerLeave={(e) => {
                    if (speechState.recordingMode === "ptt" && speechState.isListening) pttStop(e);
                  }}
                  onPointerCancel={(e) => {
                    if (speechState.recordingMode === "ptt") pttStop(e);
                  }}
                  onContextMenu={(e) => {
                    if (speechState.recordingMode === "ptt") e.preventDefault();
                  }}
                  disabled={!canUseMicro && !speechState.isListening}
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background: speechState.isListening
                      ? speechState.recordingMode === "ptt"
                        ? "rgba(37, 111, 81, 0.22)"
                        : "rgba(190, 47, 70, 0.15)"
                      : canUseMicro
                      ? "rgba(37, 111, 81, 0.10)"
                      : "rgba(0,0,0,0.06)",
                    border: speechState.isListening
                      ? speechState.recordingMode === "ptt"
                        ? "3px solid #256F51"
                        : "3px solid #BE2F46"
                      : canUseMicro
                      ? "2px solid rgba(37, 111, 81, 0.45)"
                      : "2px dashed rgba(0,0,0,0.2)",
                    color: speechState.isListening
                      ? speechState.recordingMode === "ptt"
                        ? "#256F51"
                        : "#BE2F46"
                      : canUseMicro
                      ? "#256F51"
                      : "var(--color-encre-3)",
                    fontSize: 30,
                    cursor:
                      canUseMicro || speechState.isListening ? "pointer" : "not-allowed",
                    opacity: canUseMicro || speechState.isListening ? 1 : 0.6,
                    transition: "all 0.15s ease",
                    touchAction: "none",
                    userSelect: "none",
                    outline: "none",
                  }}
                  title={(() => {
                    const m = speechState.recordingMode;
                    if (speechState.isListening) {
                      return m === "toggle"
                        ? "⏹ Cliquer pour arrêter"
                        : m === "ptt"
                        ? "Relâcher pour arrêter"
                        : "⏹ Arrêter ou attendre 1,8s de silence";
                    }
                    if (canUseMicro) {
                      return m === "toggle"
                        ? "🎙 Cliquer pour commencer"
                        : m === "ptt"
                        ? "🎙 Maintenir enfoncé pour parler"
                        : "🎙 Cliquer puis parler (1,8s silence = fin)";
                    }
                    if (isVoiceMode) {
                      return "Micro désactivé (STT non dispo / attente tour)";
                    }
                    return "Mode texte uniquement — ?mode=drill_voice dans l'URL";
                  })()}
                >
                  {speechState.isListening
                    ? speechState.recordingMode === "ptt"
                      ? "🎙"
                      : "⏹"
                    : "🎙"}
                </button>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    alignItems: "flex-start",
                    minWidth: 220,
                  }}
                >
                  {speechState.isListening ? (
                    <>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color:
                            speechState.recordingMode === "ptt" ? "#256F51" : "#BE2F46",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                        }}
                      >
                        {speechState.recordingMode === "auto"
                          ? "ENREGISTREMENT AUTO"
                          : speechState.recordingMode === "toggle"
                          ? "ENREGISTREMENT · CLIQUER ⏹ POUR STOP"
                          : "ENREGISTREMENT · RELÂCHER BOUTON POUR STOP"}
                      </div>
                      {speechState.recordingMode === "auto" && (
                        <>
                          <div
                            style={{
                              width: "100%",
                              height: 6,
                              background: "rgba(0,0,0,0.06)",
                              borderRadius: 999,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.min(
                                  100,
                                  (speechState.silenceMs / 1800) * 100
                                )}%`,
                                background:
                                  speechState.silenceMs > 1200
                                    ? "#BE2F46"
                                    : speechState.silenceMs > 600
                                    ? "#F59E0B"
                                    : "#256F51",
                                transition: "width 0.1s linear",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 10.5,
                              color: "var(--color-encre-3)",
                            }}
                          >
                            silence: {(speechState.silenceMs / 1000).toFixed(1)}s / 1.8s
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "#4C5A6E",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                        }}
                      >
                        {!isVoiceMode
                          ? "MODE TEXTE"
                          : !speechState.sttAvailable
                          ? "STT INDISPONIBLE"
                          : !canUseMicro
                          ? "ATTENTE DU TOUR…"
                          : speechState.recordingMode === "ptt"
                          ? "MAINTENIR POUR PARLER"
                          : speechState.recordingMode === "toggle"
                          ? "CLIQUER POUR DÉMARRER"
                          : "PRÊT · CLIQUER PUIS PARLER"}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10.5,
                          color: "var(--color-encre-3)",
                        }}
                      >
                        {isVoiceMode && speechState.sttAvailable
                          ? speechState.recordingMode === "auto"
                            ? "Fin automatique après 1,8s de silence"
                            : speechState.recordingMode === "toggle"
                            ? "Un clic ON / un clic OFF — pas d'arrêt automatique"
                            : "Enregistre seulement tant que le bouton est enfoncé"
                          : "Utiliser le textarea ci-dessous"}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div
                style={{
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: "var(--color-encre-3)",
                }}
              >
                {isVoiceMode
                  ? speechState.sttAvailable
                    ? `Micro ${speechState.lang} · voix: ${speechState.selectedVoice || "système"} · ${
                        speechState.isSpeaking ? "🔊 TTS en cours" : "prêt"
                      }`
                    : "STT indisponible (Chrome/Edge/Safari desktop). Utilisez le textarea ci-dessous."
                  : "Mode texte · réponse par clavier uniquement"}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitText();
                    }
                  }}
                  placeholder={
                    state.kind === "LISTENING"
                      ? mode === "drill_text"
                        ? "Entrez votre réponse puis Envoyer (ou Entrée)"
                        : "Fallback texte : écrivez ici puis Envoyer"
                      : state.kind === "THINKING" || state.kind === "EXAMINER_TURN"
                      ? "Attendez votre tour…"
                      : "Préparation…"
                  }
                  rows={2}
                  disabled={state.kind !== "LISTENING"}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "var(--color-papier)",
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    resize: "none",
                    color: state.kind === "LISTENING" ? "var(--color-encre)" : "var(--color-encre-3)",
                    fontFamily: "var(--font-sans)",
                    opacity: state.kind === "LISTENING" ? 1 : 0.7,
                  }}
                />
                <button
                  onClick={handleSubmitText}
                  disabled={!textInput.trim() || state.kind !== "LISTENING"}
                  style={{
                    padding: "0 26px",
                    borderRadius: 12,
                    background:
                      state.kind === "LISTENING" && textInput.trim()
                        ? "#256F51"
                        : "rgba(0,0,0,0.08)",
                    color:
                      state.kind === "LISTENING" && textInput.trim()
                        ? "var(--color-papier)"
                        : "var(--color-encre-3)",
                    fontWeight: 700,
                    fontSize: 14,
                    border:
                      state.kind === "LISTENING" && textInput.trim()
                        ? "1px solid rgba(0,0,0,0.2)"
                        : "1px solid rgba(0,0,0,0.08)",
                    cursor:
                      state.kind === "LISTENING" && textInput.trim()
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    </div>
  );
}

export default function PageSessionRoom() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#FDF8F3",
            fontFamily: "var(--font-sans)",
            padding: "32px 24px",
            color: "#1F2937",
          }}
        >
          <NavLaterale routeActive={"/expression-orale"} />
          <main
            style={{
              maxWidth: 1120,
              margin: "32px auto 0 260px",
              textAlign: "center",
              paddingTop: 64,
              color: "#4C5A6E",
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            Chargement…
          </main>
        </div>
      }
    >
      <SessionRoomInner />
    </Suspense>
  );
}
