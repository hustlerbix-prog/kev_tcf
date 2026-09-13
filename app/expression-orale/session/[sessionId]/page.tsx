"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import NavLaterale from "@/components/NavLaterale";
import CanvasRadar from "@/lib/eo/canvasRadar";
import {
  type CriterionId,
  type EoEvaluation,
  type EoSession,
  type ErreurEO,
  LEVELS,
  CRITERION_WEIGHTS,
  TASK_WEIGHTS,
} from "@/lib/types/eo";

const CRIT_LABELS: Record<CriterionId, string> = {
  P1: "Adéquation au rôle / à la situation",
  P2: "Pertinence et richesse du contenu",
  P3: "Cohérence / Structure logique",
  L1: "Correction grammaticale",
  L2: "Richesse du vocabulaire",
  L3: "Maîtrise phonique / Intonation",
  S1: "Intéraction / Écoute active",
};

function buildMockEvaluation(): EoEvaluation {
  const criteriaAtLevel = (level: number) => {
    const out = {} as Record<CriterionId, { score: number; level: typeof LEVELS[number]; evidence: string; comment: string }>;
    const ids: CriterionId[] = ["P1", "P2", "P3", "L1", "L2", "L3", "S1"];
    const levelMapIdx = Math.max(0, Math.min(6, Math.round(level)));
    const cefr = LEVELS[levelMapIdx];
    ids.forEach((c) => {
      out[c] = {
        score: level + (Math.random() - 0.5) * 0.4,
        level: cefr,
        evidence: "« Je pense que c'est important pour notre société aujourd'hui. »",
        comment: "Bon niveau général, légère amélioration possible sur la structure.",
      };
    });
    return out;
  };

  const errors: ErreurEO[] = [
    { type: "grammaire", heard: "je suis allé au parc avec mon ami", correction: "je suis allé au parc avec mon ami (accord OK — exemple d'erreur : j'ai mangés)", rule: "Accord du participe passé avec avoir", es: "ej fui al parque con mi amigo", cost: "L1", priority: 2 },
    { type: "lexique", heard: "cette chose est bien", correction: "cette mesure est pertinente", rule: "Éviter le mot générique « chose »", es: "esta cosa está bien", cost: "L2", priority: 1 },
    { type: "structure", heard: "parce que il faut", correction: "car il faut / parce qu'il faut", rule: "Élision devant une voyelle", es: "porque es necesario", cost: "P3", priority: 2 },
  ];

  const tasks = [1, 2, 3].map((t) => {
    const criteria = criteriaAtLevel(4);
    const weights = CRITERION_WEIGHTS[t as 1 | 2 | 3];
    let taskLevel = 0;
    (Object.keys(weights) as CriterionId[]).forEach((k) => {
      taskLevel += (criteria[k]?.score ?? 0) * weights[k];
    });
    return {
      task: t as 1 | 2 | 3,
      criteria,
      taskLevel: Math.max(0, Math.min(6, taskLevel)),
      penalties: [] as string[],
      errors,
      upgrades: [
        { said: "Je pense que c'est bon.", b2: "Je suis convaincu(e) que cette mesure s'avère bénéfique à long terme.", why: "Vocabulaire plus précis, marqueur d'opération argumentatif." },
        { said: "Et puis, ça marche pas.", b2: "En outre, cette solution ne parvient pas à résoudre le problème dans sa globalité.", why: "Connecteur logique + tournure impersonnelle B2." },
        { said: "C'est très important pour tout le monde.", b2: "Cela revêt une importance capitale pour l'ensemble de la collectivité.", why: "Registre soutenu + champ lexical B2." },
        { said: "Je vais vous dire trois points.", b2: "Mon propos s'articulera autour de trois axes complémentaires.", why: "Annonce de plan structurée, niveau B2." },
      ],
    };
  });

  let levelScore = 0;
  tasks.forEach((t) => {
    levelScore += t.taskLevel * TASK_WEIGHTS[t.task];
  });
  levelScore = Math.max(0, Math.min(6, levelScore));
  const note20 = 11;
  const cefr = "B2";
  const nclc = "7";
  const target = 11.5;
  const targetMet = note20 >= target;
  const manque = Math.max(0, target - note20);
  const gapToTarget = targetMet
    ? "Objectif atteint, bravo !"
    : `Il manque ${manque.toFixed(1)} points pour B2 (≥11.5).`;

  return {
    tasks,
    global: {
      levelScore,
      note20,
      cefr,
      nclc,
      targetMet,
      gapToTarget,
    },
    synthesis: {
      strengths: [
        "Adéquation au rôle : vous respectez la situation imposée.",
        "Cohérence (P3) : progression logique des idées.",
        "Interaction (S1) : écoute active et réponses ajustées.",
      ],
      topThreeFixes: [
        { what: "Richesse du vocabulaire (L2)", why: "Trop de mots génériques (bien, chose, faire).", drill: "Repérer 3 mots génériques et les remplacer par 3 synonymes précis." },
        { what: "Correction grammaticale (L1)", why: "Accord du participe passé, élision devant voyelle.", drill: "Drill 10 phrases niveau B2 : accord du participe passé, subjonctif." },
        { what: "Structure logique (P3)", why: "Annonce de plan et connecteurs de transition.", drill: "Utiliser Intro → 2 arguments → Conclusion + 3 connecteurs (d'abord, ensuite, enfin)." },
      ],
      nextSession: {
        recommendedTask: 2 as const,
        recommendedCategory: "Interaction spontanée",
        reason: "Cette tâche a obtenu le niveau le plus bas. Travailler la spontanéité.",
      },
    },
  };
}

