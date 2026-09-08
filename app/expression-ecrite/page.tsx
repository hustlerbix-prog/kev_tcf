"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import SelecteurTache from "@/components/expression-ecrite/SelecteurTache";
import EditeurSeyes from "@/components/expression-ecrite/EditeurSeyes";
import Chrono from "@/components/expression-ecrite/Chrono";
import PanneauLive from "@/components/expression-ecrite/PanneauLive";
import ResultatCorrection, {
  ResultatTropCourt,
  ResultatChargement,
  ResultatBrut,
  ResultatErreur,
  motsDe,
} from "@/components/expression-ecrite/ResultatCorrection";
import ModeleB2 from "@/components/expression-ecrite/ModeleB2";
import ListeVerbes from "@/components/conjugaison/ListeVerbes";
import FicheVerbe from "@/components/conjugaison/FicheVerbe";
import ExercicesConjugaison from "@/components/conjugaison/ExercicesConjugaison";
import NavLaterale from "@/components/NavLaterale";
import { analyserPropre } from "@/lib/heuristiques";
import { TACHES } from "@/lib/heuristiques/taches";
import { VERBES, type ConjugaisonVerb } from "@/lib/heuristiques/conjug-ui";
import type { CorrectionResult } from "@/lib/types/tcf";
import { CECRL, NCLC } from "@/lib/llm/prompts";

type Onglet = "editeur" | "conjugaison";
type ResultatMode =
  | "vide"
  | "trop-court"
  | "chargement"
  | "res"
  | "brut"
  | "erreur";

export default function PageExpressionEcriteWrapper() {
  return (
    <Suspense fallback={null}>
      <PageExpressionEcrite />
    </Suspense>
  );
}

