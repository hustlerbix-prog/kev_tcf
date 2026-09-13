"use client";

import Link from "next/link";
import NavLaterale from "@/components/NavLaterale";
import { CREDENTIAL_COSTS } from "@/lib/types/eo";

interface TaskCardDef {
  id: number;
  titre: string;
  sousTitre: string;
  duree: string;
  detail: string;
  icon: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

const TACHES: TaskCardDef[] = [
  {
    id: 1,
    titre: "T1 · Description d'image",
    sousTitre: "Expression libre · Présentation",
    duree: "2:00",
    detail: "Chronométré · Sans préparation",
    icon: "🖼️",
    accentColor: "#28569E",
    accentBg: "rgba(40, 86, 158, 0.10)",
    accentBorder: "rgba(40, 86, 158, 0.20)",
  },
  {
    id: 2,
    titre: "T2 · Jeu de rôle",
    sousTitre: "Interaction · Négociation",
    duree: "5:30",
    detail: "Préparation 2:00 + Dialogue 3:30",
    icon: "🎭",
    accentColor: "#256F51",
    accentBg: "rgba(37, 111, 81, 0.10)",
    accentBorder: "rgba(37, 111, 81, 0.20)",
  },
  {
    id: 3,
    titre: "T3 · Exposé-débat",
    sousTitre: "Argumentation · Prise de position",
    duree: "4:30",
    detail: "Plan 4 temps · Pour / Contre",
    icon: "🎤",
    accentColor: "#B55E28",
    accentBg: "rgba(181, 94, 40, 0.10)",
    accentBorder: "rgba(181, 94, 40, 0.20)",
  },
];

export default function PageExamConfirm() {
  return (
    <div className="coquille">
      <NavLaterale routeActive="/expression-orale" />
      <main
        className="contenu-principal"
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: 32,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 880,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 30,
                fontWeight: 700,
                margin: 0,
                color: "var(--color-papier)",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              ⚙ Simulation complète 12 minutes
            </h1>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 16,
                fontWeight: 600,
                color: "#FBBF24",
              }}
            >
              3 Tâches enchaînées SANS PAUSE
            </div>
          </div>

          <div
            style={{
              padding: "18px 22px",
              borderRadius: 14,
              background: "#FEF3C7",
              border: "1px solid #F59E0B",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 26, lineHeight: 1 }}>⚠️</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#92400E",
                }}
              >
                Session non pausable
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: "#78350F",
                  display: "flex",
                  gap: 18,
                  flexWrap: "wrap",
                }}
              >
                <span>
                  <b>Durée totale :</b> ~14 min
                </span>
                <span>
                  <b>Crédits :</b> {CREDENTIAL_COSTS.full_exam} crédits
                </span>
                <span>
                  <b>Tâches :</b> T1 → T2 → T3
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TACHES.map((t) => (
              <div
                key={t.id}
                style={{
                  background: "var(--color-papier)",
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.20)",
                  display: "flex",
                  gap: 18,
                  alignItems: "stretch",
                  flexDirection: "column",
                }}
                className="sm:flex-row"
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 14,
                    background: t.accentBg,
                    border: `1px solid ${t.accentBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 30,
                    flexShrink: 0,
                  }}
                >
                  {t.icon}
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    color: "var(--color-encre)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 18,
                        fontWeight: 700,
                        color: t.accentColor,
                      }}
                    >
                      {t.titre}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 14,
                        fontWeight: 700,
                        padding: "5px 12px",
                        borderRadius: 999,
                        background: t.accentBg,
                        color: t.accentColor,
                        border: `1px solid ${t.accentBorder}`,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {t.duree}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "var(--color-encre-2)",
                      fontWeight: 500,
                    }}
                  >
                    {t.sousTitre}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--color-encre-3)",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {t.detail}
                  </div>
                </div>

                <div
                  style={{
                    width: 2,
                    minHeight: 40,
                    alignSelf: "stretch",
                    background: `linear-gradient(180deg, ${t.accentColor}33 0%, ${t.accentColor}05 100%)`,
                    borderRadius: 999,
                    display: "none",
                  }}
                  className="sm:block"
                />
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "20px 24px",
              background: "var(--color-bureau-2)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-encre-3)",
                  fontWeight: 600,
                }}
              >
                Coût total
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#FBBF24",
                  lineHeight: 1.1,
                }}
              >
                {CREDENTIAL_COSTS.full_exam} crédits
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                href="/expression-orale"
                style={{
                  padding: "14px 26px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--color-papier)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14.5,
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              >
                Annuler
              </Link>
              <Link
                href="/expression-orale/FULL-EXAM/session?mode=full_exam"
                style={{
                  padding: "14px 28px",
                  borderRadius: 12,
                  background: "#10B981",
                  color: "var(--color-papier)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  cursor: "pointer",
                  border: "1px solid rgba(6, 95, 70, 0.5)",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.28)",
                  transition: "all 0.15s",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#059669";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 26px rgba(16, 185, 129, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#10B981";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(16, 185, 129, 0.28)";
                }}
              >
                Commencer la simulation complète →
              </Link>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "4px 0 20px",
            }}
          >
            <Link
              href="/expression-orale"
              style={{
                fontSize: 13,
                color: "var(--color-encre-3)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              ← Retour au catalogue Expression Orale
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