const MOCK_SESSION: EoSession & { id: string; started_at: string } = {
  id: "mock-session",
  user_id: "anon",
  mode: "full_exam",
  started_at: new Date().toISOString(),
  ended_at: new Date().toISOString(),
  credits_spent: 6,
  incomplete: false,
  target_note_20: 10,
  evaluation: buildMockEvaluation(),
  tasks: [
    {
      id: "t1",
      task: 1,
      archetype_id: "T1-IDE-01",
      overtime_seconds: 0,
      turns: [
        { id: "e1", role: "examiner", text: "Bonjour, vous êtes candidat(e) au TCF Canada. Nous allons commencer par la première tâche : une interaction guidée. Vous êtes touriste à Québec et vous demandez votre chemin à un habitant.", start_ms: 0, end_ms: 8000 },
        { id: "c1", role: "candidate", text: "Bonjour monsieur, excusez-moi de vous déranger. Je cherche le château Frontenac, s'il vous plaît. Je pense que c'est dans le centre-ville mais je ne suis pas sûr.", start_ms: 9000, end_ms: 22000 },
        { id: "e2", role: "examiner", text: "Très bien. Le château est en haut de la colline, à 10 minutes à pied. Continuez tout droit puis tournez à gauche.", start_ms: 23000, end_ms: 32000 },
        { id: "c2", role: "candidate", text: "D'accord merci beaucoup ! Est-ce qu'il y a aussi un bon café pas loin ? Je voudrais manger quelque chose après.", start_ms: 33000, end_ms: 48000 },
      ],
    },
    {
      id: "t2",
      task: 2,
      archetype_id: "T2-IDE-01",
      overtime_seconds: 0,
      turns: [
        { id: "e3", role: "examiner", text: "Passons maintenant à la deuxième tâche. Vous êtes employé(e) d'un magasin de vêtements. Je suis client(e), je cherche un cadeau d'anniversaire pour ma nièce de 16 ans.", start_ms: 60000, end_ms: 72000 },
        { id: "c3", role: "candidate", text: "Bonjour, bienvenue ! C'est pour une nièce de 16 ans ? À quel style est-ce qu'elle aime ? Plutôt sportif, classique ou plus branché ? Je pense que nous avons plusieurs choses qui pourraient lui plaire.", start_ms: 73000, end_ms: 120000 },
      ],
    },
    {
      id: "t3",
      task: 3,
      archetype_id: "T3-IDE-01",
      overtime_seconds: 0,
      turns: [
        { id: "e4", role: "examiner", text: "Dernière tâche : monologue argumenté. Devriez-vous apprendre une deuxième langue étrangère ? Vous avez 2 minutes pour vous préparer, puis 4 minutes pour parler. Allez !", start_ms: 180000, end_ms: 195000 },
        { id: "c4", role: "candidate", text: "Je vais vous dire trois points sur l'apprentissage d'une langue étrangère. D'abord, c'est bon pour le cerveau. Ensuite, ça permet de voyager. Et enfin, ça aide à trouver du travail. Je pense que c'est très important pour tout le monde. Parce que dans notre société d'aujourd'hui, c'est essentiel.", start_ms: 315000, end_ms: 430000 },
      ],
    },
  ],
};

