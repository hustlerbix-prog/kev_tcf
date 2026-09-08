"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import NavLaterale from "@/components/NavLaterale";
import type { ProgressionDashboard, EssaiExpressionEcrite } from "@/lib/types/tcf";
import { NCLC } from "@/lib/llm/prompts";

const SEUIL_NCLC8 = 12;
const SEUIL_NCLC7 = 10;
const W = 780;
const H = 240;
const padL = 44;
const padR = 20;
const padT = 22;
const padB = 32;
const plotW = W - padL - padR;
const plotH = H - padT - padB;
const yAt = (n: number) => padT + plotH - (Math.max(0, Math.min(20, n)) / 20) * plotH;

const fmtDate = (s?: string) =>
  s
    ? new Date(s).toLocaleString("fr-CA", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const badgeNote = (n?: number) => {
  const v = n ?? 0;
  const color =
    v >= SEUIL_NCLC8
      ? "#14261F"
      : v >= SEUIL_NCLC7
      ? "#2A2115"
      : "#341A21";
  const border =
    v >= SEUIL_NCLC8
      ? "#3CCF91"
      : v >= SEUIL_NCLC7
      ? "#E8A83C"
      : "#F2A0AF";
  const text = v >= SEUIL_NCLC8 ? "#3CCF91" : v >= SEUIL_NCLC7 ? "#E8A83C" : "#F2A0AF";
  return { color, border, text };
};

export default function PageProgression() {
  const router = useRouter();
  const [dash, setDash] = useState<ProgressionDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [suppressionId, setSuppressionId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    setLoading(true);
    setErr(null);
    fetch("/api/progression", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json() as Promise<ProgressionDashboard>;
      })
      .then((d) => {
        setDash(d);
        const init: Record<string, string> = {};
        d.derniers_essais.forEach((e) => {
          if (e.id) init[e.id] = e.notes_user ?? "";
        });
        setNotesDraft((prev) => ({ ...init, ...prev }));
        setLoading(false);
      })
      .catch((e) => {
        setErr(String(e?.message || e));
        setLoading(false);
      });
  }, [reloadToken]);

  const pts = useMemo(
    () =>
      (dash?.tendance_points || []).map((p, i, arr) => {
        const x =
          arr.length <= 1
            ? padL + plotW / 2
            : padL + (i / (arr.length - 1)) * plotW;
        return { x, y: yAt(p.note_20), n: p.note_20, i, created_at: p.created_at };
      }),
    [dash]
  );
  const polyline = pts.length
    ? pts.map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ")
    : "";
  const yTicks = [0, 5, 10, 12, 15, 20];

  async function sauvegarderNote(id: string) {
    const texte = notesDraft[id] || "";
    setSavingId(id);
    try {
      const r = await fetch(`/api/essais/${id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes_user: texte }),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
    } catch (e) {
      alert("Erreur sauvegarde : " + String(e));
    } finally {
      setSavingId(null);
      setReloadToken((t) => t + 1);
    }
  }

  async function supprimerEssai(id: string, resume: string) {
    const ok = window.confirm(
      `Supprimer cette copie (${resume}) ?\n\nCette action est irréversible et supprimera aussi ses notes et métadonnées.`
    );
    if (!ok) return;
    setSuppressionId(id);
    try {
      const r = await fetch(`/api/essais/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("HTTP " + r.status);
    } catch (e) {
      alert("Erreur suppression : " + String(e));
      setSuppressionId(null);
      return;
    }
    setSuppressionId(null);
    setReloadToken((t) => t + 1);
  }

  function ouvrirAnalyse(id: string) {
    router.push(`/progression/essai/${id}`);
  }

  const ecart = dash?.ecart_nclc8_sur_note_globale ?? 0;
  const atteint = ecart <= 0;

  return (
    <div className="coquille">
      <NavLaterale actif="progression" />
      <main className="contenu-principal">
        <div className="grille">
          <div className="col-gauche">
            {/* HEADER — cible NCLC 8 */}
            <section className="carte" style={{ marginBottom: 16 }}>
              <div className="entete-carte">
                <h2>Objectif — NCLC 8 · 12–13 / 20 (B2)</h2>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--color-encre-3)",
                  }}
                >
                  TCF Canada · Expression écrite
                </span>
              </div>
              <div className="bloc">
                {loading && <div className="charge"><span className="spin" />Chargement…</div>}
                {!loading && err && (
                  <div
                    style={{
                      padding: 14,
                      border: "1px solid #F2A0AF",
                      borderRadius: 10,
                      color: "#F2A0AF",
                    }}
                  >
                    {err}
                  </div>
                )}
                {!loading && !err && dash && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1fr",
                      gap: 14,
                      alignItems: "stretch",
                    }}
                  >
                    {/* Grosse jauge : écart vs NCLC 8 */}
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        background: atteint
                          ? "linear-gradient(135deg,#14261F 0%,#10291F 100%)"
                          : "linear-gradient(135deg,#1A2536 0%,#19202C 100%)",
                        border: "1px solid " + (atteint ? "#3CCF91" : "#27374F"),
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 10,
                              letterSpacing: ".12em",
                              color: atteint ? "#3CCF91" : "#7A889C",
                            }}
                          >
                            MOYENNE ACTUELLE
                          </div>
                          <div
                            style={{
                              fontSize: 44,
                              fontWeight: 800,
                              color: atteint ? "#3CCF91" : "#D7E3F5",
                              fontFamily: "var(--font-serif)",
                              lineHeight: 1.1,
                              marginTop: 4,
                            }}
                          >
                            {dash.kpis.moyenne_note_20 || "—"}
                            <small
                              style={{
                                fontSize: 18,
                                color: "#7A889C",
                                marginLeft: 4,
                              }}
                            >
                              / 20
                            </small>
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                              color: "var(--color-encre-2)",
                              marginTop: 2,
                            }}
                          >
                            NCLC {dash.kpis.moyenne_note_20 > 0
                              ? NCLC(Math.round(dash.kpis.moyenne_note_20))
                              : "—"}
                            {" · "}
                            {dash.kpis.score_100_moyen} / 100
                          </div>
                        </div>
                        <div
                          style={{
                            textAlign: "right",
                            padding: 12,
                            borderRadius: 10,
                            background: atteint
                              ? "rgba(60,207,145,.08)"
                              : "rgba(232,168,60,.07)",
                            border: "1px solid " +
                              (atteint ? "rgba(60,207,145,.25)" : "rgba(232,168,60,.22)"),
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 10,
                              letterSpacing: ".12em",
                              color: atteint ? "#3CCF91" : "#E8A83C",
                            }}
                          >
                            {atteint ? "OBJECTIF TENU" : "ÉCART / NCLC 8"}
                          </div>
                          <div
                            style={{
                              fontSize: 28,
                              fontWeight: 800,
                              marginTop: 2,
                              color: atteint ? "#3CCF91" : "#E8A83C",
                              fontFamily: "var(--font-serif)",
                            }}
                          >
                            {atteint ? "✓" : ecart.toFixed(1)}
                            <small style={{ fontSize: 14, marginLeft: 3 }}>
                              {atteint ? "" : "pts"}
                            </small>
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--color-encre-2)",
                              fontFamily: "var(--font-sans)",
                              marginTop: 4,
                            }}
                          >
                            {atteint
                              ? `Maintiens le rythme. Tu peux viser NCLC 9 (14/20).`
                              : `Prochaine cible : ${dash.prochaine_cible_note_20} / 20.`}
                          </div>
                        </div>
                      </div>
                      {/* Rails 5 critères — écart */}
                      <div style={{ marginTop: 18 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            letterSpacing: ".12em",
                            color: "#7A889C",
                            marginBottom: 10,
                          }}
                        >
                          ÉCART PAR CRITÈRE (barème /20 · seuil NCLC 8 = 12)
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {dash.ecart_par_critere.map((c) => {
                            const ok = c.delta_20 >= 0;
                            const w = Math.min(100, (c.moyenne_20 / 20) * 100);
                            const wSeuil = (SEUIL_NCLC8 / 20) * 100;
                            return (
                              <div key={c.cle}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontFamily: "var(--font-sans)",
                                    fontSize: 13,
                                    marginBottom: 4,
                                  }}
                                >
                                  <span style={{ color: "#E7E3D6" }}>{c.label}</span>
                                  <span
                                    style={{
                                      fontFamily: "var(--font-mono)",
                                      color: ok ? "#3CCF91" : "#E8A83C",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {c.moyenne_20.toFixed(1)} / 20{" "}
                                    <span style={{ color: "#7A889C", fontWeight: 400 }}>
                                      {ok
                                        ? `+${c.delta_20.toFixed(1)}`
                                        : `-${c.points_manquants_sur_20.toFixed(1)}`}
                                    </span>
                                  </span>
                                </div>
                                <div
                                  style={{
                                    position: "relative",
                                    height: 9,
                                    background: "#2A3544",
                                    borderRadius: 999,
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      position: "absolute",
                                      left: 0,
                                      top: 0,
                                      bottom: 0,
                                      width: w + "%",
                                      background: ok
                                        ? "linear-gradient(90deg,#2FA671,#3CCF91)"
                                        : "linear-gradient(90deg,#E8A83C,#D98B00)",
                                      borderRadius: 999,
                                    }}
                                  />
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: -2,
                                      bottom: -2,
                                      left: wSeuil + "%",
                                      width: 2,
                                      background: "#6FD3A9",
                                      boxShadow: "0 0 0 1px #18222E",
                                    }}
                                    title="Seuil NCLC 8 · 12/20"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* KPI cards 2x3 */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      {[
                        {
                          label: "Copies corrigées",
                          val: String(dash.kpis.total_essais),
                          sub: "total",
                        },
                        {
                          label: "Meilleure note",
                          val: (dash.kpis.note_max_20 || "—") + "/20",
                          sub:
                            dash.kpis.note_max_20
                              ? "NCLC " + NCLC(dash.kpis.note_max_20)
                              : "—",
                        },
                        {
                          label: "NCLC 7 tenus",
                          val: String(dash.kpis.seuil_nclc7_atteint),
                          sub: "≥ 10 / 20",
                          accent: dash.kpis.seuil_nclc7_atteint ? "#E8A83C" : undefined,
                        },
                        {
                          label: "NCLC 8 tenus",
                          val: String(dash.kpis.seuil_nclc8_atteint),
                          sub:
                            dash.kpis.total_essais
                              ? dash.kpis.pourcentage_nclc8 + " %"
                              : "—",
                          accent: dash.kpis.pourcentage_nclc8 >= 50 ? "#3CCF91" : undefined,
                        },
                        {
                          label: "Tendance",
                          val:
                            dash.kpis.tendance === "hausse"
                              ? "↗ Progression"
                              : dash.kpis.tendance === "baisse"
                              ? "↘ Baisse"
                              : dash.kpis.tendance === "stable"
                              ? "→ Stable"
                              : "—",
                          sub: "< 4 essais : trop tôt",
                          accent:
                            dash.kpis.tendance === "hausse"
                              ? "#3CCF91"
                              : dash.kpis.tendance === "baisse"
                              ? "#F2A0AF"
                              : undefined,
                        },
                        {
                          label: "Erreur la plus fréquente",
                          val: dash.codes_erreurs_les_plus_frequents[0]?.code || "—",
                          sub:
                            dash.codes_erreurs_les_plus_frequents[0]?.label ||
                            "Aucune pour l'instant",
                        },
                      ].map((k, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            background: k.accent
                              ? "rgba(255,255,255,.04)"
                              : "rgba(255,255,255,.02)",
                            border: "1px solid " +
                              (k.accent ? k.accent + "44" : "var(--color-grille)"),
                          }}
                        >
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: k.accent || "inherit",
                              fontFamily: "var(--font-serif)",
                              lineHeight: 1.1,
                            }}
                          >
                            {k.val}
                          </div>
                          <div
                            style={{
                              fontSize: 12.5,
                              color: "var(--color-encre-2)",
                              marginTop: 2,
                            }}
                          >
                            {k.label}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--color-encre-3)",
                              fontFamily: "var(--font-mono)",
                              marginTop: 2,
                            }}
                          >
                            {k.sub}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* TENDANCE SVG + per-tâche */}
            <section className="carte" style={{ marginBottom: 16 }}>
              <div className="entete-carte">
                <h2>Courbe de progression</h2>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--color-encre-3)",
                  }}
                >
                  {pts.length} point{pts.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="bloc" style={{ padding: 12 }}>
                {pts.length === 0 ? (
                  <div
                    style={{
                      padding: 28,
                      textAlign: "center",
                      color: "var(--color-encre-3)",
                      border: "1px dashed var(--color-grille)",
                      borderRadius: 10,
                      fontSize: 13.5,
                    }}
                  >
                    Aucune note encore. Rends-toi dans{" "}
                    <Link
                      href="/expression-ecrite"
                      style={{ color: "var(--color-bleu)" }}
                    >
                      Éditeur &amp; correction
                    </Link>
                    , fais une copie et clique sur <i>Corriger ma copie</i> — elle
                    s'ajoute ici automatiquement.
                  </div>
                ) : (
                  <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Courbe de progression">
                    <line
                      x1={padL}
                      y1={yAt(SEUIL_NCLC8)}
                      x2={W - padR}
                      y2={yAt(SEUIL_NCLC8)}
                      stroke="#6FD3A9"
                      strokeDasharray="4 4"
                      strokeWidth={1.2}
                    />
                    <text
                      x={W - padR - 4}
                      y={yAt(SEUIL_NCLC8) - 5}
                      fontSize="10"
                      fill="#6FD3A9"
                      textAnchor="end"
                      fontFamily="var(--font-mono)"
                    >
                      NCLC 8 · 12/20
                    </text>
                    <line
                      x1={padL}
                      y1={yAt(SEUIL_NCLC7)}
                      x2={W - padR}
                      y2={yAt(SEUIL_NCLC7)}
                      stroke="#EFC97E"
                      strokeDasharray="4 4"
                      strokeWidth={1.2}
                    />
                    <text
                      x={W - padR - 4}
                      y={yAt(SEUIL_NCLC7) - 5}
                      fontSize="10"
                      fill="#EFC97E"
                      textAnchor="end"
                      fontFamily="var(--font-mono)"
                    >
                      NCLC 7 · 10/20
                    </text>
                    {yTicks.map((y) => (
                      <g key={y}>
                        <line
                          x1={padL}
                          y1={yAt(y)}
                          x2={W - padR}
                          y2={yAt(y)}
                          stroke="rgba(255,255,255,.06)"
                        />
                        <text
                          x={padL - 8}
                          y={yAt(y) + 3.5}
                          fontSize="10"
                          fill="var(--color-encre-3)"
                          textAnchor="end"
                          fontFamily="var(--font-mono)"
                        >
                          {y}
                        </text>
                      </g>
                    ))}
                    <line
                      x1={padL}
                      y1={padT + plotH}
                      x2={W - padR}
                      y2={padT + plotH}
                      stroke="var(--color-grille)"
                    />
                    {pts.length > 1 && (
                      <polyline
                        points={polyline}
                        fill="none"
                        stroke="var(--color-bleu)"
                        strokeWidth={2.2}
                      />
                    )}
                    {pts.map((p) => {
                      const col =
                        p.n >= SEUIL_NCLC8
                          ? "#6FD3A9"
                          : p.n >= SEUIL_NCLC7
                          ? "#EFC97E"
                          : "#F2A0AF";
                      return (
                        <g key={p.i}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={4.5}
                            fill={col}
                            stroke="var(--color-fond)"
                            strokeWidth={2}
                          />
                          <title>
                            Essai {p.i} — {p.n || 0}/20 · {fmtDate(p.created_at)}
                          </title>
                        </g>
                      );
                    })}
                    {pts.length > 0 && (
                      <>
                        <text
                          x={pts[0].x}
                          y={H - 10}
                          fontSize="9"
                          fill="var(--color-encre-3)"
                          textAnchor="middle"
                          fontFamily="var(--font-mono)"
                        >
                          1
                        </text>
                        <text
                          x={pts[pts.length - 1].x}
                          y={H - 10}
                          fontSize="9"
                          fill="var(--color-encre-3)"
                          textAnchor="middle"
                          fontFamily="var(--font-mono)"
                        >
                          {pts.length}
                        </text>
                        <text
                          x={padL + plotW / 2}
                          y={H - 1}
                          fontSize="10"
                          fill="var(--color-encre-2)"
                          textAnchor="middle"
                          fontFamily="var(--font-mono)"
                        >
                          essais (ordre chronologique)
                        </text>
                      </>
                    )}
                  </svg>
                )}

                {/* Per-tâche */}
                {dash && (
                  <div
                    style={{
                      marginTop: 18,
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 10,
                    }}
                  >
                    {([1, 2, 3] as const).map((t) => {
                      const total = dash.kpis.total_par_tache[t];
                      const moy = dash.kpis.moyenne_par_tache[t];
                      const best = dash.kpis.meilleure_par_tache[t];
                      return (
                        <div
                          key={t}
                          style={{
                            padding: 12,
                            borderRadius: 10,
                            border: "1px solid var(--color-grille)",
                            background: "rgba(255,255,255,.02)",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 10,
                              letterSpacing: ".12em",
                              color: "#7A889C",
                            }}
                          >
                            TÂCHE {t}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "baseline",
                              marginTop: 4,
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "var(--font-serif)",
                                fontSize: 22,
                                fontWeight: 800,
                                color: moy >= SEUIL_NCLC8 ? "#3CCF91" : "inherit",
                              }}
                            >
                              {total ? moy : "—"}
                              {total ? (
                                <small style={{ fontSize: 12, color: "#7A889C", marginLeft: 3 }}>
                                  / 20 moy.
                                </small>
                              ) : null}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                color: "var(--color-encre-3)",
                              }}
                            >
                              {total} essai{total > 1 ? "s" : ""}
                            </div>
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 12,
                              color: "var(--color-encre-2)",
                            }}
                          >
                            Meilleure :{" "}
                            <b style={{ color: best && best >= SEUIL_NCLC8 ? "#3CCF91" : "inherit" }}>
                              {best ?? "—"} / 20
                            </b>{" "}
                            {best ? "· NCLC " + NCLC(best) : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Derniers essais avec notes inline save */}
            <section className="carte">
              <div className="entete-carte">
                <h2>Dernières copies · notes &amp; écarts</h2>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--color-encre-3)",
                  }}
                >
                  notes sauvegardées en ligne
                </span>
              </div>
              <div className="bloc" style={{ padding: 12 }}>
                {!dash?.derniers_essais.length ? (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "var(--color-encre-3)",
                      padding: 18,
                      textAlign: "center",
                      border: "1px dashed var(--color-grille)",
                      borderRadius: 10,
                    }}
                  >
                    Aucune copie pour l'instant.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {dash.derniers_essais.map((e, idx) => {
                      const resume = `Tâche ${e.tache_num} · ${e.note_20 ?? "—"}/20 · ${fmtDate(e.created_at)}`;
                      return (
                        <LigneEssai
                          key={e.id || String(idx)}
                          essai={e}
                          draft={notesDraft[e.id || ""] || ""}
                          onChange={(v) =>
                            setNotesDraft((p) =>
                              e.id ? { ...p, [e.id]: v } : p
                            )
                          }
                          saving={savingId === e.id}
                          onSave={() => e.id && sauvegarderNote(e.id)}
                          deleting={suppressionId === e.id}
                          onDelete={() =>
                            e.id && supprimerEssai(e.id, resume)
                          }
                          onOpenAnalyse={() => e.id && ouvrirAnalyse(e.id)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* COL DROITE — gap 8 focus + erreurs fréquentes */}
          <div className="col-droite">
            <section className="carte sombre" style={{ marginBottom: 16 }}>
              <div className="entete-carte">
                <h2>🎯 Focus NCLC 8</h2>
              </div>
              <div className="bloc">
                <h3 style={{ marginTop: 0 }}>Ce qui manque le plus souvent</h3>
                {!dash?.top_manques_gap8.length ? (
                  <p style={{ color: "var(--color-encre-3)", margin: 0, fontSize: 13 }}>
                    Tu n'as pas encore assez de copies catégorisées. Fais 2-3 essais
                    sur des sujets variés et le moteur identifiera les points à
                    travailler en priorité.
                  </p>
                ) : (
                  <ul className="puces">
                    {dash.top_manques_gap8.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                )}
                <h3 style={{ marginTop: 16 }}>Actions à mettre en place</h3>
                {!dash?.top_actions_gap8.length ? (
                  <p style={{ color: "var(--color-encre-3)", margin: 0, fontSize: 13 }}>
                    —
                  </p>
                ) : (
                  <ul className="puces">
                    {dash.top_actions_gap8.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="carte sombre" style={{ marginBottom: 16 }}>
              <div className="entete-carte">
                <h2>⚠ Erreurs les plus fréquentes</h2>
              </div>
              <div className="bloc">
                {!dash?.codes_erreurs_les_plus_frequents.length ? (
                  <p style={{ color: "var(--color-encre-3)", margin: 0, fontSize: 13 }}>
                    Aucune erreur récurrente détectée.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {dash.codes_erreurs_les_plus_frequents.map((c) => {
                      const total = dash.codes_erreurs_les_plus_frequents.reduce(
                        (s, x) => s + x.count,
                        0
                      );
                      const pct = total ? Math.round((c.count / total) * 100) : 0;
                      return (
                        <div key={c.code}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontFamily: "var(--font-mono)",
                              fontSize: 11.5,
                              marginBottom: 3,
                            }}
                          >
                            <b
                              style={{
                                color:
                                  c.code === "CONJ" || c.code === "ORT"
                                    ? "#F2A0AF"
                                    : c.code === "ESP" || c.code === "REG"
                                    ? "#F2A0AF"
                                    : "#EFC97E",
                              }}
                            >
                              {c.code}
                            </b>
                            <span style={{ color: "var(--color-encre-2)" }}>
                              {c.count} · {pct}%
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--color-encre-2)",
                              marginBottom: 4,
                            }}
                          >
                            {c.label}
                          </div>
                          <div
                            style={{
                              height: 6,
                              background: "#2A3544",
                              borderRadius: 999,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: pct + "%",
                                height: "100%",
                                background: "linear-gradient(90deg,#E8A83C,#D98B00)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="carte sombre">
              <div className="entete-carte">
                <h2>Raccourcis</h2>
              </div>
              <div className="bloc">
                <Link
                  href="/expression-ecrite"
                  className="bouton principal"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginBottom: 8,
                    textDecoration: "none",
                  }}
                >
                  ✍ Faire une nouvelle copie
                </Link>
                <Link
                  href="/expression-ecrite/historique"
                  className="bouton clair"
                  style={{
                    display: "block",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  📚 Voir l'historique complet (50 essais)
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function LigneEssai({
  essai,
  draft,
  onChange,
  saving,
  onSave,
  deleting,
  onDelete,
  onOpenAnalyse,
}: {
  essai: EssaiExpressionEcrite;
  draft: string;
  onChange: (v: string) => void;
  saving: boolean;
  onSave: () => void;
  deleting: boolean;
  onDelete: () => void;
  onOpenAnalyse?: () => void;
}) {
  const note = essai.note_20 ?? 0;
  const b = badgeNote(note);
  const t = essai.tache_num || 1;
  const ecartSur8 = Math.max(0, Math.round((SEUIL_NCLC8 - note) * 10) / 10);
  const gap8Actions = (essai.gap_8?.actions || []).slice(0, 2);
  const criteres = essai.criteres || [];
  const extrait = (essai.copie || "").slice(0, 150);
  return (
    <article
      style={{
        borderRadius: 12,
        border: "1px solid var(--color-grille)",
        background: "rgba(255,255,255,.02)",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          padding: "12px 14px",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 12,
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <div
          style={{
            width: 60,
            padding: "8px 6px",
            textAlign: "center",
            borderRadius: 10,
            background: b.color,
            border: "1px solid " + b.border,
            color: b.text,
            fontFamily: "var(--font-serif)",
            fontWeight: 800,
          }}
        >
          <div style={{ fontSize: 22, lineHeight: 1 }}>
            {note}
            <small style={{ fontSize: 11, fontWeight: 500 }}>/20</small>
          </div>
          <div
            style={{
              fontSize: 9.5,
              letterSpacing: ".1em",
              marginTop: 2,
              fontFamily: "var(--font-mono)",
            }}
          >
            NCLC {essai.nclc || (note ? NCLC(note) : "—")}
          </div>
        </div>
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <span className="badge" style={{ fontSize: 11 }}>
              Tâche {t}
            </span>
            <span
              className="badge"
              style={{
                fontSize: 11,
                borderColor: b.border,
                background: b.color,
                color: b.text,
              }}
            >
              {note >= SEUIL_NCLC8
                ? "NCLC 8 ✓"
                : note >= SEUIL_NCLC7
                ? "NCLC 7 tenu"
                : "Sous le seuil"}
            </span>
            {typeof essai.score_100 === "number" && (
              <span className="badge" style={{ fontSize: 11 }}>
                {Math.round(essai.score_100)} / 100
              </span>
            )}
            <span
              className="badge"
              style={{ fontSize: 11, color: "var(--color-encre-2)" }}
            >
              {essai.nb_mots ?? 0} mots
            </span>
            {!isNaN(ecartSur8 as number) && ecartSur8 > 0 && (
              <span
                className="badge"
                style={{
                  fontSize: 11,
                  color: "#E8A83C",
                  borderColor: "#E8A83C55",
                  background: "#2A2115",
                }}
              >
                -{ecartSur8} pts → NCLC 8
              </span>
            )}
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--color-encre-3)",
                marginLeft: "auto",
                marginRight: 6,
              }}
            >
              {fmtDate(essai.created_at)}
            </span>
            {onOpenAnalyse && (
              <button
                type="button"
                onClick={onOpenAnalyse}
                title="Voir l'analyse complète (Score Breakdown, Feedback, Your Response, Corrected Version, Strengths·Areas, Grammar Tips, Vocab Upgrades)"
                style={{
                  all: "unset",
                  cursor: "pointer",
                  boxSizing: "border-box",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#6FA3F7",
                  background: "rgba(111,163,247,.08)",
                  border: "1px solid rgba(111,163,247,.28)",
                  whiteSpace: "nowrap",
                }}
              >
                🔎 Ouvrir l'analyse
              </button>
            )}
          </div>
          <p
            onClick={onOpenAnalyse}
            style={{
              margin: "8px 0 0",
              fontSize: 13,
              color: onOpenAnalyse ? "#BEC8DC" : "var(--color-encre-2)",
              lineHeight: 1.55,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: onOpenAnalyse ? "pointer" : "default",
            }}
            title={
              onOpenAnalyse
                ? "Cliquez pour ouvrir l'analyse complète · " + (essai.copie || "")
                : essai.copie || ""
            }
          >
            “{extrait}
            {(essai.copie || "").length > extrait.length ? "…" : ""}”
          </p>
          {criteres.length > 0 && (
            <div
              style={{
                marginTop: 8,
                display: "grid",
                gridTemplateColumns: "repeat(5,1fr)",
                gap: 6,
              }}
            >
              {criteres.slice(0, 5).map((c, i) => {
                const n = c.note || 0;
                const col =
                  n >= 4 ? "#3CCF91" : n >= 3 ? "#E8A83C" : "#F2A0AF";
                return (
                  <div
                    key={i}
                    style={{
                      fontSize: 10.5,
                      background: "rgba(255,255,255,.025)",
                      borderRadius: 8,
                      padding: "5px 6px",
                      border: "1px solid var(--color-grille)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--color-encre-2)",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          maxWidth: 80,
                        }}
                        title={c.nom}
                      >
                        {c.nom}
                      </span>
                      <b style={{ color: col, fontFamily: "var(--font-mono)" }}>
                        {n}
                        <small style={{ fontSize: 9 }}>/5</small>
                      </b>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {gap8Actions.length > 0 && (
        <div
          style={{
            padding: "8px 14px",
            background: "rgba(232,168,60,.05)",
            borderBottom: "1px solid rgba(232,168,60,.12)",
            fontSize: 12.5,
            color: "#E9DFC6",
          }}
        >
          <b style={{ color: "#E8A83C", marginRight: 6 }}>À travailler :</b>
          {gap8Actions.join(" · ")}
        </div>
      )}

      {/* Notes inline save + delete */}
      <div
        style={{
          padding: "10px 14px 14px",
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: 8,
          alignItems: "end",
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Mes notes sur cette copie : le point à revoir, ce que j'ai bien fait, ce que je referai différemment…"
          rows={2}
          style={{
            width: "100%",
            minHeight: 50,
            resize: "vertical",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid var(--color-grille)",
            background: "var(--color-fond)",
            color: "var(--color-encre)",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        />
        <button
          type="button"
          className="bouton principal"
          onClick={onSave}
          disabled={saving || !essai.id}
          style={{
            opacity: saving ? 0.7 : 1,
            alignSelf: "stretch",
            minWidth: 120,
          }}
        >
          {saving ? "Enregistrement…" : "💾 Sauvegarder"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting || saving || !essai.id}
          title="Supprimer cette copie (irréversible)"
          style={{
            all: "unset",
            cursor: deleting || saving || !essai.id ? "not-allowed" : "pointer",
            boxSizing: "border-box",
            alignSelf: "stretch",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 14px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            minWidth: 110,
            background: "#3A1A20",
            color: "#F2A0AF",
            border: "1px solid #F2A0AF44",
            opacity: deleting ? 0.7 : 1,
            transition: "filter .15s ease",
          }}
          onMouseEnter={(e) => {
            if (!deleting) e.currentTarget.style.filter = "brightness(1.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "";
          }}
        >
          {deleting ? "Suppression…" : "🗑 Supprimer"}
        </button>
      </div>
    </article>
  );
}