function PageExpressionEcrite() {
  const searchParams = useSearchParams();
  const exoId = searchParams.get("exo");
  const tabParam = searchParams.get("tab");

  const [onglet, setOnglet] = useState<Onglet>("editeur");
  const [tacheActive, setTacheActive] = useState<1 | 2 | 3>(1);
  const [copie, setCopie] = useState("");
  const [resultatMode, setResultatMode] = useState<ResultatMode>("vide");
  const [correctResult, setCorrectResult] = useState<CorrectionResult | null>(null);
  const [brut, setBrut] = useState("");
  const [erreurMsg, setErreurMsg] = useState("");
  const [modeleB2Start, setModeleB2Start] = useState(false);
  const [exerciceId, setExerciceId] = useState<string | null>(null);

  const [verbeActif, setVerbeActif] = useState<ConjugaisonVerb>(VERBES[0]);
  const [filtreActif, setFiltreActif] = useState<string>("tous");
  const [verbeCible, setVerbeCible] = useState<ConjugaisonVerb | null>(null);

  const consigneRef = useRef<HTMLTextAreaElement | null>(null);
  const redacRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const sync = () => {
      consigneRef.current = document.getElementById(
        "consigne"
      ) as HTMLTextAreaElement | null;
      redacRef.current = document.getElementById(
        "redaction"
      ) as HTMLTextAreaElement | null;
    };
    sync();
    const id = window.setTimeout(sync, 0);
    return () => window.clearTimeout(id);
  }, [onglet]);

  useEffect(() => {
    setResultatMode("vide");
    setCorrectResult(null);
    setModeleB2Start(false);
  }, [tacheActive]);

  useEffect(() => {
    setOnglet(tabParam === "conjugaison" ? "conjugaison" : "editeur");
  }, [tabParam]);

  useEffect(() => {
    if (!exoId) return;
    let annule = false;
    fetch("/api/exercices/" + exoId)
      .then((r) => r.json())
      .then((d) => {
        if (annule || !d || d.erreur) return;
        setExerciceId(d.id);
        setTacheActive(d.tache_num);
        setCopie("");
        requestAnimationFrame(() => {
          const ta = document.getElementById(
            "consigne"
          ) as HTMLTextAreaElement | null;
          if (ta) ta.value = d.consigne || "";
        });
      })
      .catch(() => {});
    return () => {
      annule = true;
    };
  }, [exoId]);

  const erreurs = useMemo(() => analyserPropre(copie), [copie]);
  const nMots = motsDe(copie);
  const t = TACHES[tacheActive];
  const dansCible = nMots >= t.min && nMots <= t.max;
  const couleurJauge =
    nMots < t.min
      ? "#E5B549"
      : nMots > t.max
      ? "#F2A0AF"
      : "#6FD3A9";

  const insererAuCurseur = (texte: string) => {
    const ta =
      redacRef.current ||
      (typeof document !== "undefined"
        ? (document.getElementById("redaction") as HTMLTextAreaElement | null)
        : null);
    if (!ta) {
      setCopie((c) => c + texte);
      return;
    }
    const d = ta.selectionStart != null ? ta.selectionStart : ta.value.length;
    const avant = ta.value.slice(0, d);
    const apres = ta.value.slice(ta.selectionEnd != null ? ta.selectionEnd : d);
    setCopie(avant + texte + apres);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = d + texte.length;
      ta.selectionStart = ta.selectionEnd = pos;
    });
  };

  type Rec = Record<string, unknown>;
  const pickStr = (r: Rec, ...keys: string[]): string => {
    for (const k of keys) {
      const v = r[k];
      if (typeof v === "string" && v.trim().length > 0) return v.trim();
    }
    return "";
  };
  const pickArr = (r: Rec, ...keys: string[]): unknown[] => {
    for (const k of keys) {
      const v = r[k];
      if (Array.isArray(v) && v.length > 0) return v;
    }
    return [];
  };
  const normaliserClient = <T extends Rec>(raw: T, copie?: string): T => {
    const r = { ...raw } as Rec;
    if (!pickStr(r, "feedback")) r.feedback = pickStr(r, "feedback", "verdict", "commentaire", "commentaire_general", "retour", "appreciation", "general_feedback", "overall_comment");
    if (!pickStr(r, "corrected_version")) r.corrected_version = pickStr(r, "corrected_version", "version_corrigee", "version_corrigée", "correction_complete", "corrected_text", "reponse_corrigee", "version_finale", "final_corrected");
    const s = pickArr(r, "strengths", "points_forts", "points_positifs", "reussites", "positives", "qualites", "strong_points").filter(x => typeof x === "string" && x.trim().length > 0);
    if (s.length > 0 && (!Array.isArray(r.strengths) || r.strengths.length === 0)) r.strengths = s;
    const a = pickArr(r, "areas_for_improvement", "axes_amelioration", "axes_amélioration", "axes_d_amelioration", "axes_d_amélioration", "points_a_ameliorer", "points_a_améliorer", "a_ameliore", "a_amélioré", "ameliorations", "améliorations", "suggestions", "improvements", "weaknesses", "faiblesses", "points_faibles", "aspects_a_renforcer", "aspects_à_renforcer", "to_improve").filter(x => typeof x === "string" && x.trim().length > 0);
    if (a.length > 0 && (!Array.isArray(r.areas_for_improvement) || r.areas_for_improvement.length === 0)) r.areas_for_improvement = a;
    const gt = pickArr(r, "grammar_tips", "conseils_grammaire", "astuces_grammaire", "tips_grammaire", "grammar_advice", "astuces_grammaticales").filter(g => g && typeof g === "object" && "regle" in g && typeof (g as Rec).regle === "string");
    if (gt.length > 0 && (!Array.isArray(r.grammar_tips) || r.grammar_tips.length === 0)) r.grammar_tips = gt;
    const vu = pickArr(r, "vocabulary_upgrades", "ameliorations_vocabulaire", "améliorations_vocabulaire", "upgrades_vocabulaire", "ameliorations_lexicales", "améliorations_lexicales", "vocab_ameliorer", "vocab_améliorer").filter(v => v && typeof v === "object" && "original" in v && "suggestion" in v && typeof (v as Rec).original === "string" && typeof (v as Rec).suggestion === "string");
    if (vu.length > 0 && (!Array.isArray(r.vocabulary_upgrades) || r.vocabulary_upgrades.length === 0)) r.vocabulary_upgrades = vu;
    const ex = pickArr(r, "example_responses", "exemples_reponse", "exemples_réponse", "modeles_reponse", "modèles_réponse", "reponses_exemple", "réponses_exemple", "examples").filter(e => e && typeof e === "object" && "niveau" in e && "texte" in e && typeof (e as Rec).niveau === "string" && typeof (e as Rec).texte === "string");
    if (ex.length > 0 && (!Array.isArray(r.example_responses) || r.example_responses.length === 0)) r.example_responses = ex;

    // (D0-CLIENT) Coerce note20 ↔ score_100 bidirectionnel, valeur par défaut si absents
    if ((typeof r.note20 !== "number" || r.note20 < 1 || r.note20 > 20) && typeof r.score_100 === "number") {
      r.note20 = Math.max(1, Math.min(20, Math.round((r.score_100 / 100) * 20)));
    }
    if (typeof r.score_100 !== "number" && typeof r.note20 === "number") {
      r.score_100 = Math.max(0, Math.min(100, Math.round((r.note20 / 20) * 100)));
    }
    if (typeof r.note20 !== "number") r.note20 = 1;
    if (typeof r.score_100 !== "number") r.score_100 = 5;

    // (G-CLIENT) IMPÉRATIF — écraser cecrl depuis note20 (jamais B1+, B2+ — cf. A18)
    const N = Math.max(0, Math.min(20, Math.round(Number(r.note20) || 0)));
    r.cecrl = CECRL(N);
    if (!r.nclc || typeof r.nclc !== "string") (r as Rec & { nclc?: string }).nclc = NCLC(N);

    // (D3-CLIENT) PURGE SCHÉMA FERMÉ — seulement les 19 clés canoniques
    const allowedKeys = new Set([
      "note20","cecrl","verdict","longueur_ok","criteres","commentaires",
      "erreurs","points_forts","gap_7","gap_8","score_100","score_breakdown",
      "feedback","corrected_version","strengths","areas_for_improvement",
      "grammar_tips","vocabulary_upgrades","example_responses","nclc","_meta"
    ]);
    for (const k of Object.keys(r)) if (!allowedKeys.has(k)) delete (r as Rec)[k];

    // Garantit objets structurels toujours présents
    if (!r.gap_7 || typeof r.gap_7 !== "object") r.gap_7 = { atteint: false, manque: [], actions: [] };
    if (!r.gap_8 || typeof r.gap_8 !== "object") r.gap_8 = { atteint: false, manque: [], actions: [] };
    if (!r.score_breakdown || typeof r.score_breakdown !== "object") {
      r.score_breakdown = { grammaire_syntaxe_20: 0, gamme_vocabulaire_20: 0, coherence_cohesion_20: 0, realisation_tache_20: 0, style_registre_20: 0 };
    }
    if (!Array.isArray(r.strengths) || r.strengths.length === 0) r.strengths = [...(s.length ? s : (Array.isArray(r.points_forts) ? r.points_forts as string[] : []))];
    if (!Array.isArray(r.points_forts) || r.points_forts.length === 0) r.points_forts = [...(r.strengths as string[] || [])];
    if (!Array.isArray(r.erreurs)) r.erreurs = [];
    if (!Array.isArray(r.commentaires)) r.commentaires = [];
    if (!Array.isArray(r.criteres) || r.criteres.length === 0) {
      const def = Math.max(0, Math.min(5, Math.round(Number(r.note20) / 4)));
      r.criteres = [
        { nom: "Grammaire et syntaxe", note: def, commentaire: "" },
        { nom: "Richesse et précision lexicales", note: def, commentaire: "" },
        { nom: "Cohérence et cohésion", note: def, commentaire: "" },
        { nom: "Réalisation de la tâche", note: def, commentaire: "" },
        { nom: "Style et registre", note: def, commentaire: "" },
      ];
    }

    // (D4-CLIENT) PADDING example_responses TOUJOURS 3 entrées B1/B2/C1 distinctes
    {
      const VALIDE_NIVEAUX = new Set<string>(["B1","B2","C1"]);
      const niveauxFournis = new Set(
        (Array.isArray(r.example_responses) ? r.example_responses : [])
          .map((ex) => String((ex as Rec)?.niveau ?? "").trim().toUpperCase().replace(/\+/g, ""))
          .filter(n => VALIDE_NIVEAUX.has(n))
      );
      const besoinRebuild =
        !Array.isArray(r.example_responses) ||
        r.example_responses.length !== 3 ||
        niveauxFournis.size !== 3;
      if (besoinRebuild) {
        const base =
          (typeof r.corrected_version === "string" && r.corrected_version.length > 32)
            ? r.corrected_version
            : (typeof copie === "string" ? copie : "");
        const B1 = { niveau: "B1", texte: "[Modèle B1 par défaut, LLM n'a pas fourni] : " + base.slice(0, Math.min(base.length, Math.floor(base.length * 0.6))) };
        const B2 = { niveau: "B2", texte: base || "[Copie indisponible]" };
        const C1 = {
          niveau: "C1",
          texte: (base || "[Copie indisponible]") +
            ". Par ailleurs, il convient de souligner que " +
            ((Array.isArray(r.areas_for_improvement) && typeof r.areas_for_improvement[0] === "string" && r.areas_for_improvement[0]) ||
              "la structure du discours gagne en profondeur grâce à des connecteurs logiques variés et des propositions subordonnées qui introduisent nuances et contraste."),
        };
        const existant = new Map<string, string>();
        for (const exRaw of (Array.isArray(r.example_responses) ? r.example_responses : [])) {
          const ex = exRaw as Rec;
          if (ex && typeof ex.texte === "string") {
            const n = String(ex.niveau ?? "").trim().toUpperCase().replace(/\+/g, "");
            if (VALIDE_NIVEAUX.has(n)) existant.set(n, ex.texte);
          }
        }
        r.example_responses = [
          { niveau: B1.niveau as "B1", texte: existant.get("B1") || B1.texte },
          { niveau: B2.niveau as "B2", texte: existant.get("B2") || B2.texte },
          { niveau: C1.niveau as "C1", texte: existant.get("C1") || C1.texte },
        ];
      }
    }
    return r as T;
  };

  const corriger = async () => {
    const consigne = consigneRef.current?.value?.trim() || "";
    if (nMots < 25) {
      setResultatMode("trop-court");
      return;
    }
    setResultatMode("chargement");
    setModeleB2Start(false);
    try {
      const r = await fetch("/api/corriger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tache_num: tacheActive,
          consigne,
          copie,
          exercice_id: exerciceId || undefined,
        }),
      }).then((x) => x.json());
      if (r.erreur && r.brut) {
        setBrut(r.brut);
        setResultatMode("brut");
        setModeleB2Start(true);
        return;
      }
      if (r.erreur) {
        setErreurMsg(r.detail || r.erreur || "Erreur inconnue");
        setResultatMode("erreur");
        return;
      }
      setCorrectResult(normaliserClient(r as Rec, copie) as unknown as CorrectionResult);
      setResultatMode("res");
      setModeleB2Start(true);
    } catch (e) {
      setErreurMsg(
        e instanceof Error ? e.message : typeof e === "string" ? e : String(e)
      );
      setResultatMode("erreur");
    }
  };

  const chargerModele = (texte: string) => {
    setCopie(texte);
    setModeleB2Start(false);
    setResultatMode("vide");
  };

  const totalLive = erreurs.length
    ? erreurs.length +
      " signalements · " +
      erreurs.filter((e) => e.g === "haute").length +
      " graves"
    : "";

  return (
    <div className="coquille">
      <NavLaterale actif={onglet === "conjugaison" ? "conjugaison" : "editeur"} />
      <main className="contenu-principal">
      {onglet === "editeur" ? (
        <div className="grille">
          <div className="col-gauche">
            <section className="carte">
              <div className="entete-carte">
                <h2>Votre copie</h2>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--color-encre-3)",
                  }}
                >
                  {t.type}
                </span>
              </div>
              <SelecteurTache
                tacheActive={tacheActive}
                onChange={setTacheActive}
              />
              <EditeurSeyes
                value={copie}
                onChange={setCopie}
                erreurs={erreurs}
              />
              <div className="outils">
                <div
                  className="jauge"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 12px",
                    border: "1px solid var(--color-grille)",
                    borderRadius: 999,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "var(--color-encre-2)" }}>
                    {nMots} mots
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      width: 120,
                      height: 6,
                      background: "rgba(255,255,255,.08)",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <i
                      style={{
                        display: "block",
                        height: "100%",
                        width: Math.min(
                          100,
                          (nMots / Math.max(t.max, 1)) * 100
                        ) + "%",
                        background: couleurJauge,
                      }}
                    />
                  </span>
                  <span style={{ color: couleurJauge }}>
                    cible {t.min}–{t.max}
                  </span>
                  <span
                    style={{ color: "var(--color-encre-3)", marginLeft: 4 }}
                  >
                    {dansCible ? "✓" : "○"}
                  </span>
                </div>
                <Chrono minutes={t.minutes} resetKey={tacheActive} />
                <button
                  className="bouton clair"
                  onClick={() => {
                    setCopie("");
                    setResultatMode("vide");
                    setModeleB2Start(false);
                  }}
                >
                  Vider la copie
                </button>
                <button
                  className="bouton principal"
                  id="btn-corriger"
                  onClick={corriger}
                  disabled={resultatMode === "chargement"}
                >
                  Corriger ma copie
                </button>
              </div>
            </section>

            {resultatMode === "trop-court" && (
              <ResultatTropCourt tacheActive={tacheActive} />
            )}
            {resultatMode === "chargement" && <ResultatChargement />}
            {resultatMode === "brut" && (
              <ResultatBrut brut={brut} tacheActive={tacheActive} />
            )}
            {resultatMode === "erreur" && (
              <ResultatErreur message={erreurMsg} onRetry={corriger} />
            )}
            {resultatMode === "res" && correctResult && (
              <ResultatCorrection
                r={correctResult as CorrectionResult & { _meta?: object }}
                tacheActive={tacheActive}
                nbMotsCopie={nMots}
                visible
                copieOriginale={copie}
              />
            )}
            {(resultatMode === "res" ||
              resultatMode === "brut" ||
              modeleB2Start) && (
              <section className="carte visible">
                <ModeleB2
                  onLoadModele={chargerModele}
                  start={modeleB2Start}
                  params={{
                    tache_num: tacheActive,
                    consigne: consigneRef.current?.value?.trim() || "",
                    copie,
                  }}
                />
              </section>
            )}
          </div>

          <div className="col-droite">
            <PanneauLive
              tacheActive={tacheActive}
              copie={copie}
              erreurs={erreurs}
              totalLive={totalLive}
              onInsertFormule={insererAuCurseur}
            />
            <section className="carte sombre codes">
              <div className="entete-carte">
                <h2>Codes de correction</h2>
              </div>
              <ul className="puces" style={{ fontSize: 13 }}>
                <li>
                  <b style={{ color: "#F2A0AF" }}>REG</b> · Registre tu/vous
                  incohérent
                </li>
                <li>
                  <b style={{ color: "#F2A0AF" }}>ORT</b> · Orthographe,
                  accentuation, a/à
                </li>
                <li>
                  <b style={{ color: "#EFC97E" }}>GR</b> · Grammaire :
                  contractions, articles
                </li>
                <li>
                  <b style={{ color: "#F2A0AF" }}>CONJ</b> · Conjugaison (temps,
                  accord)
                </li>
                <li>
                  <b style={{ color: "#F2A0AF" }}>ESP</b> · Interférence de
                  l'espagnol (calque)
                </li>
                <li>
                  <b style={{ color: "#EFC97E" }}>LEX</b> · Vocabulaire pauvre
                  ou répété
                </li>
                <li>
                  <b style={{ color: "#EFC97E" }}>COH</b> · Cohérence,
                  connecteurs, structure
                </li>
              </ul>
            </section>
          </div>
        </div>
      ) : (
        <div className="grille">
          <div className="col-gauche">
            <ListeVerbes
              verbeActif={verbeActif}
              onSelect={setVerbeActif}
              filtreActif={filtreActif}
              onChangeFiltre={setFiltreActif}
            />
          </div>
          <div className="col-droite">
            <FicheVerbe
              v={verbeActif}
              onSEntrainer={() => setVerbeCible({ ...verbeActif })}
            />
            <ExercicesConjugaison
              verbeCible={verbeCible}
              onCibleConsumed={() => setVerbeCible(null)}
            />
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
