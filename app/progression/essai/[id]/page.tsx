"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavLaterale from "@/components/NavLaterale";
import ResultatCorrection from "@/components/expression-ecrite/ResultatCorrection";
import type {
  EssaiExpressionEcrite,
  CorrectionResult,
} from "@/lib/types/tcf";
import { NCLC, CECRL } from "@/lib/llm/prompts";

function essaiToResultat(e: EssaiExpressionEcrite): CorrectionResult & {
  _meta?: object;
  nclc?: string;
  formules_b2?: string[];
  modele_b2?: string;
} {
  const note20 = e.note_20 ?? 0;
  const nclc = e.nclc || (note20 ? NCLC(note20) : undefined);
  type Rec = Record<string, unknown>;
  const eAny = e as unknown as Rec;
  const pickStr = (...keys: string[]): string => {
    for (const k of keys) {
      const v = eAny[k];
      if (typeof v === "string" && v.trim().length > 0) return v.trim();
    }
    return "";
  };
  const pickArr = (...keys: string[]): unknown[] => {
    for (const k of keys) {
      const v = eAny[k];
      if (Array.isArray(v) && v.length > 0) return v;
    }
    return [];
  };
  const feedback = pickStr("feedback", "verdict", "commentaire", "commentaire_general", "retour", "appreciation", "general_feedback", "overall_comment");
  const corrected_version = pickStr("corrected_version", "version_corrigee", "version_corrigée", "correction_complete", "corrected_text", "reponse_corrigee", "version_finale", "final_corrected");
  const strengths = pickArr("strengths", "points_forts", "points_positifs", "reussites", "positives", "qualites", "strong_points").filter(x => typeof x === "string" && x.trim().length > 0) as string[];
  const areas_for_improvement = pickArr("areas_for_improvement", "axes_amelioration", "axes_amélioration", "axes_d_amelioration", "axes_d_amélioration", "points_a_ameliorer", "points_a_améliorer", "a_ameliore", "a_amélioré", "ameliorations", "améliorations", "suggestions", "improvements", "weaknesses", "faiblesses", "points_faibles", "aspects_a_renforcer", "aspects_à_renforcer", "to_improve").filter(x => typeof x === "string" && x.trim().length > 0) as string[];
  const grammar_tips = pickArr("grammar_tips", "conseils_grammaire", "astuces_grammaire", "tips_grammaire", "grammar_advice", "astuces_grammaticales")
    .filter((g): g is { regle: string; exemple?: unknown; explication?: unknown } =>
      !!g && typeof g === "object" && typeof (g as { regle?: unknown }).regle === "string"
    )
    .map(g => ({
      regle: g.regle,
      exemple: typeof g.exemple === "string" ? g.exemple : "",
      explication: typeof g.explication === "string" ? g.explication : "",
    }));
  const vocabulary_upgrades = pickArr("vocabulary_upgrades", "ameliorations_vocabulaire", "améliorations_vocabulaire", "upgrades_vocabulaire", "ameliorations_lexicales", "améliorations_lexicales", "vocab_ameliorer", "vocab_améliorer")
    .filter((v): v is { original: string; suggestion: string; explication?: unknown } =>
      !!v && typeof v === "object" && typeof (v as { original?: unknown }).original === "string" && typeof (v as { suggestion?: unknown }).suggestion === "string"
    )
    .map(v => ({
      original: v.original,
      suggestion: v.suggestion,
      explication: typeof v.explication === "string" ? v.explication : "",
    }));
  const VALIDE = new Set<"B1" | "B2" | "C1" | "C2">(["B1", "B2", "C1", "C2"]);
  const coerceNiveau = (n: unknown): "B1" | "B2" | "C1" | "C2" => {
    const s = String(n ?? "").trim().toUpperCase().replace(/\+/g, "");
    if (VALIDE.has(s as "B1" | "B2" | "C1" | "C2")) return s as "B1" | "B2" | "C1" | "C2";
    if (s.startsWith("A")) return "B1";
    if (s === "C") return "C1";
    return "B2";
  };
  const example_responses = pickArr("example_responses", "exemples_reponse", "exemples_réponse", "modeles_reponse", "modèles_réponse", "reponses_exemple", "réponses_exemple", "examples")
    .filter((ex): ex is { niveau: unknown; texte: string } =>
      !!ex && typeof ex === "object" && typeof (ex as { texte?: unknown }).texte === "string" && (ex as { niveau?: unknown }).niveau !== undefined
    )
    .map(ex => ({
      niveau: coerceNiveau(ex.niveau),
      texte: ex.texte,
    }));
  const points_forts = (e.points_forts && e.points_forts.length) ? e.points_forts : strengths;

  // (D4-HIST) PADDING example_responses → 3 entrées B1/B2/C1 distinctes
  const VALIDE_NIVEAUX = new Set<"B1" | "B2" | "C1">(["B1", "B2", "C1"]);
  const gatheredEx = ([] as { niveau: unknown; texte: string }[])
    .concat(
      (Array.isArray(e.example_responses) ? e.example_responses : []) as { niveau: unknown; texte: string }[],
      pickArr("example_responses", "exemples_reponse", "exemples_réponse", "modeles_reponse", "modèles_réponse", "reponses_exemple", "réponses_exemple", "examples")
        .filter((ex): ex is { niveau: unknown; texte: string } =>
          !!ex && typeof ex === "object" && typeof (ex as { texte?: unknown }).texte === "string" && (ex as { niveau?: unknown }).niveau !== undefined
        )
    );
  const existant = new Map<string, string>();
  for (const ex of gatheredEx) {
    if (ex && typeof ex.texte === "string") {
      const n = String(ex.niveau ?? "").trim().toUpperCase().replace(/\+/g, "");
      if (VALIDE_NIVEAUX.has(n as "B1" | "B2" | "C1")) existant.set(n, ex.texte);
    }
  }
  const reconstruireEx = existant.size !== 3;
  const base = (corrected_version && corrected_version.length > 32) ? corrected_version : (e.copie || "");
  const example_responses_final = (reconstruireEx
    ? [
        { niveau: "B1" as const, texte: existant.get("B1") || ("[Modèle B1 par défaut] : " + base.slice(0, Math.min(base.length, Math.floor(base.length * 0.6)))) },
        { niveau: "B2" as const, texte: existant.get("B2") || (base || "[Copie indisponible]") },
        {
          niveau: "C1" as const,
          texte: existant.get("C1") ||
            ((base || "[Copie indisponible]") +
              ". Par ailleurs, il convient de souligner que " +
              ((areas_for_improvement[0]) ||
                "la structure du discours gagne en profondeur grâce à des connecteurs logiques variés et des propositions subordonnées qui introduisent nuances et contraste.")),
        },
      ]
    : (gatheredEx
        .filter(ex => {
          const n = String(ex.niveau ?? "").trim().toUpperCase().replace(/\+/g, "");
          return VALIDE_NIVEAUX.has(n as "B1" | "B2" | "C1") && typeof ex.texte === "string";
        })
        .map(ex => ({ niveau: String(ex.niveau ?? "").trim().toUpperCase().replace(/\+/g, "") as "B1" | "B2" | "C1", texte: ex.texte })))
  );

  // (D0-HIST) Score 100 bidirectionnel
  let score100 = e.score_100;
  if (typeof score100 !== "number" && note20) {
    score100 = Math.max(0, Math.min(100, Math.round((note20 / 20) * 100)));
  }
  // Critères par défaut (5 entrées) si absents
  const defNote = Math.max(0, Math.min(5, Math.round(note20 / 4)));
  const criteres = (e.criteres && e.criteres.length === 5) ? e.criteres : [
    { nom: "Grammaire et syntaxe", note: defNote, commentaire: "" },
    { nom: "Richesse et précision lexicales", note: defNote, commentaire: "" },
    { nom: "Cohérence et cohésion", note: defNote, commentaire: "" },
    { nom: "Réalisation de la tâche", note: defNote, commentaire: "" },
    { nom: "Style et registre", note: defNote, commentaire: "" },
  ];
  const gap7 = (e.gap_7 && typeof e.gap_7 === "object") ? (e.gap_7 as CorrectionResult["gap_7"]) : { atteint: false, manque: [], actions: [] };
  const gap8 = (e.gap_8 && typeof e.gap_8 === "object") ? (e.gap_8 as CorrectionResult["gap_8"]) : { atteint: false, manque: [], actions: [] };
  const sb = (e.score_breakdown && typeof e.score_breakdown === "object") ? e.score_breakdown : { grammaire_syntaxe_20: 0, gamme_vocabulaire_20: 0, coherence_cohesion_20: 0, realisation_tache_20: 0, style_registre_20: 0 };

  return {
    note20,
    cecrl: CECRL(Math.max(0, Math.min(20, Math.round(note20)))),
    longueur_ok: Boolean(e.longueur_ok),
    verdict: e.verdict || feedback || "",
    criteres,
    commentaires: e.commentaires || [],
    erreurs: e.erreurs || [],
    points_forts,
    gap_7: gap7,
    gap_8: gap8,
    modele_b2: e.modele_b2 || "",
    formules_b2: e.formules_b2 || [],
    score_100: score100,
    score_breakdown: sb,
    feedback: feedback || e.verdict || "",
    corrected_version: corrected_version || e.corrected_version || "",
    strengths: (e.strengths && e.strengths.length) ? e.strengths : strengths,
    areas_for_improvement: (e.areas_for_improvement && e.areas_for_improvement.length) ? e.areas_for_improvement : areas_for_improvement,
    grammar_tips: (e.grammar_tips && e.grammar_tips.length) ? e.grammar_tips : grammar_tips,
    vocabulary_upgrades: (e.vocabulary_upgrades && e.vocabulary_upgrades.length) ? e.vocabulary_upgrades : vocabulary_upgrades,
    example_responses: example_responses_final as CorrectionResult["example_responses"],
    nclc,
    _meta: {
      nb_mots: e.nb_mots,
      nclc,
      model_used: e.model_used,
      created_at: e.created_at,
      id: e.id,
    },
  };
}

