"use client";

import { useEffect, useState } from "react";
import { markdownLite } from "@/lib/utils/markdownLite";
import { CONNECTEURS_T3_GROUPE, CONNECTEURS_ORAUX_GROUPE } from "@/lib/heuristiques/taches";

type BlocConnaissance = {
  id: string;
  tache_num: 0 | 1 | 2 | 3;
  competence_code?: "EE" | "EO" | "CE" | "CO";
  slug: string;
  bloc_type: "objectif" | "squelette" | "connecteurs" | "checklist" | "exemple" | "avertissement";
  titre: string;
  description: string | null;
  contenu_markdown: string;
  ordre: number;
};

interface Props {
  tache: 0 | 1 | 2 | 3;
  ouvert: boolean;
  onToggle: () => void;
  className?: string;
  competence?: "EE" | "EO";
}

type OngletT3 = "schema" | "partie1" | "partie2";
type OngletEO2 = "scenarios" | "corrections";
type OngletEO3 = "sujets" | "schema";

const TITRE_T1 = "📚 Base de connaissance · Tâche ";

export default function BaseConnaissanceSidebar({
  tache,
  ouvert,
  onToggle,
  className,
  competence = "EE",
}: Props) {
  const [blocs, setBlocs] = useState<BlocConnaissance[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ongletT3, setOngletT3] = useState<OngletT3>("schema");
  const [ongletEO2, setOngletEO2] = useState<OngletEO2>("scenarios");
  const [ongletEO3, setOngletEO3] = useState<OngletEO3>("sujets");

  useEffect(() => {
    let alive = true;
    setChargement(true);
    setErreur(null);
    fetch(`/api/connaissance?competence=${competence}&tache=${tache}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d && Array.isArray(d)) setBlocs(d as BlocConnaissance[]);
        else if (d?.erreur) setErreur(d.detail || d.erreur);
      })
      .catch((e) => alive && setErreur(String(e)))
      .finally(() => alive && setChargement(false));
    return () => {
      alive = false;
    };
  }, [tache, competence]);

  const bySlug = (s: string) => blocs.find((b) => b.slug === s);
  const bySlugPrefix = (prefix: string) =>
    blocs.filter((b) => b.slug.startsWith(prefix)).sort((a, b) => a.ordre - b.ordre);

  const renduBloc = (b: BlocConnaissance | undefined, opts?: { rose?: boolean; vert?: boolean }) => {
    if (!b) return null;
    const estAvert = b.bloc_type === "avertissement" || b.slug === "t3-partie1-deux-opinions";
    let styleBloc: React.CSSProperties;
    if (opts?.vert) {
      styleBloc = {
        background: "rgba(60,207,145,.06)",
        border: "1px solid rgba(60,207,145,.2)",
        borderRadius: 10,
        padding: "10px 12px",
      };
    } else {
      const styleRose = estAvert || opts?.rose
        ? {
            background: "rgba(239,143,160,.11)",
            color: "#A83C14",
            border: "1px solid rgba(239,143,160,.28)",
            borderRadius: 10,
            padding: "10px 12px",
          }
        : { background: "var(--color-papier-2)", borderRadius: 10, padding: "10px 12px" };
      styleBloc = styleRose;
    }
    const couleurTitre = estAvert ? "#A83C14" : "var(--color-encre)";
    return (
      <div key={b.id} style={{ marginBottom: 12 }}>
        {b.titre && (
          <h4
            style={{
              margin: "0 0 6px",
              fontSize: 14,
              fontWeight: 700,
              color: couleurTitre,
              letterSpacing: "-.01em",
            }}
          >
            {estAvert ? "⚠️ " : ""}
            {b.titre}
          </h4>
        )}
        {b.description && (
          <p style={{ margin: "0 0 6px", color: "var(--color-encre-2)", fontSize: 13 }}>
            {b.description}
          </p>
        )}
        <div
          style={styleBloc}
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
            <h4
              style={{
                margin: "0 0 6px",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--color-encre)",
              }}
            >
              🧠 Connecteurs officiels (6 catégories × 3)
            </h4>
            <div
              style={{
                display: "grid",
                gap: 8,
                gridTemplateColumns: "1fr",
                fontSize: 13,
              }}
            >
              {Object.entries(CONNECTEURS_T3_GROUPE).map(([cat, trio]) => (
                <div
                  key={cat}
                  style={{
                    background: "var(--color-papier-2)",
                    borderRadius: 8,
                    padding: "8px 10px",
                  }}
                >
                  <b style={{ color: "#B8770B" }}>{cat}</b>
                  <div
                    style={{
                      marginTop: 4,
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-encre)",
                    }}
                  >
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

  const contenuEO2 = () => {
    if (ongletEO2 === "scenarios") {
      const scenarios = bySlugPrefix("eo-t2-scenario-");
      return (
        <div>
          {renduBloc(bySlug("eo-t2-schema"))}
          {scenarios.map((s) => renduBloc(s, { vert: true }))}
        </div>
      );
    }
    const corrections = bySlugPrefix("eo-t2-corrections-");
    return (
      <div>
        {renduBloc(bySlug("eo-objectif"))}
        {renduBloc(bySlug("eo-t2-schema"))}
        {corrections.map((c) => renduBloc(c))}
      </div>
    );
  };

  const contenuEO3 = () => {
    if (ongletEO3 === "sujets") {
      const sujets = bySlugPrefix("eo-t3-sujet-");
      return (
        <div>
          {renduBloc(bySlug("eo-t3-objectif-schema"))}
          {sujets.map((s) => renduBloc(s))}
        </div>
      );
    }
    return (
      <div>
        {renduBloc(bySlug("eo-t3-objectif-schema"))}
        <div style={{ maxHeight: 320, overflowY: "auto", marginBottom: 12 }}>
          {renduBloc(bySlug("eo-t3-sujet-manger-equilibre"))}
        </div>
        <div style={{ marginTop: 10 }}>
          <h4
            style={{
              margin: "0 0 6px",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--color-encre)",
            }}
          >
            🎙 Connecteurs oraux + marqueurs d'hésitation
          </h4>
          <div
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: "1fr",
              fontSize: 13,
            }}
          >
            {Object.entries(CONNECTEURS_ORAUX_GROUPE).map(([cat, liste]) => (
              <div
                key={cat}
                style={{
                  background: "var(--color-papier-2)",
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              >
                <b style={{ color: "#0B8043" }}>{cat}</b>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-encre)",
                  }}
                >
                  {liste.join(" · ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const estEE = competence === "EE";
  const titreHeader = estEE ? TITRE_T1 + tache : `🎙 Fiches · Expression Orale · Tâche ${tache}`;
  const maxHeightOuvert = estEE
    ? tache === 3
      ? 2200
      : 1800
    : 2600;

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
        <span>{titreHeader}</span>
        <span style={{ fontSize: 13, color: "var(--color-encre-2)" }}>
          {ouvert ? "▾ Masquer" : "▸ Afficher"}
        </span>
      </button>
      <div
        style={{
          overflow: "hidden",
          maxHeight: ouvert ? maxHeightOuvert : 0,
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
            <div
              style={{
                padding: 12,
                background: "rgba(239,143,160,.1)",
                color: "#A83C14",
                borderRadius: 10,
              }}
            >
              {erreur}
            </div>
          )}
          {!chargement && !erreur && blocs.length === 0 && (
            <div style={{ padding: 14, textAlign: "center", color: "var(--color-encre-3)" }}>
              Aucun bloc disponible — appliquez les migrations Supabase.
            </div>
          )}
          {!chargement && !erreur && blocs.length > 0 && (
            <>
              {estEE && tache === 3 && (
                <div
                  role="tablist"
                  className="onglets"
                  style={{ marginBottom: 14, display: "flex", gap: 6, flexWrap: "wrap" }}
                >
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
                        background:
                          ongletT3 === k ? "var(--color-encre)" : "var(--color-papier-2)",
                        color:
                          ongletT3 === k ? "var(--color-papier)" : "var(--color-encre)",
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
              {!estEE && tache === 2 && (
                <div
                  role="tablist"
                  className="onglets"
                  style={{ marginBottom: 14, display: "flex", gap: 6, flexWrap: "wrap" }}
                >
                  {([
                    ["scenarios", "🎬 Scénarios (7)"],
                    ["corrections", "✅ Corrections (20)"],
                  ] as [OngletEO2, string][]).map(([k, label]) => (
                    <button
                      key={k}
                      role="tab"
                      aria-selected={ongletEO2 === k}
                      onClick={() => setOngletEO2(k)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(0,0,0,.1)",
                        background:
                          ongletEO2 === k ? "var(--color-encre)" : "var(--color-papier-2)",
                        color:
                          ongletEO2 === k ? "var(--color-papier)" : "var(--color-encre)",
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
              {!estEE && tache === 3 && (
                <div
                  role="tablist"
                  className="onglets"
                  style={{ marginBottom: 14, display: "flex", gap: 6, flexWrap: "wrap" }}
                >
                  {([
                    ["sujets", "💬 Sujets (8)"],
                    ["schema", "📋 Schéma + Exemple"],
                  ] as [OngletEO3, string][]).map(([k, label]) => (
                    <button
                      key={k}
                      role="tab"
                      aria-selected={ongletEO3 === k}
                      onClick={() => setOngletEO3(k)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(0,0,0,.1)",
                        background:
                          ongletEO3 === k ? "var(--color-encre)" : "var(--color-papier-2)",
                        color:
                          ongletEO3 === k ? "var(--color-papier)" : "var(--color-encre)",
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
                {estEE ? (
                  tache === 1 ? (
                    contenuT1()
                  ) : tache === 3 ? (
                    contenuT3()
                  ) : (
                    <p style={{ color: "var(--color-encre-2)" }}>
                      Aucune fiche spécifique pour la Tâche 2 — référez-vous aux consignes.
                    </p>
                  )
                ) : (
                  tache === 2 ? (
                    contenuEO2()
                  ) : tache === 3 ? (
                    contenuEO3()
                  ) : (
                    <p style={{ color: "var(--color-encre-2)" }}>
                      Aucune fiche spécifique pour cette tâche.
                    </p>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