function colorForCefr(cefr: string): string {
  if (cefr.startsWith("C")) return "#0D9488";
  if (cefr.startsWith("B2")) return "#10B981";
  if (cefr.startsWith("B1")) return "#F59E0B";
  if (cefr.startsWith("A")) return "#EF4444";
  return "#6B7280";
}

function highlightTurnText(text: string, errors: ErreurEO[]): React.ReactNode {
  if (!errors.length) return text;
  const heardList = errors.map((e) => e.heard).filter((h) => h && h.length > 3);
  if (!heardList.length) return text;
  const tokens: (string | { type: "err"; content: string; i: number })[] = [];
  let remaining = text;
  let safety = 0;
  while (remaining.length && safety < 50) {
    safety++;
    let bestIdx = -1;
    let bestLen = 0;
    heardList.forEach((h) => {
      const idx = remaining.toLowerCase().indexOf(h.toLowerCase());
      if (idx >= 0 && (bestIdx < 0 || idx < bestIdx || (idx === bestIdx && h.length > bestLen))) {
        bestIdx = idx;
        bestLen = h.length;
      }
    });
    if (bestIdx < 0) {
      tokens.push(remaining);
      break;
    }
    if (bestIdx > 0) tokens.push(remaining.slice(0, bestIdx));
    const errContent = remaining.slice(bestIdx, bestIdx + bestLen);
    tokens.push({ type: "err", content: errContent, i: tokens.length });
    remaining = remaining.slice(bestIdx + bestLen);
  }
  if (remaining.length) tokens.push(remaining);
  return tokens.map((t, i) =>
    typeof t === "string" ? (
      <span key={i}>{t}</span>
    ) : (
      <mark
        key={i}
        style={{
          background: "rgba(190, 47, 70, 0.12)",
          color: "inherit",
          borderBottom: "1.5px solid #BE2F46",
          padding: "0 2px",
          borderRadius: 2,
        }}
        title={errors.find((e) => e.heard.toLowerCase() === t.content.toLowerCase())?.correction}
      >
        {t.content}
      </mark>
    )
  );
}

