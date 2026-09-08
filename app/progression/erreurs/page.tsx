"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import NavLaterale from "@/components/NavLaterale";
import type { DashboardErreurs, ErreurSuivi, GraviteErreur } from "@/lib/types/tcf";
import { CECRL } from "@/lib/llm/prompts";

void CECRL;

const CODES = [
  { code: "tous", label: "Tous les types" },
  { code: "CONJ", label: "CONJ — Conjugaison" },
  { code: "ORT",  label: "ORT — Orthographe / accents" },
  { code: "ACC",  label: "ACC — Accent / diacritique" },
  { code: "REG",  label: "REG — Accord / genre / nombre" },
  { code: "GRAM", label: "GRAM — Grammaire & syntaxe" },
  { code: "GR",   label: "GR — Grammaire générale" },
  { code: "VOC",  label: "VOC — Vocabulaire / registre" },
  { code: "LEX",  label: "LEX — Vocabulaire" },
  { code: "ESP",  label: "ESP — Spécificités écrit / OQLF" },
  { code: "COH",  label: "COH — Cohérence / connecteurs" },
  { code: "AUT",  label: "AUT — Autre / à classer" },
] as const;

const GRAVITES = [
  { g: "toutes",  label: "Toutes les gravités" },
  { g: "haute",   label: "Haute" },
  { g: "moyenne", label: "Moyenne" },
  { g: "basse",   label: "Basse" },
] as const;

const ECRITES = [
  { k: "toutes", label: "Toutes" },
  { k: "non",    label: "À réviser (pas encore 10×)" },
  { k: "oui",    label: "Maîtrisées (10× écrit)" },
] as const;

const TRI = [
  { k: "prochaine", label: "Par priorité de révision" },
  { k: "gravite",   label: "Par gravité" },
  { k: "date",      label: "Par date de création" },
  { k: "code",      label: "Par type d'erreur" },
  { k: "alpha",     label: "Par ordre alphabétique" },
] as const;

const GRAVITE_STYLE: Record<GraviteErreur, CSSProperties> = {
  haute:   { background: "#FBE0E6", color: "#8B1A2E", borderColor: "#BE2F4655", fontWeight: 700 },
  moyenne: { background: "#F7E9C6", color: "#7A4C00", borderColor: "#C77A0055", fontWeight: 700 },
  basse:   { background: "#DDF0E3", color: "#0E4A30", borderColor: "#2FA67155", fontWeight: 700 },
};
const CODE_BG: Record<string, string> = {
  CONJ: "#E9DCF1", ORT: "#F0DCE8", GRAM: "#DCE7F0", VOC: "#DDE9DC",
  REG: "#F0DCDC", GR: "#DCE3F0", ESP: "#DCEBE9", LEX: "#E9E8C8",
  COH: "#D7E1EC", ACC: "#ECE3C6", AUT: "#E2E2E2",
};
const CODE_FG: Record<string, string> = {
  CONJ: "#5A1F78", ORT: "#781F56", GRAM: "#184067", VOC: "#28542E",
  REG: "#7A1F1F", GR: "#1F3978", ESP: "#1A5B55", LEX: "#5C5710",
  COH: "#183F60", ACC: "#684D08", AUT: "#3A3A3A",
};
const segBase: CSSProperties = {
  border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer",
  fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, lineHeight: 1.3,
  transition: "all 0.12s ease",
};
const segActif: CSSProperties = {
  background: "var(--color-encre-1)", color: "var(--bg-1, #FFFBF0)",
  boxShadow: "0 1px 0 #00000022",
};
const segInactif: CSSProperties = {
  background: "transparent", color: "var(--color-encre-3)",
};
void segBase;

function fmtDate(v: string | null | undefined): string {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) +
      " à " +
      d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(v);
  }
}

function codeStyle(code: string): CSSProperties {
  return { background: CODE_BG[code] ?? CODE_BG.AUT, color: CODE_FG[code] ?? CODE_FG.AUT };
}

function labelCode(code: string): string {
  const found = CODES.find((c) => c.code === code);
  return found ? found.label.replace(/^.+? — /, "") : code;
}

