"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import NavLaterale from "@/components/NavLaterale";
import BaseConnaissanceSidebar from "@/components/expression-ecrite/BaseConnaissanceSidebar";

export default function PageExpressionOraleWrapper() {
  return (
    <Suspense fallback={null}>
      <PageExpressionOrale />
    </Suspense>
  );
}

function PageExpressionOrale() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [tache, setTache] = useState<2 | 3>(2);
  const [kbOuvert, setKbOuvert] = useState<boolean>(false);

  useEffect(() => {
    if (tabParam === "connaissance") setKbOuvert(true);
  }, [tabParam]);

  return (
    <div className="coquille">
      <NavLaterale routeActive="/expression-orale" />
      <main className="contenu-principal">
        <div className="grille">
          <div className="col-gauche">
            <section className="carte">
              <div className="entete-carte">
                <h2>🎙 Expression Orale · NCLC 8</h2>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--color-encre-3)",
                  }}
                >
                  Consultatif · Fiches & méthodes
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label="Sélection de la tâche"
                style={{
                  marginBottom: 16,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {([2, 3] as const).map((t) => {
                  const checked = tache === t;
                  return (
                    <label
                      key={t}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 14px",
                        borderRadius: 999,
                        border: "1px solid rgba(0,0,0,.1)",
                        background: checked
                          ? "var(--color-encre)"
                          : "var(--color-papier-2)",
                        color: checked
                          ? "var(--color-papier)"
                          : "var(--color-encre)",
                        fontSize: 13.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <input
                        type="radio"
                        name="tache-orale"
                        value={t}
                        checked={checked}
                        onChange={() => setTache(t)}
                        style={{ margin: 0, accentColor: "#fff" }}
                      />
                      Tâche {t}
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="carte" style={{ marginTop: 12 }}>
              <div className="entete-carte">
                <h3>🎯 Objectif général · Expression Orale</h3>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-encre)" }}>
                <p style={{ marginTop: 0 }}>
                  L'épreuve d'expression orale du TCF Canada évalue votre capacité à
                  <b> communiquer spontanément et de manière structurée</b> en français,
                  sur des sujets de la vie quotidienne, professionnelle ou sociétale.
                </p>
                <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
                  <li>Durée totale : <b>~12 minutes</b> (2 minutes de préparation Tâche 2)</li>
                  <li>Niveau cible : <b>NCLC 8</b> (autonomie complète + nuances)</li>
                  <li>Évalué sur : fluidité, prononciation, richesse lexicale, grammaire, réalisation de la tâche</li>
                </ul>
              </div>
            </section>

            <section className="carte" style={{ marginTop: 12 }}>
              <div className="entete-carte">
                <h3>📋 Tâche 1 · Interaction guidée</h3>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-encre-2)" }}>
                <p style={{ marginTop: 0 }}>
                  <b>Durée :</b> ~2 minutes · Sans préparation
                </p>
                <p style={{ margin: "6px 0" }}>
                  L'examinateur vous pose des questions sur vous, votre vie quotidienne,
                  vos habitudes, vos préférences. Répondez par des <b>phrases complètes</b>,
                  ajoutez 1 ou 2 détails personnels spontanés.
                </p>
              </div>
            </section>

            <section
              className="carte"
              style={{
                marginTop: 12,
                border: tache === 2 ? "1px solid rgba(60,207,145,.35)" : undefined,
                boxShadow: tache === 2 ? "0 0 0 3px rgba(60,207,145,.08)" : undefined,
              }}
            >
              <div className="entete-carte">
                <h3>🎬 Tâche 2 · Jeu de rôle (scénario)</h3>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-encre)" }}>
                <p style={{ marginTop: 0 }}>
                  <b>Durée :</b> ~5 minutes · 2 minutes de préparation
                </p>
                <p style={{ margin: "6px 0" }}>
                  Vous recevez une carte avec un <b>contexte, un rôle et un objectif</b>
                  (ex : se plaindre dans un magasin, réserver un hôtel, demander un
                  renseignement administratif). Utilisez les onglets « Scénarios » et
                  « Corrections » du panneau de droite pour vous entraîner.
                </p>
                <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
                  <li>Identifiez le <b>registre</b> (formel / informel)</li>
                  <li>Énoncez clairement votre but dès la première phrase</li>
                  <li>Utilisez des <b>marqueurs oraux</b> naturels (ben…, écoute…, bah…)</li>
                </ul>
              </div>
            </section>

            <section
              className="carte"
              style={{
                marginTop: 12,
                border: tache === 3 ? "1px solid rgba(60,207,145,.35)" : undefined,
                boxShadow: tache === 3 ? "0 0 0 3px rgba(60,207,145,.08)" : undefined,
              }}
            >
              <div className="entete-carte">
                <h3>💬 Tâche 3 · Prise de parole / Sujet</h3>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-encre)" }}>
                <p style={{ marginTop: 0 }}>
                  <b>Durée :</b> ~5 minutes · Sans préparation
                </p>
                <p style={{ margin: "6px 0" }}>
                  Vous tirez au sort un sujet de société (ex : « Faut-il manger
                  équilibré ? », « Le travail à distance est-il une bonne chose ? »).
                  Parlez <b>en continu</b>, structurez avec :
                </p>
                <ol style={{ paddingLeft: 20, margin: "8px 0" }}>
                  <li>Introduction + accroche (personnelle / contexte)</li>
                  <li>2 ou 3 <b>arguments</b> avec connecteurs + exemples concrets</li>
                  <li>Conclusion nuancée ou ouverture</li>
                </ol>
                <p style={{ margin: "8px 0 0", color: "var(--color-encre-2)" }}>
                  Voir l'onglet « Schéma + Exemple » à droite pour un modèle complet
                  sur le sujet « Manger équilibré ».
                </p>
              </div>
            </section>
          </div>

          <div className="col-droite">
            <BaseConnaissanceSidebar
              competence="EO"
              tache={tache}
              ouvert={kbOuvert}
              onToggle={() => setKbOuvert(!kbOuvert)}
              className="lg:!fixed lg:right-6 lg:top-24 lg:!bottom-6 lg:!w-[480px] z-40 shadow-2xl"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
