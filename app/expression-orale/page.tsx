"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import NavLaterale from "@/components/NavLaterale";
import BaseConnaissanceSidebar from "@/components/expression-ecrite/BaseConnaissanceSidebar";
import type { Archetype, TaskId } from "@/lib/types/eo";

export default function PageExpressionOraleWrapper() {
  return (
    <Suspense fallback={null}>
      <PageExpressionOrale />
    </Suspense>
  );
}

type TaskFilter = "all" | TaskId;

interface Counts {
  total: number;
  t1: number;
  t2: number;
  t3: number;
}

function formatDuration(a: Archetype): string {
  const total = a.duration_sec;
  const m = Math.floor(total / 60);
  const s = total % 60;
  const mm = String(m).padStart(1, "0");
  const ss = String(s).padStart(2, "0");

  let base = "";
  if (a.task === 1) {
    base = `T1 · ${mm}:${ss}`;
  } else if (a.task === 2) {
    const prepM = Math.floor(a.prep_sec / 60);
    const durM = m - prepM;
    base = `T2 · ${prepM}+${durM}:${ss}`;
  } else {
    base = `T3 · ${mm}:${ss}`;
  }

  if (a.prep_sec > 0 && a.task !== 2) {
    const pm = Math.floor(a.prep_sec / 60);
    const ps = a.prep_sec % 60;
    base += ` + prep ${pm}:${String(ps).padStart(2, "0")}`;
  }

  return base;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + "…";
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

function PageExpressionOrale() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [onlyQuick, setOnlyQuick] = useState(false);
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kbOuvert, setKbOuvert] = useState<boolean>(false);
  const [counts, setCounts] = useState<Counts>({ total: 72, t1: 20, t2: 24, t3: 28 });

  useEffect(() => {
    if (tabParam === "connaissance") setKbOuvert(true);
  }, [tabParam]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/eo/archetypes");
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.erreur || `Erreur ${res.status}`);
      }
      const d = await res.json();
      const list: Archetype[] = d.archetypes || [];
      setArchetypes(list);
      setCounts({
        total: list.length,
        t1: list.filter((a) => a.task === 1).length,
        t2: list.filter((a) => a.task === 2).length,
        t3: list.filter((a) => a.task === 3).length,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return archetypes.filter((a) => {
      if (taskFilter !== "all" && a.task !== taskFilter) return false;
      if (onlyQuick && a.set !== "quick") return false;
      return true;
    });
  }, [archetypes, taskFilter, onlyQuick]);

  const tabs: { key: TaskFilter; label: string }[] = [
    { key: "all", label: "Tout" },
    { key: 1, label: "Task 1" },
    { key: 2, label: "Task 2" },
    { key: 3, label: "Task 3" },
  ];

  return (
    <div className="coquille">
      <NavLaterale routeActive="/expression-orale" />
      <main
        className="contenu-principal"
        style={{
          background: "var(--color-papier)",
          borderRadius: 16,
          margin: "12px 12px 12px 0",
          padding: "28px 32px 60px",
          color: "var(--color-encre)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 26,
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              🎙 Expression Orale · Catalogue 72 exercices
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11.5,
                  padding: "5px 11px",
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  fontWeight: 600,
                }}
              >
                {counts.total} archétypes
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11.5,
                  padding: "5px 11px",
                  borderRadius: 999,
                  background: "rgba(40, 86, 158, 0.10)",
                  color: "#28569E",
                  border: "1px solid rgba(40, 86, 158, 0.20)",
                  fontWeight: 600,
                }}
              >
                {counts.t1} T1
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11.5,
                  padding: "5px 11px",
                  borderRadius: 999,
                  background: "rgba(37, 111, 81, 0.10)",
                  color: "#256F51",
                  border: "1px solid rgba(37, 111, 81, 0.20)",
                  fontWeight: 600,
                }}
              >
                {counts.t2} T2
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11.5,
                  padding: "5px 11px",
                  borderRadius: 999,
                  background: "rgba(181, 94, 40, 0.10)",
                  color: "#B55E28",
                  border: "1px solid rgba(181, 94, 40, 0.20)",
                  fontWeight: 600,
                }}
              >
                {counts.t3} T3
              </span>
            </div>
          </div>

          <Link
            href="/expression-orale/exam"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 22px",
              borderRadius: 12,
              background: "var(--color-encre)",
              color: "var(--color-papier)",
              fontFamily: "var(--font-sans)",
              fontSize: 14.5,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              border: "1px solid rgba(0,0,0,0.2)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.20)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.15)";
            }}
          >
            ⚙ Simulation complète 12 minutes
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 22,
            paddingBottom: 14,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {tabs.map((t) => {
              const active = taskFilter === t.key;
              return (
                <button
                  key={String(t.key)}
                  onClick={() => setTaskFilter(t.key)}
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    background: "transparent",
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#064E3B" : "var(--color-encre-2)",
                    borderBottom: active
                      ? "2px solid #10B981"
                      : "2px solid transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    transition: "color 0.15s",
                    letterSpacing: "0.01em",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(0,0,0,0.02)",
              cursor: "pointer",
              fontSize: 13.5,
              color: "var(--color-encre)",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={onlyQuick}
              onChange={(e) => setOnlyQuick(e.target.checked)}
              style={{
                width: 16,
                height: 16,
                accentColor: "#10B981",
                margin: 0,
              }}
            />
            Quick Set uniquement (52 exercices cœur)
          </label>
        </div>

        {error && (
          <div
            style={{
              padding: "16px 18px",
              borderRadius: 12,
              background: "rgba(190, 47, 70, 0.08)",
              border: "1px solid rgba(190, 47, 70, 0.25)",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#BE2F46",
                  fontSize: 14,
                  marginBottom: 2,
                }}
              >
                ⚠ Erreur de chargement
              </div>
              <div style={{ fontSize: 13.5, color: "var(--color-encre-2)" }}>
                {error}
              </div>
            </div>
            <button
              onClick={fetchData}
              style={{
                padding: "9px 16px",
                borderRadius: 9,
                border: "1px solid rgba(190, 47, 70, 0.3)",
                background: "var(--color-papier)",
                color: "#BE2F46",
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 14,
                  padding: 16,
                  minHeight: 200,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0) 100%)",
                    animation: "shimmer 1.4s infinite",
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((a) => {
              const bodyText =
                a.task === 1 && a.question_ouverture
                  ? a.question_ouverture
                  : a.consigne;
              return (
                <article
                  key={a.id}
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 14,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    transition: "box-shadow 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.transform = "";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 999,
                        letterSpacing: "0.02em",
                        ...taskChipStyle(a.task),
                      }}
                    >
                      {formatDuration(a)}
                    </span>
                    {a.set === "quick" && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: 999,
                          background: "rgba(134, 239, 172, 0.45)",
                          color: "#065F46",
                          border: "1px solid rgba(16, 185, 129, 0.35)",
                          letterSpacing: "0.03em",
                        }}
                      >
                        QS · 52
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--color-encre-3)",
                        fontWeight: 600,
                      }}
                    >
                      {a.categorie}
                    </div>
                    <div
                      style={{
                        fontSize: 13.5,
                        lineHeight: 1.55,
                        color: "var(--color-encre)",
                        fontWeight: 500,
                      }}
                    >
                      {truncate(bodyText, 120)}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: 6,
                      borderTop: "1px dashed rgba(0,0,0,0.08)",
                    }}
                  >
                    <Link
                      href={`/expression-orale/${a.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#256F51",
                        textDecoration: "none",
                      }}
                    >
                      Commencer →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--color-encre-3)",
              fontSize: 14,
            }}
          >
            Aucun exercice ne correspond aux filtres sélectionnés.
          </div>
        )}
      </main>

      {tabParam === "connaissance" && (
        <BaseConnaissanceSidebar
          competence="EO"
          tache={taskFilter === "all" ? 0 : taskFilter}
          ouvert={kbOuvert}
          onToggle={() => setKbOuvert(!kbOuvert)}
          className="lg:!fixed lg:right-6 lg:top-24 lg:!bottom-6 lg:!w-[480px] z-40 shadow-2xl"
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
