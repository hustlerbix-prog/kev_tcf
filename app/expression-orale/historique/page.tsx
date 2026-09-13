"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NavLaterale from "@/components/NavLaterale";
import CanvasLineChart from "@/lib/eo/canvasLineChart";
import {
  type EoEvaluation,
  type EoSession,
  type ModeId,
  LEVELS,
} from "@/lib/types/eo";
import { note20ToNclc, levelToNote20 } from "@/lib/eo/scoring";

type SessionRow = EoSession & { id: string; started_at: string };

const MODES_DISPLAY: Record<ModeId, { label: string; color: string; bg: string }> = {
  drill_text: { label: "Drill texte", color: "#0369A1", bg: "rgba(3, 105, 161, 0.10)" },
  drill_voice: { label: "Drill vocal", color: "#1D4ED8", bg: "rgba(29, 78, 216, 0.10)" },
  conversation: { label: "Conversation", color: "#7C3AED", bg: "rgba(124, 58, 237, 0.10)" },
  full_exam: { label: "Simul. complète", color: "#059669", bg: "rgba(5, 150, 105, 0.10)" },
  review: { label: "Revue", color: "#B45309", bg: "rgba(180, 83, 9, 0.10)" },
};

function nclcFromNote(n: number): string {
  return note20ToNclc(n);
}

function cefrFromNote(n: number): string {
  const bands: [number, string][] = [
    [16, "C2"],
    [14, "C1"],
    [12, "B2"],
    [8, "B1"],
    [4, "A2"],
    [1, "A1"],
    [0, "A1_non_atteint"],
  ];
  for (const [t, l] of bands) if (n >= t) return l;
  return "A1_non_atteint";
}