export default function PageSuiviErreurs() {
  const [dash, setDash] = useState<DashboardErreurs | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [code, setCode] = useState<string>("tous");
  const [gravite, setGravite] = useState<string>("toutes");
  const [ecrites, setEcrites] = useState<string>("toutes");
  const [tri, setTri] = useState<string>("prochaine");

  const [practice, setPractice] = useState<ErreurSuivi | null>(null);
  const [modePratiq, setModePratiq] = useState<"clavier" | "papier">("clavier");
  const [valeursSaisies, setValeursSaisies] = useState<readonly string[]>(() =>
    Array.from({ length: 10 }, () => ""),
  );
  useEffect(() => {
    setValeursSaisies(Array.from({ length: 10 }, () => ""));
    setModePratiq("clavier");
  }, [practice?.id]);
  const nbCorrect = useMemo(() => {
    const ref = practice?.correction ?? "";
    return valeursSaisies.reduce((n, v) => n + (v === ref ? 1 : 0), 0);
  }, [valeursSaisies, practice?.correction]);
  const [showAdd, setShowAdd] = useState(false);

  const addDefaults = {
    code: "ORT",
    gravite: "moyenne" as GraviteErreur,
    original: "",
    correction: "",
    contexte: "",
    explication: "",
    notes: "",
  };
  const [addForm, setAddForm] = useState<typeof addDefaults>(addDefaults);

  const qs = useMemo(() => {
    const sp = new URLSearchParams();
    if (code !== "tous")   sp.set("code", code);
    if (gravite !== "toutes") sp.set("gravite", gravite);
    if (ecrites !== "toutes") sp.set("ecrites", ecrites);
    sp.set("tri", tri);
    return sp.toString();
  }, [code, gravite, ecrites, tri]);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setErr(null);
      try {
        const r = await fetch(`/api/erreurs${qs ? "?" + qs : ""}`, { signal: ctrl.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        setDash(j as DashboardErreurs);
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      }
    })();
    return () => ctrl.abort();
  }, [qs, reloadToken]);

  const list = dash?.erreurs ?? [];
  const pending = dash?.non_maitrises ?? 0;
  const mastered = dash?.ecrites_10x ?? 0;
  const total = dash?.total ?? 0;
  const parCode = dash?.par_code ?? [];
  const parGrav = dash?.par_gravite ?? [];
  const top = dash?.priorite_revision ?? [];
  const progessPct = total === 0 ? 0 : Math.round((mastered / total) * 100);

  async function toggleEcrite10x(id: string, cur: boolean) {
    await fetch(`/api/erreurs/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ecrit_10x_fois: !cur }),
    }).catch(() => {});
    setReloadToken((x) => x + 1);
  }

  async function sauvegarderNotes(id: string, notes: string) {
    await fetch(`/api/erreurs/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ notes }),
    }).catch(() => {});
    setReloadToken((x) => x + 1);
  }

  async function supprimer(id: string) {
    if (!window.confirm("Supprimer définitivement cette erreur de la liste de suivi ?")) return;
    await fetch(`/api/erreurs/${id}`, { method: "DELETE" }).catch(() => {});
    setReloadToken((x) => x + 1);
    if (practice?.id === id) setPractice(null);
  }

  async function ajouter() {
    if (!addForm.original || !addForm.correction) {
      window.alert("Remplis au minimum « Forme fautive » et « Correction » (zone orange).");
      return;
    }
    await fetch("/api/erreurs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setAddForm(addDefaults);
    setShowAdd(false);
    setReloadToken((x) => x + 1);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#E9E2CD" }}>
      <NavLaterale routeActive="/progression/erreurs" />
      <main style={{ flex: 1, padding: "24px 28px 140px", maxWidth: 1400, margin: "0 auto", width: "100%" }}>

        {/* ======== BREADCRUMB + TITRE ======== */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--color-encre-3)", fontFamily: "var(--font-mono)", marginBottom: 8,
          }}>
            <Link style={{ color: "var(--color-encre-3)" }} href="/progression">← Retour · Tableau de bord</Link>
            {"  ›  "}
            <span style={{ color: "var(--color-encre-1)" }}>Suivi des erreurs · Écrire 10×</span>
          </div>
          <h1 style={{
            fontFamily: "var(--font-titre)", fontSize: 40, margin: 0,
            color: "var(--color-encre-1)", letterSpacing: "-0.01em",
          }}>
            Suivi des erreurs · réécriture 10×
          </h1>
          <p style={{ marginTop: 8, color: "var(--color-encre-2)", fontSize: 14 }}>
            Toutes les fautes extraites automatiquement de tes copies corrigées, plus celles que tu ajoutes à la main.
            Coche <b>✍ Écrite 10×</b> après avoir réécrit la correction sur Seyès. Exporte en CSV ou Excel pour étudier hors ligne.
          </p>
        </div>

        {/* ======== KPIs RAPIDE ======== */}
        <div style={{
          background: "var(--color-papier, #F4ECD8)",
          border: "1px solid var(--color-ligne-seyes)",
          borderRadius: 14,
          padding: "20px 22px",
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          boxShadow: "0 1px 0 rgba(56,41,22,0.04)",
          marginBottom: 16,
        }}>
          <Kpi title="Erreurs suivies"   value={total.toString()} sub="" accent="var(--color-encre-1)" />
          <Kpi title="À réviser (pas 10×)" value={pending.toString()} sub={progessPct + "% maîtrisées"} accent="#BE2F46" />
          <Kpi title="Maîtrisées (10× ✔)" value={mastered.toString()} sub="" accent="#2FA671" />
          <Kpi title="Top priorité aujourd'hui" value={String(top[0]?.correction ?? "—").slice(0, 24) || "—"} sub={top[0]?.original ?? ""} accent="#A83C14" />
        </div>

        {/* ======== BARRE DE PROGRES GLOBALE ======== */}
        <div style={{
          background: "#F4ECD8", border: "1px solid var(--color-ligne-seyes)",
          borderRadius: 12, padding: "14px 18px", marginBottom: 18,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--color-encre-2)", marginBottom: 8 }}>
            <span><b style={{ color: "var(--color-encre-1)" }}>{mastered}</b> / {total} erreurs réécrites 10×</span>
            <b style={{ color: "var(--color-encre-1)" }}>{progessPct}%</b>
          </div>
          <div style={{ height: 10, background: "#0000000a", borderRadius: 999, overflow: "hidden", border: "1px solid #00000010" }}>
            <div style={{
              height: "100%", width: progessPct + "%",
              background: "linear-gradient(90deg, #2FA671 0%, #3CCF91 100%)",
              transition: "width .35s ease",
            }} />
          </div>
        </div>

        {/* ======== ROW 2 COLONNES : PAR CODE · PAR GRAVITÉ ======== */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 16, marginBottom: 18 }}>
          <div className="feuille-seyes" style={{ borderRadius: 12, padding: "20px 22px" }}>
            <TitreSection emoji="🏷" titre="Par type d'erreur" />
            {parCode.length === 0 ? (
              <p style={{ color: "var(--color-encre-3)", fontSize: 13 }}>Aucune erreur encore enregistrée — fais une correction ou ajoute-la manuellement.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {parCode.map((c) => {
                  const pct = total === 0 ? 0 : Math.round((c.count / total) * 100);
                  return (
                    <div key={c.code}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, marginBottom: 4 }}>
                        <span style={codeStyle(c.code as string)} className="badge-petit">{c.code as string}</span>
                        <span style={{ color: "var(--color-encre-1)" }}>{c.label}</span>
                        <span style={{ marginLeft: "auto", color: "var(--color-encre-3)", fontFamily: "var(--font-mono)" }}>
                          {c.count} · {c.non_maitrises} à revoir
                        </span>
                      </div>
                      <div style={{ height: 8, borderRadius: 999, background: "#0000000a", border: "1px solid #00000010", overflow: "hidden" }}>
                        <div style={{ width: pct + "%", height: "100%", background: "#2B4B82" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="feuille-seyes" style={{ borderRadius: 12, padding: "20px 22px" }}>
            <TitreSection emoji="⚠️" titre="Par gravité" />
            {parGrav.length === 0 ? <p style={{ color: "var(--color-encre-3)", fontSize: 13 }}>—</p> :
              parGrav.map((g) => (
                <div key={g.gravite} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span className="badge-petit" style={GRAVITE_STYLE[g.gravite]}>
                      {g.gravite === "haute" ? "Haute" : g.gravite === "basse" ? "Basse" : "Moyenne"}
                    </span>
                    <span style={{ fontSize: 13 }}>
                      <b style={{ color: "var(--color-encre-1)" }}>{g.count}</b> · {g.non_maitrises} à revoir
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "#0000000a", border: "1px solid #00000010", overflow: "hidden" }}>
                    <div style={{
                      width: total === 0 ? 0 : Math.round(g.count / total * 100) + "%",
                      height: "100%",
                      background: g.gravite === "haute" ? "#BE2F46" : g.gravite === "basse" ? "#2FA671" : "#E2B25D",
                    }} />
                  </div>
                </div>
              ))
            }
            <hr style={{ border: "none", borderTop: "1px dashed var(--color-ligne-seyes)", margin: "20px 0 14px" }} />
            <TitreSection emoji="🎯" titre="Top 5 — priorité de révision aujourd'hui" />
            {top.length === 0 ? <p style={{ color: "var(--color-encre-3)", fontSize: 13 }}>Tout est maîtrisé ✔ — génial.</p> :
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--color-encre-1)", display: "flex", flexDirection: "column", gap: 8 }}>
                {top.slice(0, 5).map((e) => (
                  <li key={e.id}>
                    <button
                      onClick={() => setPractice(e)}
                      style={{
                        background: "transparent", border: "none", padding: 0, cursor: "pointer",
                        color: "inherit", textAlign: "left", font: "inherit",
                      }}
                      title="Cliquer pour ouvrir la fiche de réécriture 10× (Seyès)"
                    >
                      <span style={codeStyle(e.code as string)} className="badge-petit">{e.code as string}</span>{" "}
                      <span style={{ color: "#BE2F46", textDecoration: "line-through" }}>{e.original}</span>
                      {" → "}
                      <span style={{ color: "#2FA671", fontWeight: 700 }}>{e.correction}</span>
                    </button>
                  </li>
                ))}
              </ul>
            }
          </div>
        </div>

        {/* ======== FILTRES + EXPORT ======== */}
        <div style={{
          background: "#F4ECD8",
          border: "1px solid var(--color-ligne-seyes)",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
        }}>
          <SelectChip label="Type" value={code} options={CODES.map((c) => ({ k: c.code, l: c.label }))} onChange={setCode} />
          <SelectChip label="Gravité" value={gravite} options={GRAVITES.map((g) => ({ k: g.g, l: g.label }))} onChange={setGravite} />
          <SelectChip label="Statut 10×" value={ecrites} options={ECRITES.map((x) => ({ k: x.k, l: x.label }))} onChange={setEcrites} />
          <SelectChip label="Trier par" value={tri} options={TRI.map((x) => ({ k: x.k, l: x.label }))} onChange={setTri} />

          <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setShowAdd(true)} className="bouton bouton-bleu" style={{ borderRadius: 10 }}>
              ➕ Ajouter manuellement
            </button>
            <a
              href={`/api/erreurs/export.csv${qs ? "?" + qs : ""}`}
              className="bouton bouton-gris"
              style={{ borderRadius: 10 }}
            >
              📤 Exporter en CSV
            </a>
            <a
              href={`/api/erreurs/export.xlsx${qs ? "?" + qs : ""}`}
              className="bouton bouton-vert"
              style={{ borderRadius: 10 }}
            >
              📊 Exporter en Excel (.xlsx)
            </a>
          </div>
        </div>

        {err && <div style={{
          background: "#3A1A20", color: "#F2A0AF", padding: "12px 16px",
          borderRadius: 10, marginBottom: 14, fontSize: 13,
        }}>⚠ Impossible de charger les erreurs : {err}</div>}

        {/* ======== TABLE ======== */}
        <div className="feuille-seyes" style={{ borderRadius: 12, padding: "18px 18px 10px", overflow: "auto" }}>
          <TitreSection emoji="📘" titre={`Liste des erreurs · ${list.length} ligne${list.length > 1 ? "s" : ""}`} />
          {list.length === 0 ? (
            <p style={{ color: "var(--color-encre-3)", fontSize: 14 }}>
              Aucune erreur ne correspond aux filtres. Désélectionne les filtres ou bien fais une copie corrigée.
            </p>
          ) : (
            <div style={{
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              {list.map((e) => (
                <ErreurCard
                  key={e.id}
                  e={e}
                  onToggle10x={(cur) => toggleEcrite10x(e.id!, cur)}
                  onNotesSave={(notes) => sauvegarderNotes(e.id!, notes)}
                  onDelete={() => supprimer(e.id!)}
                  onPractice={() => setPractice(e)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ======== AJOUT MANUEL MODAL ======== */}
        {showAdd && (
          <Modal onClose={() => { setShowAdd(false); setAddForm(addDefaults); }} titre="➕ Ajouter une erreur manuellement">
            <p style={{ marginTop: -4, color: "var(--color-encre-2)", fontSize: 13 }}>
              Pour ajouter une faute trouvée en dehors de l&apos;app (exo de conjugaison, exercice du manuel…).
            </p>
            <div style={{
              padding: "10px 12px", background: "#2A2115", borderRadius: 10, fontSize: 13,
              border: "1px solid #E2B25D44", color: "#E2B25D", marginBottom: 14,
            }}>
              ⚠ Remplis au minimum <b>Forme fautive</b> et <b>Correction</b>.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Type d'erreur">
                <select
                  value={addForm.code}
                  onChange={(ev) => setAddForm({ ...addForm, code: ev.target.value })}
                  className="champ-saisie"
                  style={{ width: "100%" }}
                >
                  {CODES.filter((c) => c.code !== "tous").map((c) =>
                    <option key={c.code} value={c.code}>{c.label}</option>
                  )}
                </select>
              </Field>
              <Field label="Gravité">
                <select
                  value={addForm.gravite}
                  onChange={(ev) => setAddForm({ ...addForm, gravite: ev.target.value as GraviteErreur })}
                  className="champ-saisie"
                  style={{ width: "100%" }}
                >
                  <option value="haute">Haute</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="basse">Basse</option>
                </select>
              </Field>
              <Field label="🧨 Forme fautive (original) — ex: preferé">
                <input className="champ-saisie" value={addForm.original}
                  onChange={(ev) => setAddForm({ ...addForm, original: ev.target.value })}
                  style={{ width: "100%", borderColor: "#E2B25D66" }} />
              </Field>
              <Field label="✅ Correction juste — ex: préféré">
                <input className="champ-saisie" value={addForm.correction}
                  onChange={(ev) => setAddForm({ ...addForm, correction: ev.target.value })}
                  style={{ width: "100%", borderColor: "#2FA67166" }} />
              </Field>
              <Field label="Contexte (phrase où apparaît l'erreur) — optionnel" span2>
                <input className="champ-saisie" value={addForm.contexte}
                  onChange={(ev) => setAddForm({ ...addForm, contexte: ev.target.value })} style={{ width: "100%" }} />
              </Field>
              <Field label="Explication (règle, mnémotechnique…) — optionnel" span2>
                <textarea className="champ-saisie" rows={2} value={addForm.explication}
                  onChange={(ev) => setAddForm({ ...addForm, explication: ev.target.value })}
                  style={{ width: "100%", resize: "vertical" }} />
              </Field>
              <Field label="Notes personnelles — optionnel" span2>
                <textarea className="champ-saisie" rows={2} value={addForm.notes}
                  onChange={(ev) => setAddForm({ ...addForm, notes: ev.target.value })}
                  style={{ width: "100%", resize: "vertical" }} />
              </Field>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <button className="bouton bouton-gris" onClick={() => { setShowAdd(false); setAddForm(addDefaults); }}>Annuler</button>
              <button className="bouton bouton-vert" onClick={ajouter}>Ajouter et fermer</button>
            </div>
          </Modal>
        )}

        {/* ======== PRATIQUE 10× MODAL ======== */}
        {practice && (
          <Modal large onClose={() => setPractice(null)} titre={<>Écrire 10× · <span style={{ color: "#BE2F46", textDecoration: "line-through" }}>{practice.original}</span> <span style={{ color: "var(--color-encre-3)" }}>→</span> <span style={{ color: "#2FA671" }}>{practice.correction}</span></>}>
            <div style={{
              fontSize: 13, color: "var(--color-encre-2)", marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center",
            }}>
              <span style={codeStyle(practice.code as string)} className="badge-petit">{practice.code as string} · {labelCode(practice.code as string)}</span>
              <span className="badge-petit" style={GRAVITE_STYLE[(practice.gravite ?? "moyenne") as GraviteErreur]}>
                G. {(practice.gravite ?? "moyenne") === "haute" ? "haute" : (practice.gravite ?? "moyenne") === "basse" ? "basse" : "moyenne"}
              </span>
              <span style={{ color: "var(--color-encre-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                ✔ déjà révisé {practice.nb_revisions ?? 0} séances · dernière : {fmtDate(practice.derniere_revision) || "jamais"}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-encre-3)" }}>
                Prochaine révision : {fmtDate(practice.prochaine_revision) || "aujourd'hui"}
              </span>
            </div>
            <div style={{
              background: "#14261F", color: "#D5EEE0", padding: "12px 14px", borderRadius: 10,
              border: "1px solid #3CCF9133", fontSize: 14, marginBottom: 12,
            }}>
              <b style={{ color: "#3CCF91" }}>🖋 Règle 10× : </b>
              Recopie la forme juste <b>10 fois d'affilée</b> — au clavier ici ou sur ton cahier Seyès.
              {modePratiq === "clavier" ? (
                <> Les 10 champs doivent correspondre exactement (accents, cédilles, apostrophes, espaces).
                  <b style={{ color: nbCorrect === 10 ? "#3CCF91" : "#F2A0AF", marginLeft: 10 }}>
                    {nbCorrect} / 10 correct
                  </b>
                </>
              ) : (
                <> Coche manuellement après avoir écrit sur papier. </>
              )}
              La prochaine révision est automatiquement décalée (1, 3, 7, 14, 30, 60, 90 jours).
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, justifyContent: "flex-end" }}>
              <div role="tablist" style={{
                display: "inline-flex", alignItems: "stretch",
                background: "var(--bg-2, #F5EEE0)",
                border: "1px solid var(--color-ligne-seyes, #C9BFAB)",
                borderRadius: 10, padding: 3, gap: 3,
              }}>
                <button
                  type="button"
                  onClick={() => setModePratiq("clavier")}
                  aria-pressed={modePratiq === "clavier"}
                  style={{
                    ...segBase,
                    ...(modePratiq === "clavier" ? segActif : segInactif),
                  } as CSSProperties}
                >⌨️ Clavier (saisie 10×)</button>
                <button
                  type="button"
                  onClick={() => setModePratiq("papier")}
                  aria-pressed={modePratiq === "papier"}
                  style={{
                    ...segBase,
                    ...(modePratiq === "papier" ? segActif : segInactif),
                  } as CSSProperties}
                >📝 Papier Seyès (filigrane)</button>
              </div>
            </div>
            <Seyes10Pratique
              mode={modePratiq}
              correction={practice.correction ?? ""}
              explication={practice.explication ?? undefined}
              valeurs={valeursSaisies}
              onChange={(next) => setValeursSaisies(next)}
            />
            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 12, color: modePratiq === "clavier" ? (nbCorrect === 10 ? "#2FA671" : "#BE2F46") : "var(--color-encre-3)"
              }}>
                {modePratiq === "clavier"
                  ? (nbCorrect === 10 ? "✅ Parfait — les 10 lignes correspondent exactement à la correction" : `⌛ Encore ${10 - nbCorrect} ligne(s) correcte(s) avant validation`)
                  : "🖋 Mode papier — tu peux enregistrer la séance dès que tu as fini sur ton cahier Seyès"
                }
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="bouton bouton-gris" onClick={() => setPractice(null)}>Fermer (plus tard)</button>
                <button
                  className="bouton bouton-vert"
                  disabled={modePratiq === "clavier" ? nbCorrect !== 10 : false}
                  style={
                    (modePratiq === "clavier" && nbCorrect !== 10)
                      ? ({ opacity: 0.55, cursor: "not-allowed" })
                      : (undefined as CSSProperties | undefined)
                  }
                  onClick={async () => {
                    if (!practice.id) return;
                    if (modePratiq === "clavier" && nbCorrect !== 10) return;
                    await fetch(`/api/erreurs/${practice.id}`, {
                      method: "PATCH",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ marquer_revision: true }),
                    });
                    setReloadToken((x) => x + 1);
                    setPractice(null);
                  }}
                >
                  ✍ J&apos;ai écrit 10× — enregistrer la séance
                </button>
              </div>
            </div>
          </Modal>
        )}

      </main>
    </div>
  );
}

/* ========================================================================== */
/*                            SOUS-COMPOSANTS                                  */
/* ========================================================================== */

function Kpi({ title, value, sub, accent }: { title: string; value: string; sub: string; accent: string }) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: ".14em",
        textTransform: "uppercase", color: "var(--color-encre-3)", marginBottom: 6,
      }}>{title}</div>
      <div style={{
        fontFamily: "var(--font-titre)", fontSize: 28, lineHeight: 1,
        color: accent,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--color-encre-2)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function TitreSection({ emoji, titre }: { emoji: string; titre: string }) {
  return (
    <h3 style={{
      margin: "0 0 14px 0",
      fontSize: 14,
      letterSpacing: ".18em",
      textTransform: "uppercase",
      fontFamily: "var(--font-mono)",
      color: "var(--color-encre-1)",
    }}>
      <span style={{ marginRight: 8 }}>{emoji}</span>{titre}
    </h3>
  );
}

function SelectChip({
  label, value, options, onChange,
}: { label: string; value: string; options: { k: string; l: string }[]; onChange: (k: string) => void }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{
        fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".15em",
        textTransform: "uppercase", color: "var(--color-encre-3)",
      }}>{label}</span>
      <select
        className="champ-saisie"
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        style={{ minWidth: 180, borderRadius: 8 }}
      >
        {options.map((o) => <option key={o.k} value={o.k}>{o.l}</option>)}
      </select>
    </label>
  );
}

