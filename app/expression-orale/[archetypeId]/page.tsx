"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import NavLaterale from "@/components/NavLaterale";
import type { Archetype, TaskId } from "@/lib/types/eo";
import { CREDENTIAL_COSTS } from "@/lib/types/eo";

function formatDuration(sec: number): string {
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

function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {
      alert(`Copié: ${text}`);
    });
  } else {
    alert(`Copié: ${text}`);
  }
}

export default function PageDetailArchetype() {
  const params = useParams();
  const router = useRouter();
  const archetypeId = params.archetypeId as string;

  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEs, setShowEs] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
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
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [archetypeId, router]);

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
          paddingTop: 20,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: 20,
          }}
          className="md:grid-cols-[1fr_420px]"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 28,
                  fontWeight: 700,
                  margin: 0,
                  color: "var(--color-papier)",
                  letterSpacing: "-0.01em",
                }}
              >
                Tâche {archetype.task} · {archetype.categorie}
              </h1>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                  ⏱ {formatDuration(archetype.duration_sec)}
                </span>
                {archetype.prep_sec > 0 && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "5px 12px",
                      borderRadius: 999,
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "#059669",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    📝 Préparation {formatDuration(archetype.prep_sec)}
                  </span>
                )}
              </div>
            </div>

            {error && (
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
                ⚠ {error}
              </div>
            )}

            <div
              style={{
                background: "#FBF7ED",
                borderRadius: 16,
                padding: 32,
                boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
                border: "1px solid rgba(181, 124, 16, 0.10)",
                color: "var(--color-encre)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 18,
                  paddingBottom: 14,
                  borderBottom: "1px dashed rgba(0,0,0,0.10)",
                  flexWrap: "wrap",
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
                  Consigne officielle
                </div>
                {archetype.translation_es && (
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      userSelect: "none",
                      fontSize: 13,
                      color: showEs ? "#059669" : "var(--color-encre-2)",
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showEs}
                      onChange={(e) => setShowEs(e.target.checked)}
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: "#059669",
                        margin: 0,
                      }}
                    />
                    🔤 Traducción ES
                  </label>
                )}
              </div>

              {archetype.task === 1 && archetype.question_ouverture && (
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#28569E",
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    Question d&apos;ouverture
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 17,
                      lineHeight: 1.6,
                      fontWeight: 500,
                      background: "rgba(40, 86, 158, 0.06)",
                      padding: "14px 18px",
                      borderRadius: 10,
                      borderLeft: "3px solid #28569E",
                    }}
                  >
                    « {archetype.question_ouverture} »
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#B55E28",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Consigne
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 16,
                    lineHeight: 1.65,
                  }}
                >
                  {showEs && archetype.translation_es ? (
                    <div
                      style={{
                        background: "rgba(5, 150, 105, 0.06)",
                        padding: "14px 18px",
                        borderRadius: 10,
                        borderLeft: "3px solid #059669",
                        color: "#064E3B",
                      }}
                    >
                      {archetype.translation_es}
                    </div>
                  ) : (
                    archetype.consigne
                  )}
                </div>
              </div>

              {archetype.task === 2 && archetype.required_moves && archetype.required_moves.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#256F51",
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    Étapes requises (moves)
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 22,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {archetype.required_moves.map((m, i) => (
                      <li
                        key={i}
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: 15,
                          lineHeight: 1.55,
                        }}
                      >
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {archetype.task === 3 && (
                <>
                  {archetype.arguments_pour && archetype.arguments_pour.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10.5,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#256F51",
                          fontWeight: 700,
                          marginBottom: 10,
                        }}
                      >
                        Arguments POUR
                      </div>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: 22,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {archetype.arguments_pour.map((a, i) => (
                          <li
                            key={i}
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: 15,
                              lineHeight: 1.55,
                            }}
                          >
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {archetype.arguments_contre && archetype.arguments_contre.length > 0 && (
                    <div style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10.5,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#BE2F46",
                          fontWeight: 700,
                          marginBottom: 10,
                        }}
                      >
                        Arguments CONTRE
                      </div>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: 22,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {archetype.arguments_contre.map((a, i) => (
                          <li
                            key={i}
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontSize: 15,
                              lineHeight: 1.55,
                            }}
                          >
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {archetype.plan_4t && archetype.plan_4t.length >= 4 && (
                    <div style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10.5,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#B55E28",
                          fontWeight: 700,
                          marginBottom: 14,
                        }}
                      >
                        Plan 4 temps suggéré
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          gap: 12,
                        }}
                      >
                        {archetype.plan_4t.slice(0, 4).map((step, i) => (
                          <div
                            key={i}
                            style={{
                              padding: "14px 16px",
                              borderRadius: 12,
                              background: "rgba(181, 94, 40, 0.06)",
                              border: "1px solid rgba(181, 94, 40, 0.15)",
                              display: "flex",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                background: "#B55E28",
                                color: "var(--color-papier)",
                                fontFamily: "var(--font-mono)",
                                fontSize: 12,
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {i + 1}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-serif)",
                                fontSize: 14,
                                lineHeight: 1.5,
                                color: "var(--color-encre)",
                              }}
                            >
                              {step}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {archetype.task === 2 &&
                (archetype.scene_facts || archetype.complication) && (
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10.5,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#7C3AED",
                        fontWeight: 700,
                        marginBottom: 10,
                      }}
                    >
                      🎭 Scène · Jeu de rôle
                    </div>
                    {archetype.scene_facts && archetype.scene_facts.length > 0 && (
                      <div
                        style={{
                          marginBottom: 12,
                          padding: "14px 18px",
                          borderRadius: 10,
                          background: "rgba(124, 58, 237, 0.06)",
                          borderLeft: "3px solid #7C3AED",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: "#6D28D9",
                            marginBottom: 8,
                            letterSpacing: "0.06em",
                          }}
                        >
                          FAITS
                        </div>
                        <ul
                          style={{
                            margin: 0,
                            paddingLeft: 20,
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          }}
                        >
                          {archetype.scene_facts.map((f, i) => (
                            <li
                              key={i}
                              style={{
                                fontFamily: "var(--font-serif)",
                                fontSize: 14.5,
                                lineHeight: 1.55,
                              }}
                            >
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {archetype.complication && (
                      <div
                        style={{
                          padding: "14px 18px",
                          borderRadius: 10,
                          background: "rgba(190, 47, 70, 0.06)",
                          borderLeft: "3px solid #BE2F46",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: "#BE2F46",
                            marginBottom: 8,
                            letterSpacing: "0.06em",
                          }}
                        >
                          COMPLICATION / CONFLIT
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: 14.5,
                            lineHeight: 1.55,
                            fontStyle: "italic",
                          }}
                        >
                          {archetype.complication}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {archetype.lexical_field && archetype.lexical_field.length > 0 && (
              <div
                style={{
                  background: "var(--color-papier)",
                  borderRadius: 16,
                  padding: 22,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
                  color: "var(--color-encre)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#28569E",
                    fontWeight: 700,
                    marginBottom: 14,
                  }}
                >
                  📚 Lexique · Champ lexical (cliquer pour copier)
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {archetype.lexical_field.map((word, i) => (
                    <button
                      key={i}
                      onClick={() => copyToClipboard(word)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 999,
                        background: "rgba(40, 86, 158, 0.08)",
                        border: "1px solid rgba(40, 86, 158, 0.18)",
                        color: "#1E40AF",
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: "var(--font-serif)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(40, 86, 158, 0.16)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(40, 86, 158, 0.08)";
                      }}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {archetype.connecteurs && archetype.connecteurs.length > 0 && (
              <div
                style={{
                  background: "var(--color-papier)",
                  borderRadius: 16,
                  padding: 22,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
                  color: "var(--color-encre)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#B55E28",
                    fontWeight: 700,
                    marginBottom: 14,
                  }}
                >
                  🔗 Connecteurs suggérés (cliquer pour copier)
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {archetype.connecteurs.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => copyToClipboard(c)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 999,
                        background: "rgba(181, 94, 40, 0.08)",
                        border: "1px solid rgba(181, 94, 40, 0.18)",
                        color: "#9A3412",
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: "var(--font-serif)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(181, 94, 40, 0.16)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(181, 94, 40, 0.08)";
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              position: "sticky",
              top: 24,
              alignSelf: "start",
            }}
          >
            <div
              style={{
                background: "var(--color-papier)",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                color: "var(--color-encre)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--color-encre-2)",
                  fontWeight: 700,
                }}
              >
                Choisir un mode
              </div>

              <Link
                href={`/expression-orale/${archetype.id}/session?mode=drill_text`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "var(--color-papier-2)",
                  textDecoration: "none",
                  color: "var(--color-encre)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.25)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)";
                  e.currentTarget.style.transform = "";
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    📝 Drill Texte
                  </span>
                  <span
                    style={{
                      fontSize: 12.5,
                      color: "var(--color-encre-2)",
                      fontWeight: 500,
                    }}
                  >
                    Réponse écrite · sans chrono pression
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "5px 11px",
                    borderRadius: 999,
                    background: "rgba(0,0,0,0.05)",
                    color: "var(--color-encre-2)",
                  }}
                >
                  {CREDENTIAL_COSTS.drill_text} crédit
                </div>
              </Link>

              <Link
                href={`/expression-orale/${archetype.id}/session?mode=drill_voice`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(168, 60, 20, 0.35)",
                  background: "rgba(168, 60, 20, 0.10)",
                  textDecoration: "none",
                  color: "#7C2D12",
                  transition: "all 0.15s",
                  boxShadow: "0 2px 8px rgba(168, 60, 20, 0.10)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(168, 60, 20, 0.18)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(168, 60, 20, 0.10)";
                  e.currentTarget.style.transform = "";
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    🎙 Drill Voix
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: "#9A3412" }}>
                    Mode oral · chrono actif
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "5px 11px",
                    borderRadius: 999,
                    background: "rgba(168, 60, 20, 0.22)",
                    color: "#7C2D12",
                  }}
                >
                  {CREDENTIAL_COSTS.drill_voice} crédit
                </div>
              </Link>

              <Link
                href={`/expression-orale/${archetype.id}/session?mode=conversation`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(6, 95, 70, 0.4)",
                  background: "#047857",
                  textDecoration: "none",
                  color: "var(--color-papier)",
                  transition: "all 0.15s",
                  boxShadow: "0 4px 14px rgba(5, 150, 105, 0.30)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#065F46";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#047857";
                  e.currentTarget.style.transform = "";
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    💬 Conversation
                  </span>
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.82)",
                    }}
                  >
                    Dialogue interactif · conditions réelles
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "5px 11px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.20)",
                    color: "var(--color-papier)",
                  }}
                >
                  {CREDENTIAL_COSTS.conversation} crédits
                </div>
              </Link>

              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(181, 124, 16, 0.10)",
                  border: "1px solid rgba(181, 124, 16, 0.20)",
                  fontSize: 12.5,
                  lineHeight: 1.55,
                  color: "#92400E",
                }}
              >
                💡 <b>Astuce pédagogique :</b> Passez successivement drill_texte →
                drill_voix → conversation pour monter en compétence progressivement.
              </div>

              <div
                style={{
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  paddingTop: 14,
                  marginTop: 4,
                }}
              >
                <Link
                  href="/expression-orale"
                  style={{
                    fontSize: 13,
                    color: "var(--color-encre-2)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  ← Retour catalogue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