export default function PageEssaiDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [e, setE] = useState<EssaiExpressionEcrite | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setId(p.id)).catch(() => setId(null));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    fetch(`/api/essais/${id}`, { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 404) {
          throw new Error("Copie introuvable (404).");
        }
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json() as Promise<EssaiExpressionEcrite>;
      })
      .then((d) => {
        setE(d);
        setLoading(false);
      })
      .catch((er) => {
        setErr(String(er?.message || er));
        setLoading(false);
      });
  }, [id]);

  async function supprimer() {
    if (!e?.id) return;
    const ok = window.confirm(
      "Supprimer définitivement cette copie ?\nToutes ses métadonnées, notes et corrections seront effacées."
    );
    if (!ok) return;
    const r = await fetch(`/api/essais/${e.id}`, { method: "DELETE" });
    if (!r.ok) return alert("Échec suppression");
    router.push("/progression");
  }

  return (
    <div className="coquille">
      <NavLaterale actif="progression" />
      <main className="contenu-principal">
        <div className="grille">
          <div className="col-gauche" style={{ maxWidth: 1040 }}>
            <nav
              aria-label="Fil d'Ariane"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                color: "var(--color-encre-3)",
              }}
            >
              <Link
                href="/progression"
                className="lien-bleu"
                style={{ textDecoration: "none" }}
              >
                ← Retour au tableau de bord
              </Link>
              <span>›</span>
              <span>Analyse détaillée</span>
            </nav>

            {loading && (
              <section className="carte">
                <div className="bloc">
                  <div className="charge">
                    <span className="spin" /> Chargement de l'analyse…
                  </div>
                </div>
              </section>
            )}

            {!loading && err && (
              <section className="carte">
                <div
                  className="bloc"
                  style={{
                    padding: 18,
                    borderRadius: 10,
                    border: "1px solid #F2A0AF",
                    color: "#F2A0AF",
                    fontSize: 14,
                  }}
                >
                  {err}
                  <div style={{ marginTop: 14 }}>
                    <Link
                      href="/progression"
                      className="bouton clair"
                      style={{ textDecoration: "none" }}
                    >
                      ← Revenir à la progression
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {!loading && !err && e && (
              <>
                <section
                  className="carte"
                  style={{ marginBottom: 16 }}
                  aria-label="Méta de l'essai"
                >
                  <div className="entete-carte">
                    <h2>
                      Analyse — Tâche {e.tache_num} ·{" "}
                      {(e.note_20 ?? "—") + " / 20"} · NCLC{" "}
                      {e.nclc ||
                        (e.note_20 ? NCLC(Math.round(Number(e.note_20))) : "—")}
                    </h2>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--color-encre-3)",
                      }}
                    >
                      {e.created_at
                        ? new Date(e.created_at).toLocaleString("fr-CA", {
                            dateStyle: "long",
                            timeStyle: "short",
                          })
                        : ""}
                    </span>
                  </div>
                  <div className="bloc">
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <span className="badge">Tâche {e.tache_num}</span>
                      <span className="badge">{e.nb_mots ?? 0} mots</span>
                      {typeof e.score_100 === "number" && (
                        <span className="badge">
                          {Math.round(e.score_100)} / 100
                        </span>
                      )}
                      {e.longueur_ok === true && (
                        <span
                          className="badge"
                          style={{
                            color: "#3CCF91",
                            borderColor: "#3CCF9155",
                            background: "#14261F",
                          }}
                        >
                          Longueur ✔
                        </span>
                      )}
                      {e.longueur_ok === false && (
                        <span
                          className="badge"
                          style={{
                            color: "#F2A0AF",
                            borderColor: "#F2A0AF55",
                            background: "#341A21",
                          }}
                        >
                          Longueur ✘
                        </span>
                      )}
                      {e.model_used && (
                        <span
                          className="badge"
                          style={{ color: "var(--color-encre-2)" }}
                          title="Modèle LLM utilisé pour cette correction"
                        >
                          🤖 {e.model_used}
                        </span>
                      )}
                      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                        <Link
                          href="/expression-ecrite"
                          className="bouton clair"
                          style={{ textDecoration: "none", fontSize: 13 }}
                        >
                          ✍ Refaire une copie
                        </Link>
                        <button
                          type="button"
                          onClick={supprimer}
                          style={{
                            all: "unset",
                            boxSizing: "border-box",
                            cursor: "pointer",
                            padding: "7px 14px",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 600,
                            background: "#3A1A20",
                            color: "#F2A0AF",
                            border: "1px solid #F2A0AF44",
                          }}
                        >
                          🗑 Supprimer
                        </button>
                      </div>
                    </div>

                    {e.consigne && (
                      <details
                        style={{
                          border: "1px solid var(--color-grille)",
                          borderRadius: 10,
                          padding: "10px 14px",
                          background: "rgba(255,255,255,.02)",
                        }}
                      >
                        <summary
                          style={{
                            cursor: "pointer",
                            color: "var(--color-encre-2)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11.5,
                            letterSpacing: ".08em",
                          }}
                        >
                          📋 Consigne de la tâche
                        </summary>
                        <p
                          style={{
                            margin: "10px 0 0",
                            whiteSpace: "pre-wrap",
                            color: "var(--color-encre)",
                            fontSize: 14,
                            lineHeight: 1.6,
                          }}
                        >
                          {e.consigne}
                        </p>
                      </details>
                    )}
                  </div>
                </section>

                <ResultatCorrection
                  r={essaiToResultat(e)}
                  tacheActive={(e.tache_num || 1) as 1 | 2 | 3}
                  nbMotsCopie={e.nb_mots || 0}
                  visible
                  copieOriginale={e.copie}
                />

                {(e.notes_user || "").trim().length > 0 && (
                  <section
                    className="carte"
                    style={{ marginTop: 16 }}
                    aria-label="Mes notes sur cette copie"
                  >
                    <div className="entete-carte">
                      <h2>📝 Mes notes sur cette copie</h2>
                    </div>
                    <div className="bloc">
                      <p
                        style={{
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          fontSize: 14.5,
                          lineHeight: 1.65,
                          color: "var(--color-encre)",
                        }}
                      >
                        {e.notes_user}
                      </p>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