function Field({ label, span2, children }: { label: string; span2?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ gridColumn: span2 ? "1 / -1" : undefined }}>
      <div style={{
        fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".15em",
        textTransform: "uppercase", color: "var(--color-encre-3)", marginBottom: 4,
      }}>{label}</div>
      {children}
    </div>
  );
}

function Modal({
  onClose, titre, children, large,
}: { onClose: () => void; titre: React.ReactNode; children: React.ReactNode; large?: boolean }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(17,22,30,0.62)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 120, padding: "24px 20px",
      }}
    >
      <div style={{
        background: "#F4ECD8", border: "1px solid var(--color-ligne-seyes)",
        borderRadius: 14, width: large ? "min(1180px, 100%)" : "min(780px, 100%)",
        maxHeight: "calc(100vh - 48px)", overflow: "auto",
        padding: "22px 24px", boxShadow: "0 30px 80px rgba(10,10,10,0.35)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <h2 style={{
            fontFamily: "var(--font-titre)", fontSize: 22, margin: 0,
            color: "var(--color-encre-1)", flex: 1,
          }}>{titre}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="bouton bouton-gris"
            style={{ padding: "6px 12px", borderRadius: 8 }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ErreurCard({
  e, onToggle10x, onNotesSave, onDelete, onPractice,
}: {
  e: ErreurSuivi;
  onToggle10x: (cur: boolean) => void;
  onNotesSave: (notes: string) => void;
  onDelete: () => void;
  onPractice: () => void;
}) {
  const [notes, setNotes] = useState<string>(e.notes ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <article style={{
      background: "linear-gradient(180deg, #FBF5E0 0%, #F4ECD8 100%)",
      border: "1px solid var(--color-ligne-seyes)",
      borderRadius: 12,
      padding: "14px 16px 12px",
      position: "relative",
    }}>
      {/* Row 1: badges + en-tête */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <span style={codeStyle(e.code as string)} className="badge-petit">{e.code as string}</span>
        <span className="badge-petit" style={GRAVITE_STYLE[(e.gravite ?? "moyenne") as GraviteErreur]}>
          {(e.gravite ?? "moyenne") === "haute" ? "Gravité haute" : (e.gravite ?? "moyenne") === "basse" ? "Gravité basse" : "Gravité moyenne"}
        </span>
        {e.manuel && <span className="badge-petit" style={{ background: "#233045", color: "#A9C0EC", border: "1px solid #A9C0EC44" }}>Ajout manuel</span>}
        {!e.ecrit_10x_fois && <span className="badge-petit" style={{ background: "#2A2115", color: "#E2B25D", border: "1px solid #E2B25D44" }}>À écrire 10×</span>}
        {e.ecrit_10x_fois && <span className="badge-petit" style={{ background: "#14261F", color: "#5DBD94", border: "1px solid #5DBD9444" }}>✔ Écrite 10× · {e.nb_revisions ?? 1} séance{(e.nb_revisions ?? 0) >= 2 ? "s" : ""}</span>}

        <div style={{
          marginLeft: "auto", fontSize: 12, color: "var(--color-encre-3)",
          fontFamily: "var(--font-mono)", display: "flex", gap: 12, alignItems: "center",
        }}>
          <span>{fmtDate(e.created_at)}</span>
          {e.prochaine_revision && !e.ecrit_10x_fois && (
            <span title="Prochaine révision recommandée">⏰ {fmtDate(e.prochaine_revision)}</span>
          )}
          {e.essai_id && (
            <Link
              href={`/progression/essai/${e.essai_id}`}
              style={{ color: "#2B4B82", textDecoration: "none" }}
              title="Ouvrir la copie d'origine"
            >📑 Copie</Link>
          )}
        </div>
      </div>

      {/* Row 2 : ERREUR → CORRECTION */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center",
        fontSize: 15, marginBottom: 8,
      }}>
        <div style={{
          background: "#3A1A2014", color: "#5A161F",
          padding: "10px 12px", borderRadius: 10, border: "1px solid #BE2F4633",
        }}>
          <div style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase",
            fontFamily: "var(--font-mono)", color: "#BE2F46", marginBottom: 4 }}>
            ❌ Forme fautive
          </div>
          <span style={{ textDecoration: "line-through solid #BE2F46 1.5px", color: "#BE2F46", fontWeight: 700 }}>
            {e.original}
          </span>
        </div>
        <div style={{ fontSize: 24, color: "var(--color-encre-3)", fontFamily: "var(--font-titre)" }}>→</div>
        <div style={{
          background: "#14261F18", color: "#104A35",
          padding: "10px 12px", borderRadius: 10, border: "1px solid #2FA67133",
        }}>
          <div style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase",
            fontFamily: "var(--font-mono)", color: "#2FA671", marginBottom: 4 }}>
            ✅ Correction juste
          </div>
          <span style={{ color: "#0F4A35", fontWeight: 700 }}>{e.correction}</span>
        </div>
      </div>

      {/* Row 3 : Contexte + Explication */}
      {(e.contexte || e.explication) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
          {e.contexte && (
            <div style={{
              background: "#ECE4CC", padding: "8px 10px", borderRadius: 8,
              border: "1px dashed var(--color-ligne-seyes)", color: "var(--color-encre-2)",
              fontSize: 13, fontStyle: "italic",
            }}>💬 {e.contexte}</div>
          )}
          {e.explication && (
            <div style={{
              background: "#ECE4CC", padding: "8px 10px", borderRadius: 8,
              border: "1px dashed var(--color-ligne-seyes)", color: "var(--color-encre-1)",
              fontSize: 13,
            }}>📘 {e.explication}</div>
          )}
        </div>
      )}

      {/* Row 4 : Notes */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 380px", gap: 10, alignItems: "flex-start",
      }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{
            fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".15em",
            textTransform: "uppercase", color: "var(--color-encre-3)",
          }}>📝 Mes notes (règle mnémo, piège, origine de la faute…)</span>
          <textarea
            rows={2}
            className="champ-saisie"
            value={notes}
            onChange={(ev) => setNotes(ev.target.value)}
            onBlur={() => { if (notes !== (e.notes ?? "")) onNotesSave(notes); }}
            style={{ resize: "vertical", borderRadius: 8 }}
            placeholder="Ex: préféré prend un accent grave car e muet avant r final…"
          />
        </label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "stretch", justifyContent: "flex-end" }}>
          <label className="bouton bouton-vert" style={{
            borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 8,
            cursor: "pointer", userSelect: "none", padding: "10px 14px",
            background: e.ecrit_10x_fois ? "#14261F" : undefined,
            color: e.ecrit_10x_fois ? "#5DBD94" : undefined,
            border: "1px solid " + (e.ecrit_10x_fois ? "#5DBD9455" : "var(--color-vert-fonce)"),
          }}>
            <input
              type="checkbox"
              checked={!!e.ecrit_10x_fois}
              onChange={() => onToggle10x(!!e.ecrit_10x_fois)}
              style={{ accentColor: "#2FA671", width: 16, height: 16 }}
              disabled={saving}
            />
            <span>✍ Écrite 10×</span>
          </label>

          <button className="bouton bouton-bleu" style={{ borderRadius: 10 }} onClick={onPractice}>
            🖊 Ouvrir feuille 10×
          </button>

          <button
            className="bouton bouton-rouge"
            style={{ borderRadius: 10 }}
            onClick={() => { setSaving(true); onDelete(); }}
          >🗑 Supprimer</button>
        </div>
      </div>
    </article>
  );
}

