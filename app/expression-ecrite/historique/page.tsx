import { createClient } from "@/lib/supabase/server";
import type { EssaiExpressionEcrite } from "@/lib/types/tcf";
import { NCLC, CECRL } from "@/lib/llm/prompts";
import NavLaterale from "@/components/NavLaterale";

export const dynamic = "force-dynamic";

const esc = (t: string) =>
  String(t || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

async function getEssais(): Promise<EssaiExpressionEcrite[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("essais_expression_ecrite")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("Supabase essais fetch error:", error);
      return [];
    }
    return (data || []) as EssaiExpressionEcrite[];
  } catch (e) {
    console.error("Essais fetch exception:", e);
    return [];
  }
}

export default async function PageHistorique() {
  const lignes = await getEssais();

  const chrono = [...lignes].reverse();
  const W = 760;
  const H = 260;
  const padL = 44;
  const padR = 20;
  const padT = 24;
  const padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const yAt = (n: number) => padT + plotH - (Math.max(0, Math.min(20, n)) / 20) * plotH;
  const pts = chrono
    .map((e, i) => {
      const n = e.note_20 ?? 0;
      const x = chrono.length <= 1 ? padL + plotW / 2 : padL + (i / (chrono.length - 1)) * plotW;
      return { x, y: yAt(n), n, i, e };
    });
  const polyline = pts.length
    ? pts.map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ")
    : "";
  const yTicks = [0, 5, 10, 12, 15, 20];

  const nAtteint7 = lignes.filter((e) => (e.note_20 ?? 0) >= 10).length;
  const nAtteint8 = lignes.filter((e) => (e.note_20 ?? 0) >= 12).length;
  const moyenne = lignes.length
    ? Math.round(
        (lignes.reduce((s, e) => s + (e.note_20 ?? 0), 0) / lignes.length) * 10
      ) / 10
    : 0;

  return (
    <div className="coquille">
      <NavLaterale actif="historique" />
      <main className="contenu-principal">
      <div className="grille">
        <div className="col-gauche">
          <section className="carte">
            <div className="entete-carte">
              <h2>Progression des notes</h2>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-encre-3)" }}>
                {chrono.length} essai{chrono.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="bloc" style={{ padding: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                <div className="stat" style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid var(--color-grille)" }}>
                  <b style={{ fontSize: 22, display: "block" }}>{moyenne || "—"}</b>note moyenne
                </div>
                <div className="stat" style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,.04)", border: "1px solid var(--color-grille)" }}>
                  <b style={{ fontSize: 22, display: "block" }}>{lignes.length}</b>copies corrigées
                </div>
                <div className="stat" style={{ padding: "10px 14px", borderRadius: 10, background: moyenne >= 10 ? "rgba(111,211,169,.08)" : "rgba(255,255,255,.04)", border: "1px solid " + (moyenne >= 10 ? "#6FD3A9" : "var(--color-grille)") }}>
                  <b style={{ fontSize: 22, display: "block", color: moyenne >= 10 ? "#6FD3A9" : "inherit" }}>{nAtteint7}</b>
                  <span style={{ color: "var(--color-encre-2)" }}>NCLC 7 atteint</span>
                </div>
                <div className="stat" style={{ padding: "10px 14px", borderRadius: 10, background: moyenne >= 12 ? "rgba(111,211,169,.12)" : "rgba(255,255,255,.04)", border: "1px solid " + (moyenne >= 12 ? "#6FD3A9" : "var(--color-grille)") }}>
                  <b style={{ fontSize: 22, display: "block", color: moyenne >= 12 ? "#6FD3A9" : "inherit" }}>{nAtteint8}</b>
                  <span style={{ color: "var(--color-encre-2)" }}>NCLC 8 tenu</span>
                </div>
              </div>

              {pts.length ? (
                <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Courbe de progression">
                  <line x1={padL} y1={yAt(12)} x2={W - padR} y2={yAt(12)} stroke="#6FD3A9" strokeDasharray="4 4" strokeWidth={1.2} />
                  <text x={W - padR - 4} y={yAt(12) - 5} fontSize="10" fill="#6FD3A9" textAnchor="end" fontFamily="var(--font-mono)">NCLC 8 · 12/20</text>
                  <line x1={padL} y1={yAt(10)} x2={W - padR} y2={yAt(10)} stroke="#EFC97E" strokeDasharray="4 4" strokeWidth={1.2} />
                  <text x={W - padR - 4} y={yAt(10) - 5} fontSize="10" fill="#EFC97E" textAnchor="end" fontFamily="var(--font-mono)">NCLC 7 · 10/20</text>
                  {yTicks.map((y) => (
                    <g key={y}>
                      <line x1={padL} y1={yAt(y)} x2={W - padR} y2={yAt(y)} stroke="rgba(255,255,255,.06)" />
                      <text x={padL - 8} y={yAt(y) + 3.5} fontSize="10" fill="var(--color-encre-3)" textAnchor="end" fontFamily="var(--font-mono)">{y}</text>
                    </g>
                  ))}
                  <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="var(--color-grille)" />
                  {pts.length > 1 && (
                    <polyline points={polyline} fill="none" stroke="var(--color-bleu)" strokeWidth={2} />
                  )}
                  {pts.map((p) => {
                    const atteint = p.n >= 12 ? "#6FD3A9" : p.n >= 10 ? "#EFC97E" : "#F2A0AF";
                    return (
                      <g key={p.i}>
                        <circle cx={p.x} cy={p.y} r={4.5} fill={atteint} stroke="var(--color-fond)" strokeWidth={2} />
                        <title>
                          Essai {p.i + 1} — {p.n || 0}/20 · {CECRL(p.n || 0)}
                        </title>
                      </g>
                    );
                  })}
                  {pts.length > 0 && (
                    <>
                      <text x={pts[0].x} y={H - 10} fontSize="9" fill="var(--color-encre-3)" textAnchor="middle" fontFamily="var(--font-mono)">1</text>
                      <text x={pts[pts.length - 1].x} y={H - 10} fontSize="9" fill="var(--color-encre-3)" textAnchor="middle" fontFamily="var(--font-mono)">{pts.length}</text>
                      <text x={padL + plotW / 2} y={H - 1} fontSize="10" fill="var(--color-encre-2)" textAnchor="middle" fontFamily="var(--font-mono)">essais (ordre chronologique)</text>
                    </>
                  )}
                </svg>
              ) : (
                <div style={{ padding: 28, textAlign: "center", color: "var(--color-encre-3)", fontSize: 13.5, border: "1px dashed var(--color-grille)", borderRadius: 10 }}>
                  Aucun essai enregistré pour le moment. Rendez-vous dans l'onglet <b>Éditeur &amp; correction</b>, puis cliquez sur <i>Corriger ma copie</i> : la note sera ajoutée ici automatiquement.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="col-droite">
          <section className="carte sombre">
            <div className="entete-carte">
              <h2>Dernières copies</h2>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-encre-3)" }}>
                {lignes.length ? `1–${Math.min(lignes.length, 50)}` : "0"}
              </span>
            </div>
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {lignes.length === 0 && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-encre-3)", padding: 8 }}>
                  Aucune copie encore. Vos corrections apparaîtront ici avec les écarts jusqu'au NCLC 8.
                </p>
              )}
              {lignes.map((ess, i) => {
                const n = ess.note_20 ?? 0;
                const t = ess.tache_num || 1;
                const atteint =
                  n >= 12 ? "cible-atteinte" : n >= 10 ? "" : "cible-manquée";
                const extrait = (ess.copie || "").slice(0, 140);
                const criteres = ess.criteres || [];
                const actions = (ess.gap_8?.actions || []).slice(0, 3);
                const date = ess.created_at
                  ? new Date(ess.created_at).toLocaleString("fr-CA", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";
                return (
                  <article
                    key={ess.id || String(ess.created_at ?? i) + "-" + i}
                    style={{
                      border: "1px solid var(--color-grille)",
                      borderRadius: 12,
                      padding: 14,
                      background: "rgba(255,255,255,.02)",
                    }}
                  >
                    <header
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <span
                          className="badge"
                          style={{ marginRight: 6 }}
                        >
                          Tâche {t}
                        </span>
                        <span
                          className={"badge " + atteint}
                          style={{ marginRight: 6 }}
                        >
                          {NCLC(n)}
                        </span>
                        <span
                          className="badge"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                          }}
                        >
                          {date}
                        </span>
                      </div>
                      <div className="note-grande" style={{ minWidth: 58, textAlign: "right" }}>
                        <div className="val" style={{ fontSize: 22, lineHeight: 1 }}>
                          {n}<small style={{ fontSize: 11 }}>/20</small>
                        </div>
                      </div>
                    </header>
                    <p
                      style={{
                        margin: "2px 0 10px",
                        fontSize: 12.5,
                        color: "var(--color-encre-2)",
                        lineHeight: 1.55,
                        fontFamily: "var(--font-serif)",
                      }}
                    >
                      “{esc(extrait)}
                      {(ess.copie || "").length > 140 ? "…" : ""}” — {ess.nb_mots || 0} mots
                    </p>
                    {criteres.length > 0 && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 6,
                          marginBottom: 10,
                        }}
                      >
                        {criteres.map((c, i) => {
                          const pct = Math.max(
                            0,
                            Math.min(100, ((c.note || 0) / 5) * 100)
                          );
                          const cl =
                            c.note >= 4
                              ? "#6FD3A9"
                              : c.note >= 3
                              ? "#EFC97E"
                              : "#F2A0AF";
                          return (
                            <div
                              key={i}
                              style={{
                                border: "1px solid var(--color-grille)",
                                borderRadius: 8,
                                padding: "4px 6px",
                                fontSize: 10.5,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "baseline",
                                  color: "var(--color-encre-2)",
                                  fontFamily: "var(--font-mono)",
                                }}
                              >
                                <span>{esc(c.nom.split(" ")[0])}</span>
                                <b style={{ color: cl }}>{c.note ?? 0}/5</b>
                              </div>
                              <div
                                style={{
                                  marginTop: 4,
                                  height: 3,
                                  background: "rgba(255,255,255,.08)",
                                  borderRadius: 999,
                                  overflow: "hidden",
                                }}
                              >
                                <i
                                  style={{
                                    display: "block",
                                    height: "100%",
                                    width: pct + "%",
                                    background: cl,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {actions.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: 10.5,
                            letterSpacing: ".12em",
                            textTransform: "uppercase",
                            color: "var(--color-marge)",
                            marginBottom: 5,
                          }}
                        >
                          Priorités NCLC 8
                        </div>
                        <div className="tirettes" style={{ margin: 0 }}>
                          {actions.map((a, i) => (
                            <span
                              key={i}
                              className="tirette"
                              style={{
                                fontSize: 12,
                                background: "rgba(239,201,126,.08)",
                                borderColor: "rgba(239,201,126,.25)",
                                color: "#F7E6BE",
                              }}
                            >
                              {esc(a)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
      </main>
    </div>
  );
}