function buildMocks(n = 3): SessionRow[] {
  const now = Date.now();
  const out: SessionRow[] = [];
  for (let i = 0; i < n; i++) {
    const daysAgo = (n - i) * 3 + Math.floor(Math.random() * 2);
    const level = 3 + Math.random() * 2;
    const note20 = Math.round(levelToNote20(level));
    const cefrIdx = Math.max(0, Math.min(6, Math.round(level)));
    const modes: ModeId[] = ["drill_voice", "conversation", "full_exam"];
    const mode = modes[i % modes.length];
    const startedAt = new Date(now - daysAgo * 86400000).toISOString();
    const evLevel = level;
    const ev: EoEvaluation = {
      tasks: [
        {
          task: 1,
          taskLevel: level - 0.2,
          criteria: {
            P1: { score: level, level: LEVELS[cefrIdx], evidence: "", comment: "" },
            P2: { score: level, level: LEVELS[cefrIdx], evidence: "", comment: "" },
            P3: { score: level, level: LEVELS[cefrIdx], evidence: "", comment: "" },
            L1: { score: level - 0.3, level: LEVELS[Math.max(0, cefrIdx - 1)], evidence: "", comment: "" },
            L2: { score: level - 0.1, level: LEVELS[cefrIdx], evidence: "", comment: "" },
            L3: { score: level, level: LEVELS[cefrIdx], evidence: "", comment: "" },
            S1: { score: level + 0.2, level: LEVELS[cefrIdx], evidence: "", comment: "" },
          },
          penalties: [],
          errors: [],
          upgrades: [],
        },
      ],
      global: {
        levelScore: evLevel,
        note20,
        cefr: LEVELS[cefrIdx],
        nclc: nclcFromNote(note20),
        targetMet: note20 >= 10,
        gapToTarget: "",
      },
      synthesis: {
        strengths: [],
        topThreeFixes: [],
        nextSession: { recommendedTask: 1, recommendedCategory: "Expression Orale", reason: "" },
      },
    };
    out.push({
      id: "mock-" + i + "-" + Math.random().toString(36).slice(2, 8),
      user_id: "anon",
      mode,
      started_at: startedAt,
      ended_at: startedAt,
      credits_spent: 0,
      incomplete: false,
      target_note_20: 10,
      evaluation: ev,
      tasks: [],
    });
  }
  return out;
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-CA", { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}

function formatFullDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-CA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function PageHistoriqueEO() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modeFilter, setModeFilter] = useState<"all" | ModeId>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [usedMock, setUsedMock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchSessions() {
      try {
        const res = await fetch("/api/eo/sessions");
        if (!res.ok) {
          if (!cancelled) {
            setSessions(buildMocks(3));
            setUsedMock(true);
            setLoading(false);
          }
          return;
        }
        const d = await res.json();
        const list: SessionRow[] = d?.sessions ?? [];
        if (!cancelled) {
          if (Array.isArray(list) && list.length > 0) {
            setSessions(list);
          } else {
            setSessions(buildMocks(3));
            setUsedMock(true);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setSessions(buildMocks(3));
          setUsedMock(true);
          setLoading(false);
        }
      }
    }
    fetchSessions();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (modeFilter !== "all" && s.mode !== modeFilter) return false;
      if (dateFrom) {
        const t = new Date(s.started_at).getTime();
        if (t < new Date(dateFrom).getTime()) return false;
      }
      if (dateTo) {
        const t = new Date(s.started_at).getTime();
        if (t > new Date(dateTo).getTime() + 86400000) return false;
      }
      return true;
    });
  }, [sessions, modeFilter, dateFrom, dateTo]);

  const chartPoints = useMemo(() => {
    return [...filtered]
      .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
      .map((s) => ({
        x: formatShortDate(s.started_at),
        y: (s.evaluation as EoEvaluation | null)?.global.note20 ?? 0,
        mode: s.mode,
      }));
  }, [filtered]);

  return (
    <div className="coquille">
      <NavLaterale routeActive="/expression-orale/historique" />
      <main style={{ flex: "1 1 auto", minWidth: 0, padding: "22px 16px 80px" }}>
        <div className="max-w-7xl mx-auto px-4" style={{ color: "var(--color-papier)" }}>
          <header style={{ marginBottom: 22 }}>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 26,
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              📊 Historique des simulations
            </h1>
            <div
              style={{
                marginTop: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-encre-3)",
              }}
            >
              Expression Orale · {sessions.length} session{sessions.length > 1 ? "s" : ""}
              {usedMock && (
                <span
                  style={{
                    marginLeft: 10,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#FCD34D",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                  }}
                >
                  MOCK
                </span>
              )}
            </div>
          </header>

          <section
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 22,
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-encre-3)",
                }}
              >
                Mode
              </label>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value as "all" | ModeId)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.25)",
                  color: "var(--color-papier)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  minWidth: 170,
                }}
              >
                <option value="all">Tous les modes</option>
                {(Object.keys(MODES_DISPLAY) as ModeId[]).map((m) => (
                  <option key={m} value={m}>{MODES_DISPLAY[m].label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-encre-3)",
                }}
              >
                Du
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.25)",
                  color: "var(--color-papier)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-encre-3)",
                }}
              >
                Au
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.25)",
                  color: "var(--color-papier)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-encre-3)", letterSpacing: ".1em", textTransform: "uppercase" }}>Moyenne</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18 }}>
                  {chartPoints.length
                    ? (chartPoints.reduce((s, p) => s + p.y, 0) / chartPoints.length).toFixed(1)
                    : "—"}
                  <span style={{ fontSize: 12, color: "var(--color-encre-3)" }}>/20</span>
                </div>
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(16, 185, 129, 0.10)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#6FD3A9", letterSpacing: ".1em", textTransform: "uppercase" }}>≥ NCLC 7</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, color: "#6FD3A9" }}>
                  {filtered.filter((s) => ((s.evaluation as EoEvaluation | null)?.global.note20 ?? 0) >= 10).length}
                  <span style={{ fontSize: 12, opacity: 0.7 }}>/{filtered.length}</span>
                </div>
              </div>
            </div>
          </section>

          <section
            style={{
              background: "var(--color-papier)",
              color: "var(--color-encre)",
              borderRadius: 16,
              padding: "18px 20px 22px",
              boxShadow: "0 18px 44px rgba(0,0,0,0.34)",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--color-encre-3)",
                }}
              >
                Progression Note / 20
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--color-encre-2)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i style={{ width: 14, height: 2, background: "#2563EB", display: "inline-block" }} />
                  sessions
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i style={{ width: 14, height: 2, background: "#10B981", display: "inline-block", borderTop: "2px dashed #10B981" }} />
                  cible 10 · NCLC 7
                </span>
              </div>
            </div>
            {chartPoints.length > 0 ? (
              <CanvasLineChart
                points={chartPoints}
                target={10}
                minY={0}
                maxY={20}
                height={260}
                axesYLabel="Note / 20"
                color="#2563EB"
              />
            ) : (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--color-encre-3)", fontSize: 13.5 }}>
                Aucune donnée à afficher avec ces filtres.
              </div>
            )}
          </section>

          <section
            style={{
              background: "var(--color-papier)",
              color: "var(--color-encre)",
              borderRadius: 16,
              padding: "0 0 16px",
              boxShadow: "0 18px 44px rgba(0,0,0,0.34)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-encre-3)",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Sessions · {filtered.length}</span>
              {loading && <span>Chargement…</span>}
            </div>

            {loading ? (
              <div style={{ padding: 30, textAlign: "center", color: "var(--color-encre-3)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                Chargement…
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  margin: 16,
                  padding: "28px 20px",
                  textAlign: "center",
                  borderRadius: 12,
                  border: "1px dashed rgba(0,0,0,0.12)",
                  color: "var(--color-encre-3)",
                  fontSize: 14,
                }}
              >
                <div style={{ marginBottom: 8, fontSize: 15, color: "var(--color-encre-2)" }}>
                  Aucune session enregistrée.
                </div>
                Commencez par un <b>Drill</b> puis une <b>Simulation complète</b>.
                <div style={{ marginTop: 14 }}>
                  <Link
                    href="/expression-orale"
                    style={{
                      display: "inline-block",
                      padding: "10px 18px",
                      borderRadius: 10,
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "#065F46",
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: 13.5,
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    → Accéder aux exercices EO
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                      {["Date", "Mode", "Note /20", "NCLC", "CEFR", "Objectif", ""].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            textAlign: "left",
                            padding: "10px 16px",
                            fontWeight: 600,
                            color: "var(--color-encre-2)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10.5,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            borderBottom: "1px solid rgba(0,0,0,0.08)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => {
                      const ev = (s.evaluation as EoEvaluation | null);
                      const note = ev?.global.note20 ?? 0;
                      const nclc = ev?.global.nclc ?? nclcFromNote(note);
                      const cefr = ev?.global.cefr ?? cefrFromNote(note);
                      const target = s.target_note_20 ?? 10;
                      const atteint = note >= target;
                      const modeDisplay = MODES_DISPLAY[s.mode as ModeId] ?? { label: s.mode, color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
                      return (
                        <tr
                          key={s.id}
                          style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                        >
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
                            {formatFullDate(s.started_at)}
                          </td>
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: 999,
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                fontWeight: 600,
                                background: modeDisplay.bg,
                                color: modeDisplay.color,
                              }}
                            >
                              {modeDisplay.label}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontWeight: 700,
                                fontSize: 15,
                                color: atteint ? "#10B981" : note >= 8 ? "#F59E0B" : "#BE2F46",
                              }}
                            >
                              {note}<small style={{ fontSize: 11, color: "var(--color-encre-3)" }}>/20</small>
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 12,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 6,
                                background: note >= 12 ? "rgba(16,185,129,0.12)" : note >= 10 ? "rgba(245,158,11,0.12)" : "rgba(0,0,0,0.04)",
                                color: note >= 12 ? "#065F46" : note >= 10 ? "#92400E" : "var(--color-encre-2)",
                              }}
                            >
                              {nclc}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--color-encre-2)" }}>
                            {cefr}
                          </td>
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                            {atteint ? (
                              <span style={{ color: "#10B981", fontWeight: 700 }}>✔</span>
                            ) : (
                              <span style={{ color: "#BE2F46", fontWeight: 700 }}>✘ {target}</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", whiteSpace: "nowrap", textAlign: "right" }}>
                            <Link
                              href={`/expression-orale/session/${s.id}`}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                fontSize: 12.5,
                                fontWeight: 700,
                                textDecoration: "none",
                                background: "rgba(40, 86, 158, 0.08)",
                                color: "#28569E",
                                border: "1px solid rgba(40, 86, 158, 0.2)",
                              }}
                            >
                              Détails →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