/**
 * Affiche 10 lignes Seyès. Deux modes :
 *  - "clavier" (défaut) : 10 champs <input> où l'utilisateur recopie la correction.
 *     Chaque ligne est colorée : vert si exactement égal à correction, rouge sinon (quand touched).
 *  - "papier" : 10 lignes en filigrane (ancien comportement) pour écrire sur un cahier Seyès physique.
 */
function Seyes10Pratique({
  mode,
  correction,
  explication,
  valeurs,
  onChange,
}: {
  mode: "clavier" | "papier";
  correction: string;
  explication?: string;
  valeurs: readonly string[];
  onChange: (next: readonly string[]) => void;
}) {
  const indices = Array.from({ length: 10 }, (_, i) => i + 1);
  const update = (idx: number, value: string) => {
    const next = valeurs.slice();
    next[idx] = value;
    onChange(next);
  };
  const ligneBg = "#FBF5E0";
  return (
    <div
      className="feuille-seyes"
      style={{
        borderRadius: 14,
        padding: "26px 30px 22px",
        background: ligneBg,
        border: "1px solid var(--color-ligne-seyes)",
        fontFamily: "var(--font-ecriture)",
        fontSize: 26,
        lineHeight: "32px",
        letterSpacing: "0.005em",
        color: "var(--color-encre-1)",
        position: "relative",
      }}
    >
      {explication && (
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".05em",
          color: "#2B4B82", padding: "8px 10px", background: "#E4ECF9",
          borderRadius: 8, border: "1px dashed #2B4B8266", marginBottom: 14,
          fontStyle: "normal",
        }}>📘 {explication}</div>
      )}
      {indices.map((i) => {
        const idx = i - 1;
        const valeur = valeurs[idx] ?? "";
        const ok = valeur === correction;
        const tape = valeur.length > 0;
        return (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              position: "relative",
              minHeight: 44,
              padding: "4px 0",
              borderBottom:
                i < 10 ? "1px solid var(--color-ligne-seyes)" : undefined,
            }}
          >
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--color-encre-3)",
              width: 28, textAlign: "right", flexShrink: 0,
            }}>{i}.</span>
            {mode === "clavier" ? (
              <input
                key={`in-${idx}-${correction}`}
                type="text"
                inputMode="text"
                autoCapitalize="sentences"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                value={valeur}
                onChange={(e) => update(idx, e.target.value)}
                placeholder={correction}
                aria-label={`Ligne ${i} : taper ${correction}`}
                style={{
                  flex: 1,
                  fontFamily: "var(--font-ecriture)",
                  fontSize: 26,
                  lineHeight: "34px",
                  padding: "2px 10px",
                  borderRadius: 8,
                  color: ok ? "#2FA671" : tape ? "#BE2F46" : "var(--color-encre-1)",
                  background:
                    ok ? "#E7F7EE" : tape ? "#FBE9EC55" : "transparent",
                  border:
                    ok ? "1.5px solid #2FA671"
                      : tape ? "1.5px dashed #BE2F46AA"
                      : "1.5px solid transparent",
                  outline: "none",
                  boxShadow: tape
                    ? (ok ? "inset 0 -1px 0 #2FA67144" : "inset 0 -1px 0 #BE2F4655")
                    : "inset 0 -1px 0 var(--color-ligne-seyes)",
                  letterSpacing: "0.005em",
                  caretColor: "#BE2F46",
                } as CSSProperties}
              />
            ) : (
              <div style={{
                flex: 1,
                fontFamily: "var(--font-ecriture)",
                fontSize: 26,
                color: "#0000002A",
                userSelect: "text",
                whiteSpace: "pre",
              }}>
                {correction}
              </div>
            )}
          </div>
        );
      })}
      <div style={{
        marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 11,
        letterSpacing: ".15em", textTransform: "uppercase", color: "var(--color-encre-3)",
        borderTop: "1px dashed var(--color-ligne-seyes)", paddingTop: 10,
      }}>
        {mode === "clavier"
          ? "⌨️ TAPE la correction 10× — exacte (accents / apostrophes / cédilles). Les lignes vertes = OK."
          : "🖊 INDICE : recopie la correction sur ton cahier Seyès 10×. Ne te contente pas de lire."}
      </div>
    </div>
  );
}