export default function PageRapportSession() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<(EoSession & { id: string; started_at: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(10);
  const [tabTask, setTabTask] = useState<1 | 2 | 3>(1);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [showEs, setShowEs] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchSession() {
      try {
        const res = await fetch(`/api/eo/sessions/${sessionId}`);
        if (!res.ok) {
          if (!cancelled) {
            setSession(MOCK_SESSION);
            setLoading(false);
          }
          return;
        }
        const d = await res.json();
        if (!cancelled) {
          if (d?.session && d.session.evaluation) {
            setSession({
              ...d.session,
              started_at: d.session.started_at ?? new Date().toISOString(),
            });
          } else {
            setSession(MOCK_SESSION);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setSession(MOCK_SESSION);
          setLoading(false);
        }
      }
    }
    fetchSession();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const evaluation = (session?.evaluation as EoEvaluation | null) ?? buildMockEvaluation();

  const globalScores = useMemo<Record<CriterionId, number>>(() => {
    const acc: Record<CriterionId, { sum: number; n: number }> = {
      P1: { sum: 0, n: 0 },
      P2: { sum: 0, n: 0 },
      P3: { sum: 0, n: 0 },
      L1: { sum: 0, n: 0 },
      L2: { sum: 0, n: 0 },
      L3: { sum: 0, n: 0 },
      S1: { sum: 0, n: 0 },
    };
    evaluation.tasks.forEach((t) => {
      (Object.keys(t.criteria) as CriterionId[]).forEach((k) => {
        acc[k].sum += t.criteria[k].score * TASK_WEIGHTS[t.task];
        acc[k].n += TASK_WEIGHTS[t.task];
      });
    });
    const out = {} as Record<CriterionId, number>;
    (Object.keys(acc) as CriterionId[]).forEach((k) => {
      out[k] = acc[k].n > 0 ? acc[k].sum / acc[k].n : 0;
    });
    return out;
  }, [evaluation]);

  if (loading || !session) {
    return (
      <div className="coquille">
        <NavLaterale routeActive="/expression-orale/session" />
        <main className="contenu-principal">
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--color-encre-3)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
            }}
          >
            Chargement du rapport…
          </div>
        </main>
      </div>
    );
  }

  const g = evaluation.global;
  const syn = evaluation.synthesis;
  const targetMet = g.note20 >= target;
  const progressPct = Math.max(0, Math.min(100, (g.note20 / Math.max(1, 20)) * 100));
  const targetPct = Math.max(0, Math.min(100, (target / 20) * 100));
  const manque = Math.max(0, target - g.note20);
  const task = evaluation.tasks.find((t) => t.task === tabTask) ?? evaluation.tasks[0];
  const taskRun = session.tasks.find((tr) => tr.task === tabTask);

  return (
    <div className="coquille">
      <NavLaterale routeActive="/expression-orale/session" />
      <main
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          padding: "22px 16px 80px",
        }}
      >
        <div className="max-w-7xl mx-auto px-4" style={{ color: "var(--color-papier)" }}>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 26,
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              🎙 Rapport d&apos;évaluation · session {sessionId}
            </h1>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                href="/expression-orale/historique"
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--color-papier)",
                  textDecoration: "none",
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                ← Historique
              </Link>
              <Link
                href="/expression-orale"
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  background: "rgba(16, 185, 129, 0.12)",
                  color: "#6FD3A9",
                  textDecoration: "none",
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                Refaire une session
              </Link>
            </div>
          </header>

          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              borderTop: "3px solid #F59E0B",
              background: "rgba(245, 158, 11, 0.08)",
              color: "#F5DEB3",
              fontSize: 13.5,
              marginBottom: 24,
            }}
          >
            ⚠ Estimation pédagogique non-officielle · score IRCC réel basé sur bandes de compétence, pas sur note numérique exacte.
          </div>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr)",
              gap: 20,
              marginBottom: 28,
            }}
            className="md:grid-cols-3 grid-cols-1"
          >
            <div
              style={{
                background: "var(--color-papier)",
                color: "var(--color-encre)",
                borderRadius: 16,
                padding: "20px 22px",
                boxShadow: "0 18px 44px rgba(0,0,0,0.34)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--color-encre-3)",
                  marginBottom: 6,
                }}
              >
                Note globale
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: "6rem",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    color: targetMet ? "#10B981" : "var(--color-encre)",
                  }}
                >
                  {g.note20}
                  <span style={{ fontSize: "2.4rem", color: "var(--color-encre-3)" }}>/20</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(37, 111, 81, 0.12)",
                      color: "#256F51",
                      fontWeight: 700,
                      fontSize: 13,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    NCLC {g.nclc}
                  </span>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: colorForCefr(g.cefr) + "22",
                      color: colorForCefr(g.cefr),
                      fontWeight: 700,
                      fontSize: 13,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {g.cefr}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: 14, fontSize: 13.5, color: "var(--color-encre-2)" }}>
                {manque > 0
                  ? `Il manque ${manque.toFixed(1)} point${manque > 1 ? "s" : ""} pour B2 (≥11.5).`
                  : "✅ Seuil B2 atteint sur cette évaluation."}
              </div>
            </div>

            <div
              style={{
                background: "var(--color-papier)",
                color: "var(--color-encre)",
                borderRadius: 16,
                padding: "20px 22px",
                boxShadow: "0 18px 44px rgba(0,0,0,0.34)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--color-encre-3)",
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Objectif visé
                <span style={{ fontSize: 14 }}>
                  {targetMet ? "✔" : "✘"}
                </span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      color: targetMet ? "#10B981" : "#BE2F46",
                      fontSize: 20,
                    }}
                  >
                    {g.note20}/20
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--color-encre-3)",
                    }}
                  >
                    cible {target}/20
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  style={{ width: "100%", accentColor: targetMet ? "#10B981" : "#BE2F46" }}
                />
              </div>
              <div style={{ position: "relative", height: 12, background: "rgba(0,0,0,0.08)", borderRadius: 999, overflow: "hidden" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: "0 auto 0 0",
                    width: progressPct + "%",
                    background: targetMet ? "#10B981" : "#F59E0B",
                    borderRadius: 999,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: -2,
                    bottom: -2,
                    left: targetPct + "%",
                    width: 2,
                    background: "#111827",
                  }}
                />
              </div>
              <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--color-encre-3)" }}>
                {targetMet
                  ? `Vous avez atteint votre objectif de ${target}/20.`
                  : `Objectif ${target}/20 non atteint — ${manque.toFixed(1)} point${manque > 1 ? "s" : ""} d'écart.`}
              </div>
            </div>

            <div
              style={{
                background: "var(--color-papier)",
                color: "var(--color-encre)",
                borderRadius: 16,
                padding: "20px 22px",
                boxShadow: "0 18px 44px rgba(0,0,0,0.34)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--color-encre-3)",
                  marginBottom: 12,
                }}
              >
                Synthèse
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "var(--color-encre-3)", marginBottom: 4, fontFamily: "var(--font-mono)" }}>POINTS FORTS</div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                  {syn.strengths.filter((s) => s.length > 0).slice(0, 3).map((s, i) => (
                    <li key={i} style={{ fontSize: 13.5, color: "var(--color-encre)", lineHeight: 1.5 }}>
                      <span style={{ color: "#10B981", fontWeight: 700, marginRight: 4 }}>●</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--color-encre-3)", marginBottom: 4, fontFamily: "var(--font-mono)" }}>AXES PRIORITAIRES</div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                  {syn.topThreeFixes.slice(0, 3).map((f, i) => (
                    <li key={i} style={{ fontSize: 13.5, color: "var(--color-encre)", lineHeight: 1.5 }}>
                      <span style={{ color: "#BE2F46", fontWeight: 700, marginRight: 4 }}>●</span>
                      {f.what}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section
            style={{
              background: "var(--color-papier)",
              color: "var(--color-encre)",
              borderRadius: 16,
              padding: "24px 26px",
              boxShadow: "0 18px 44px rgba(0,0,0,0.34)",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-encre-3)",
                marginBottom: 14,
              }}
            >
              Radar · 7 critères pondérés (T1×0.25 · T2×0.35 · T3×0.40)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)", gap: 24, alignItems: "center" }} className="md:grid-cols-2 grid-cols-1">
              <CanvasRadar scores={globalScores} max={6} size={420} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(Object.keys(CRIT_LABELS) as CriterionId[]).map((cid) => {
                  const score = globalScores[cid] ?? 0;
                  const pct = Math.max(0, Math.min(100, (score / 6) * 100));
                  const color = score >= 4 ? "#10B981" : score >= 3 ? "#F59E0B" : "#BE2F46";
                  return (
                    <div key={cid} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 110, flex: "0 0 110", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--color-encre-2)", fontWeight: 600 }}>{cid}</div>
                      <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden", position: "relative" }}>
                        <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 999 }} />
                        <div style={{ position: "absolute", inset: "0 auto 0 0", left: (4 / 6) * 100 + "%", width: 1, background: "#10B98180" }} />
                      </div>
                      <div style={{ width: 52, textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 700, color, fontSize: 12 }}>
                        {score.toFixed(1)}/6
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section
            style={{
              background: "var(--color-papier)",
              color: "var(--color-encre)",
              borderRadius: 16,
              padding: "24px 26px",
              boxShadow: "0 18px 44px rgba(0,0,0,0.34)",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-encre-3)",
                marginBottom: 14,
              }}
            >
              Détail par tâche
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {([1, 2, 3] as const).map((t) => {
                const active = tabTask === t;
                const labels: Record<1 | 2 | 3, string> = { 1: "T1 · Interaction guidée", 2: "T2 · Interaction spontanée", 3: "T3 · Monologue argumenté" };
                return (
                  <button
                    key={t}
                    onClick={() => setTabTask(t)}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 10,
                      border: active ? "1px solid #28569E" : "1px solid rgba(0,0,0,0.1)",
                      background: active ? "rgba(40, 86, 158, 0.10)" : "transparent",
                      color: active ? "#28569E" : "var(--color-encre-2)",
                      fontWeight: active ? 700 : 500,
                      fontSize: 13,
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>

            {task && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginBottom: 18 }} className="md:grid-cols-2 grid-cols-1">
                  {(Object.keys(CRIT_LABELS) as CriterionId[]).map((cid) => {
                    const cs = task.criteria[cid];
                    const pct = Math.max(0, Math.min(100, ((cs?.score ?? 0) / 6) * 100));
                    const color = (cs?.score ?? 0) >= 4 ? "#10B981" : (cs?.score ?? 0) >= 3 ? "#F59E0B" : "#BE2F46";
                    return (
                      <div
                        key={cid}
                        style={{
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: 12,
                          padding: "12px 14px",
                          background: "rgba(255,255,255,0.4)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-encre)", lineHeight: 1.3 }}>
                            <span style={{ fontFamily: "var(--font-mono)", marginRight: 6, color: "var(--color-encre-3)" }}>{cid}</span>
                            {CRIT_LABELS[cid]}
                          </div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontWeight: 700,
                                color,
                                fontSize: 14,
                              }}
                            >
                              {(cs?.score ?? 0).toFixed(1)}
                            </span>
                            <span
                              style={{
                                padding: "2px 6px",
                                borderRadius: 4,
                                fontSize: 10,
                                fontFamily: "var(--font-mono)",
                                background: color + "22",
                                color,
                              }}
                            >
                              {cs?.level ?? "—"}
                            </span>
                          </div>
                        </div>
                        <div style={{ height: 4, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 6 }}>
                          <div style={{ width: pct + "%", height: "100%", background: color }} />
                        </div>
                        {cs?.evidence && (
                          <div style={{ fontSize: 11.5, color: "var(--color-encre-2)", fontStyle: "italic", marginBottom: 3 }}>
                            {cs.evidence}
                          </div>
                        )}
                        {cs?.comment && (
                          <div style={{ fontSize: 11.5, color: "var(--color-encre-3)", lineHeight: 1.4 }}>
                            {cs.comment.slice(0, 220)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {task.errors?.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10.5,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "var(--color-encre-3)",
                        marginBottom: 10,
                      }}
                    >
                      Erreurs principales (top {Math.min(8, task.errors.length)})
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                        <thead>
                          <tr style={{ background: "rgba(0,0,0,0.04)" }}>
                            {["#", "Type", "Entendu", "Correction", "Règle"].map((h, i) => (
                              <th key={i} style={{ textAlign: "left", padding: "8px 10px", fontWeight: 600, color: "var(--color-encre-2)", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                                {h}
                              </th>
                            ))}
                            {task.errors.some((e) => e.es) && (
                              <th style={{ textAlign: "right", padding: "8px 10px", fontWeight: 600, color: "var(--color-encre-2)", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                                <button onClick={() => setShowEs((v) => !v)} style={{ background: "transparent", border: "none", color: showEs ? "#256F51" : "var(--color-encre-3)", fontWeight: 600, cursor: "pointer" }}>
                                  {showEs ? "🇫🇷 FR" : "🇪🇸 ES"}
                                </button>
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {task.errors.slice(0, 8).map((err, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                              <td style={{ padding: "8px 10px", fontFamily: "var(--font-mono)", color: "var(--color-encre-3)", fontSize: 11 }}>{i + 1}</td>
                              <td style={{ padding: "8px 10px" }}>
                                <span
                                  style={{
                                    padding: "2px 7px",
                                    borderRadius: 6,
                                    fontSize: 10.5,
                                    fontFamily: "var(--font-mono)",
                                    background: err.type === "grammaire" ? "#E0F2FE" : err.type === "lexique" ? "#FEF3C7" : err.type === "structure" ? "#FEE2E2" : err.type === "registre" ? "#E9D5FF" : "#DCFCE7",
                                    color: err.type === "grammaire" ? "#075985" : err.type === "lexique" ? "#92400E" : err.type === "structure" ? "#991B1B" : err.type === "registre" ? "#581C87" : "#14532D",
                                    fontWeight: 600,
                                  }}
                                >
                                  {err.type}
                                </span>
                              </td>
                              <td style={{ padding: "8px 10px", color: "#BE2F46", fontFamily: "var(--font-serif)", fontSize: 13 }}>{showEs && err.es ? err.es : err.heard}</td>
                              <td style={{ padding: "8px 10px", color: "#10B981", fontFamily: "var(--font-serif)", fontSize: 13 }}>{err.correction}</td>
                              <td style={{ padding: "8px 10px", fontSize: 12, color: "var(--color-encre-2)", lineHeight: 1.45 }}>{err.rule}</td>
                              {task.errors.some((e) => e.es) && <td />}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {task.upgrades?.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10.5,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "var(--color-encre-3)",
                        marginBottom: 10,
                      }}
                    >
                      Upgrades niveau B2
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }} className="md:grid-cols-2 grid-cols-1">
                      {task.upgrades.slice(0, 4).map((u, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "12px 14px",
                            borderRadius: 12,
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                            background: "rgba(16, 185, 129, 0.05)",
                          }}
                        >
                          <div style={{ fontSize: 11, color: "var(--color-encre-3)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>DIT</div>
                          <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, color: "var(--color-encre-2)", marginBottom: 10, lineHeight: 1.45 }}>
                            « {u.said} »
                          </div>
                          <div style={{ fontSize: 11, color: "#10B981", fontFamily: "var(--font-mono)", marginBottom: 4 }}>→ VERSION B2</div>
                          <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, color: "#065F46", fontWeight: 600, marginBottom: 8, lineHeight: 1.45 }}>
                            « {u.b2} »
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--color-encre-3)", lineHeight: 1.45 }}>{u.why}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          <section
            style={{
              background: "var(--color-papier)",
              color: "var(--color-encre)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 18px 44px rgba(0,0,0,0.34)",
              marginBottom: 24,
            }}
          >
            <button
              onClick={() => setTranscriptOpen((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "16px 22px",
                border: "none",
                background: "var(--color-papier-2)",
                borderBottom: transcriptOpen ? "1px solid rgba(0,0,0,0.08)" : "none",
                fontFamily: "var(--font-sans)",
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--color-encre)",
                cursor: "pointer",
              }}
            >
              <span>📝 Transcript annoté{transcriptOpen ? "" : " (prouver/déplier)"}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-encre-3)" }}>{transcriptOpen ? "▲" : "▼"}</span>
            </button>
            <div
              style={{
                maxHeight: transcriptOpen ? 1600 : 0,
                overflow: "hidden",
                transition: "max-height 0.4s ease",
              }}
            >
              <div style={{ padding: "18px 22px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
                {taskRun?.turns?.map((turn, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: turn.role === "examiner" ? "rgba(40, 86, 158, 0.06)" : "rgba(255,255,255,0.6)",
                      border: turn.role === "examiner" ? "1px solid rgba(40, 86, 158, 0.15)" : "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 10.5,
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          background: turn.role === "examiner" ? "rgba(40, 86, 158, 0.15)" : "rgba(16, 185, 129, 0.15)",
                          color: turn.role === "examiner" ? "#28569E" : "#065F46",
                        }}
                      >
                        {turn.role === "examiner" ? "EXAMINATEUR" : "CANDIDAT(E)"}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--color-encre-3)" }}>
                        {Math.round(turn.start_ms / 1000)}s – {Math.round(turn.end_ms / 1000)}s
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, lineHeight: 1.55, color: "var(--color-encre)" }}>
                      {turn.role === "candidate"
                        ? highlightTurnText(turn.text, task?.errors ?? [])
                        : turn.text}
                    </div>
                  </div>
                ))}
                {!taskRun?.turns?.length && (
                  <div style={{ color: "var(--color-encre-3)", fontSize: 13, textAlign: "center", padding: 20 }}>
                    Aucun tour de parole enregistré pour cette tâche.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section
            style={{
              background: "var(--color-papier)",
              color: "var(--color-encre)",
              borderRadius: 16,
              padding: "24px 26px",
              boxShadow: "0 18px 44px rgba(0,0,0,0.34)",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-encre-3)",
                marginBottom: 14,
              }}
            >
              Top 3 fixes · Prochaines étapes drill
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }} className="md:grid-cols-3 grid-cols-1">
              {syn.topThreeFixes.map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 16px 18px",
                    borderRadius: 14,
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    background: "rgba(245, 158, 11, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: "#F59E0B",
                        color: "white",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        fontSize: 13,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#92400E" }}>{f.what}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--color-encre-2)", marginBottom: 10, lineHeight: 1.5 }}>{f.why}</div>
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 9,
                      background: "white",
                      border: "1px solid rgba(0,0,0,0.06)",
                      fontSize: 12.5,
                      color: "var(--color-encre)",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--color-encre-3)", letterSpacing: ".08em", display: "block", marginBottom: 3 }}>DRILL RECOMMANDÉ</span>
                    {f.drill}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              borderRadius: 16,
              padding: "22px 26px",
              color: "#ECFDF5",
              boxShadow: "0 18px 44px rgba(16, 185, 129, 0.25)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(236, 253, 245, 0.8)",
                marginBottom: 10,
              }}
            >
              Prochaine session recommandée
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                  T{syn.nextSession.recommendedTask} · {syn.nextSession.recommendedCategory}
                </div>
                <div style={{ fontSize: 13.5, color: "rgba(236, 253, 245, 0.9)", lineHeight: 1.5 }}>
                  {syn.nextSession.reason}
                </div>
              </div>
              <Link
                href={`/expression-orale/${syn.nextSession.recommendedCategory}`}
                style={{
                  padding: "13px 22px",
                  borderRadius: 12,
                  background: "#ECFDF5",
                  color: "#065F46",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                  whiteSpace: "nowrap",
                }}
              >
                Commencer T{syn.nextSession.recommendedTask} →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
