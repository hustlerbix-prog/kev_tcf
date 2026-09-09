"use client";

import { useEffect, useState } from "react";
import { markdownLite } from "@/lib/utils/markdownLite";
import { CONNECTEURS_T3_GROUPE } from "@/lib/heuristiques/taches";

type BlocConnaissance = {
  id: string;
  tache_num: 1 | 2 | 3;
  slug: string;
  bloc_type: "objectif" | "squelette" | "connecteurs" | "checklist" | "exemple" | "avertissement";
  titre: string;
  description: string | null;
  contenu_markdown: string;
  ordre: number;
};

interface Props {
  tache: 1 | 2 | 3;
  ouvert: boolean;
  onToggle: () => void;
  className?: string;
}

type OngletT3 = "schema" | "partie1" | "partie2";

const TITRE_T1 = "📚 Base de connaissance · Tâche ";

export default function BaseConnaissanceSidebar({ tache, ouvert, onToggle, className }: Props) {
  const [blocs, setBlocs] = useState<BlocConnaissance[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ongletT3, setOngletT3] = useState<OngletT3>("schema");

  useEffect(() => {
    let alive = true;
    setChargement(true);
    setErreur(null);
    fetch("/api/connaissance?tache=" + tache)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d && Array.isArray(d)) setBlocs(d as BlocConnaissance[]);
        else if (d?.erreur) setErreur(d.detail || d.erreur);
      })
      .catch((e) => alive && setErreur(String(e)))
      .finally(() => alive && setChargement(false));
    return () => { alive = false; };
  }, [tache]);

  const bySlug = (s: string) => blocs.find((b) => b.slug === s);

  const renduBloc = (b: BlocConnaissance | undefined, opts?: { rose?: boolean }) => {
    if (!b) return null;
    const estAvert = b.bloc_type === "avertissement" || b.slug === "t3-partie1-deux-opinions";
    const styleRose = estAvert || opts?.rose
      ? { background: "rgba(239,143,160,.11)", color: "#A83C14", border: "1px solid rgba(239,143,160,.28)", borderRadius: 10, padding: "10px 12px" }
      : { background: "var(--color-papier-2)", borderRadius: 10, padding: "10px 12px" };
    return (
      <div key={b.id} style={{ marginBottom: 12 }}>
      {b.titre && (
        <h4 style={{
          margin: "0 0 6px",
          fontSize: 14,
          fontWeight: 700,
          color: estAvert ? "#A83C14" : "var(--color-encre)",
          letterSpacing: "-.01em",
        }}>
          {estAvert ? "⚠️ " : ""}{b.titre}
        </h4>
      )}
      {b.description && (
        <p style={{ margin: "0 0 6px", color: "var(--color-encre-2)", fontSize: 13 }}>{b.description}</p>
      )}
      <div
        style={styleRose}
        dangerouslySetInnerHTML={{ __html: markdownLite(b.contenu_markdown) }}
      />
    </div>
    );
  };

  const contenuT1 = () => (
    <div>
      {renduBloc(bySlug("t1-objectif"))}
      {renduBloc(bySlug("t1-squelette-amical"))}
      {renduBloc(bySlug("t1-squelette-formel"))}
      {renduBloc(bySlug("t1-connecteurs-minimum"))}
      {renduBloc(bySlug("t1-exemples-salutations"))}
      {renduBloc(bySlug("t1-checklist-officielle"))}
    </div>
  );

  const contenuT3 = () => {
    if (ongletT3 === "schema")
      return (
        <div>
          {renduBloc(bySlug("t3-objectif"))}
          {renduBloc(bySlug("t3-schema-retenir"))}
          {renduBloc(bySlug("t3-connecteurs-6categories"))}
          {renduBloc(bySlug("t3-checklist-derniere-verification"))}
          <div style={{ marginTop: 10 }}>
            <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--color-encre)" }}>
              🧠 Connecteurs officiels (6 catégories × 3)
            </h4>
            <div style={{
              display: "grid", gap: 8, gridTemplateColumns: "1fr", fontSize: 13 }}>
              {Object.entries(CONNECTEURS_T3_GROUPE).map(([cat, trio]) => (
                <div key={cat} style={{ background: "var(--color-papier-2)", borderRadius: 8, padding: "8px 10px" }}>
                  <b style={{ color: "#B8770B" }}>{cat}</b>
                  <div style={{ marginTop: 4, fontFamily: "var(--font-mono)", color: "var(--color-encre)" }}>
                    {trio.join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    if (ongletT3 === "partie1")
      return (
        <div>
          {renduBloc(bySlug("t3-partie1-deux-opinions"), { rose: true })}
        </div>
      );
    return (
      <div>
        {renduBloc(bySlug("t3-partie2-mon-avis"))}
        {renduBloc(bySlug("t3-connecteurs-6categories"))}
      </div>
    );
  };

  return (
    <section
      className={className ? "carte " + className : "carte"}
      style={{
        background: "var(--color-papier)",
        color: "var(--color-encre)",
        border: "1px solid rgba(0,0,0,.06)",
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={ouvert}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "var(--color-papier-2)",
          border: "none",
          cursor: "pointer",
          fontSize: 15,
          fontWeight: 700,
          color: "var(--color-encre)",
          fontFamily: "inherit",
          borderRadius: 12,
        }}
      >
        <span>{TITRE_T1 + tache}</span>
        <span style={{ fontSize: 13, color: "var(--color-encre-2)" }}>
          {ouvert ? "▾ Masquer" : "▸ Afficher"}
        </span>
      </button>
      <div
        style={{
          overflow: "hidden",
          maxHeight: ouvert ? (tache === 3 ? 2200 : 1800) : 0,
          transition: "max-height 300ms ease",
        }}
      >
        <div style={{ padding: "14px 16px 18px", maxHeight: "70vh", overflowY: "auto" }}>
          {chargement && (
            <div style={{ padding: 16, textAlign: "center", color: "var(--color-encre-3)" }}>
              Chargement de la base de connaissance…
            </div>
          )}
          {!chargement && erreur && (
            <div style={{ padding: 12, background: "rgba(239,143,160,.1)", color: "#A83C14", borderRadius: 10 }}>
              {erreur}
            </div>
          )}
          {!chargement && !erreur && blocs.length === 0 && (
            <div style={{ padding: 14, textAlign: "center", color: "var(--color-encre-3)" }}>
              Aucun bloc disponible — appliquez les migrations 006/007 Supabase.
            </div>
          )}
          {!chargement && !erreur && blocs.length > 0 && (
            <>
              {tache === 3 && (
                <div role="tablist" className="onglets" style={{ marginBottom: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {([
                    ["schema", "📋 Schéma + Connecteurs"],
                    ["partie1", "🧭 Partie 1 · 2 opinions"],
                    ["partie2", "💬 Partie 2 · Ton opinion"],
                  ] as [OngletT3, string][]).map(([k, label]) => (
                    <button
                      key={k}
                      role="tab"
                      aria-selected={ongletT3 === k}
                      onClick={() => setOngletT3(k)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(0,0,0,.1)",
                        background: ongletT3 === k ? "var(--color-encre)" : "var(--color-papier-2)",
                        color: ongletT3 === k ? "var(--color-papier)" : "var(--color-encre)",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                {tache === 1 ? contenuT1() : tache === 3 ? contenuT3() : (
                  <p style={{ color: "var(--color-encre-2)" }}>
                    Aucune fiche spécifique pour la Tâche 2 — référez-vous aux consignes.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
