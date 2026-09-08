"use client";

import type { CorrectionResult } from "@/lib/types/tcf";
import { TACHES, motsDe } from "@/lib/heuristiques/taches";
import { NCLC, CECRL } from "@/lib/llm/prompts";

interface Props {
  r: CorrectionResult & {
    _meta?: { nb_mots?: number; nclc?: string; model_used?: string };
  };
  tacheActive: 1 | 2 | 3;
  nbMotsCopie: number;
  visible: boolean;
  copieOriginale?: string;
}

const esc = (t: unknown) =>
  String(t ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * Insère des underlines ondulées ROUGES dans la copie affichée (« Your Response »),
 * à l'identique de la maquette : les segments `.original` des erreurs sont
 * surlignés d'une bordure inférieure rouge. Respecte la casse et les accents.
 * La recherche échoue silencieusement si le segment n'existe pas (règle A2).
 */
function surlignerDansCopie(copie: string, erreurs: CorrectionResult["erreurs"]): string {
  if (!copie) return "";
  if (!erreurs || erreurs.length === 0) return esc(copie);
  const segments = erreurs
    .filter((e) => typeof e.original === "string" && e.original.length > 0)
    .map((e) => e.original)
    .sort((a, b) => b.length - a.length);
  const regex = new RegExp(
    "(" + segments.map((s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|") + ")",
    "g"
  );
  const lignes = copie.split(/\n/);
  return lignes
    .map((ligne) => {
      if (!ligne.trim()) return "&nbsp;";
      return esc(ligne).replace(regex, (_m, g1: string) => {
        return (
          '<span style="border-bottom:2.5px solid #BE2F46;border-bottom-style:wavy;padding-bottom:1px;color:inherit">' +
          g1 +
          "</span>"
        );
      });
    })
    .join("\n");
}

export default function ResultatCorrection({
  r,
  tacheActive,
  nbMotsCopie,
  visible,
  copieOriginale,
}: Props) {
  if (!visible)
    return <section className="carte" id="resultat" style={{ display: "none" }} />;

  const note = Math.max(1, Math.min(20, r.note20 || 0));
  const nclc = NCLC(note);
  const atteint7 = note >= 10;
  const atteint8 = note >= 12;
  const com = r.commentaires || [];

  const rAny = r as unknown as Record<string, unknown>;
  const pickStr = (...keys: string[]): string => {
    for (const k of keys) {
      const v = rAny[k];
      if (typeof v === "string" && v.trim().length > 0) return v.trim();
    }
    return "";
  };
  const pickArr = <T = unknown>(...keys: string[]): T[] => {
    for (const k of keys) {
      const v = rAny[k];
      if (Array.isArray(v) && v.length > 0) return v as T[];
    }
    return [];
  };
  const fb = pickStr("feedback", "verdict", "commentaire", "commentaire_general", "retour", "appreciation", "general_feedback", "overall_comment");
  const cv = pickStr("corrected_version", "version_corrigee", "version_corrigée", "correction_complete", "corrected_text", "reponse_corrigee", "version_finale", "final_corrected");
  const strengthsArr = pickArr<string>("strengths", "points_forts", "points_positifs", "reussites", "positives", "qualites", "strong_points").filter((x) => typeof x === "string" && x.trim().length > 0);
  const areasArr = pickArr<string>("areas_for_improvement", "axes_amelioration", "axes_d_amelioration", "points_a_ameliorer", "points_a_améliorer", "a_ameliore", "ameliorations", "améliorations", "suggestions", "improvements", "weaknesses", "faiblesses", "points_faibles", "aspects_a_renforcer", "to_improve").filter((x) => typeof x === "string" && x.trim().length > 0);
  const grammarTipsArr = (() => {
    const candidates = pickArr<unknown>("grammar_tips", "conseils_grammaire", "astuces_grammaire", "tips_grammaire", "grammar_advice", "astuces_grammaticales");
    return candidates.filter((g): g is { regle: string; exemple?: string; explication?: string } => {
      const go = g as { regle?: unknown; exemple?: unknown; explication?: unknown } | null | undefined;
      return !!go && typeof go === "object" && typeof go.regle === "string";
    });
  })();
  const vocabArr = (() => {
    const candidates = pickArr<unknown>("vocabulary_upgrades", "ameliorations_vocabulaire", "améliorations_vocabulaire", "upgrades_vocabulaire", "ameliorations_lexicales", "améliorations_lexicales", "vocab_ameliorer", "vocab_améliorer");
    return candidates.filter((v): v is { original: string; suggestion: string; explication?: string } => {
      const vo = v as { original?: unknown; suggestion?: unknown; explication?: unknown } | null | undefined;
      return !!vo && typeof vo === "object" && typeof vo.original === "string" && typeof vo.suggestion === "string";
    });
  })();
  const exemplesArr = (() => {
    const candidates = pickArr<unknown>("example_responses", "exemples_reponse", "exemples_réponse", "modeles_reponse", "modèles_réponse", "reponses_exemple", "réponses_exemple", "examples");
    return candidates.filter((ex): ex is { niveau: string; texte: string } => {
      const eo = ex as { niveau?: unknown; texte?: unknown } | null | undefined;
      return !!eo && typeof eo === "object" && typeof eo.niveau === "string" && typeof eo.texte === "string";
    });
  })();

  const score100 = typeof r.score_100 === "number"
    ? r.score_100
    : Math.round((note / 20) * 100);
  const score100Existe = typeof r.score_100 === "number";

  // Objectif badge — wording précis par rapport à la cible NCLC 8 (12-13/20)
  const objectifTexte = (() => {
    const N = Math.max(0, Math.min(20, Math.round(note)));
    if (N >= 12) return "NCLC 8 ✅";
    if (N >= 10) return "NCLC 7 tenu, 8 en vue";
    if (N >= 7) return "NCLC 6 → viser 7 (10/20)";
    if (N >= 4) return "A2 → viser NCLC 7 (10/20)";
    return "A1 → travailler les bases";
  })();
  const objectifClasse = atteint8
    ? "cible-atteinte"
    : atteint7
      ? ""
      : "cible-manquée";

  const t = TACHES[tacheActive];
  const longueurOK = typeof r.longueur_ok === "boolean" ? r.longueur_ok : (nbMotsCopie >= t.min && nbMotsCopie <= t.max);
  const longueurClasse = longueurOK ? "" : "cible-manquée";

  const sb = r.score_breakdown;
  const cinqDefaut = { grammaire_syntaxe_20: 0, gamme_vocabulaire_20: 0, coherence_cohesion_20: 0, realisation_tache_20: 0, style_registre_20: 0 };
  const breakdown = sb && typeof sb === "object" && sb.grammaire_syntaxe_20 !== undefined
    ? sb
    : cinqDefaut;
  const breakdownExiste = sb && typeof sb === "object" && typeof (sb as { grammaire_syntaxe_20?: unknown }).grammaire_syntaxe_20 === "number" && ((sb as { grammaire_syntaxe_20?: number }).grammaire_syntaxe_20 || 0) > 0;
  const breakdownStylePlaceholder = breakdownExiste
    ? ""
    : "background:repeating-linear-gradient(45deg,rgba(255,255,255,.02) 0 6px,transparent 6px 12px);border:1px dashed #3A4A62 !important;";
  // NCLC badge — valeur lisible avec préfixe
  const nclcAffiche = (nclc && nclc !== "4 ou moins") ? "NCLC " + nclc : "— NCLC";
  const nclcPh = (!nclc || nclc === "4 ou moins") ? "border:1px dashed #BFB8A2;box-shadow:none;opacity:.85;" : "";
  const lignesBreakdown: { cle: keyof typeof breakdown; label: string }[] = [
    { cle: "grammaire_syntaxe_20", label: "Grammar & Syntax" },
    { cle: "gamme_vocabulaire_20", label: "Vocabulary Range" },
    { cle: "coherence_cohesion_20", label: "Coherence & Cohesion" },
    { cle: "realisation_tache_20", label: "Task Completion" },
    { cle: "style_registre_20", label: "Style & Register" },
  ];

  const crit = (r.criteres || [])
    .map((c, n) => {
      const p = Math.round(((c.note || 0) / 5) * 100);
      const cl = c.note >= 4 ? "bon" : c.note >= 3 ? "moyen" : "faible";
      return (
        '<div class="critere"><div class="ligne1"><span class="nom">' +
        esc(c.nom) +
        '</span><span class="sc">' +
        (c.note || 0) +
        " / 5</span></div>" +
        '<div class="rail"><i class="' +
        cl +
        '" style="width:' +
        p +
        '%"></i></div><p>' +
        esc(c.commentaire || com[n] || "") +
        "</p></div>"
      );
    })
    .join("");

  // BLOC 1 — Score Breakdown (carte sombre unique, 5 lignes avec rails verts à GAUCHE du nombre, MAQUETTE)
  const breakdownHTML = lignesBreakdown.map(({ cle, label }) => {
    const v = breakdown[cle] || 0;
    const p = Math.round((v / 20) * 100);
    return (
      '<div style="margin-bottom:14px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
      '<span style="color:#E7E3D6;font-size:14.5px;font-family:var(--font-sans)">' +
      esc(label) +
      "</span>" +
      '<span style="color:#fff;font-family:var(--font-mono);font-size:14px;font-weight:600">' +
      v +
      "/20" +
      "</span>" +
      "</div>" +
      '<div style="height:9px;background:#2A3544;border-radius:999px;overflow:hidden">' +
      '<i style="display:block;height:100%;width:' +
      p +
      '%;background:linear-gradient(90deg,#2FA671,#3CCF91);border-radius:999px;transition:width .25s"></i>' +
      "</div>" +
      "</div>"
    );
  }).join("");

  // Grammar Corrections — carte sombre, une entrée par erreur (maquette) — toujours affichée
  const listeErreurs = (r.erreurs || []).filter(e => typeof e.original === "string" && e.original.length > 0);
  const grammarCorrections =
    '<div class="panneau-sombre"><h3>Grammar Corrections</h3><div class="liste-scroll">' +
    (listeErreurs.length
      ? listeErreurs.map((e) => (
          '<div class="gcorr-item">' +
          '<div class="paire"><s>' +
          esc(e.original || "") +
          '</s><span class="fleche">→</span><b>' +
          esc(e.correction || "") +
          "</b></div>" +
          '<p>' +
          esc(e.explication || "") +
          (e.es
            ? ' <span style="color:#6FA3F7">· ' + esc(e.es) + "</span>"
            : "") +
          "</p></div>"
        )).join("")
      : '<div style="padding:14px 14px;border-radius:10px;background:#131C27;border:1px dashed #2A3544;color:#7A889C;font-family:var(--font-mono);font-size:12.5px;line-height:1.6">ℹ️ Aucune erreur grammaticale détectée pour cette copie. C\'est excellent — ou utilise un modèle plus grand pour un diagnostic plus fin.</div>') +
    "</div></div>";

  const listeGap = (g?: { manque?: string[]; actions?: string[] }) => {
    if (!g) return "";
    return (
      '<ul class="puces">' +
      ((g.manque || []).map((x) => "<li>" + esc(x) + "</li>").join("") ||
        "<li>—</li>") +
      "</ul>" +
      '<h3 style="margin-top:12px">Ce qu\'il faut faire dès la prochaine copie</h3><ul class="puces">' +
      ((g.actions || []).map((x) => "<li>" + esc(x) + "</li>").join("") ||
        "<li>—</li>") +
      "</ul>"
    );
  };

  // BLOC 2 — Feedback (meme carte sombre #18222E que Score Breakdown + Your Response, uniforme maquette) — toujours affiché
  const feedbackCard =
    '<div style="background:#18222E;border:1px solid #2A3544;border-radius:14px;padding:18px 20px;margin:0 0 22px">' +
    '<h3 style="margin:0 0 10px;color:#D7E3F5;font-family:var(--font-sans);font-size:15.5px;font-weight:600">Feedback</h3>' +
    (fb
      ? '<p style="margin:0;color:#C9D4E8;font-family:var(--font-sans);font-size:14.5px;line-height:1.65">' + esc(fb) + "</p>"
      : '<div style="margin:0;padding:12px 14px;border-radius:10px;background:#131C27;border:1px dashed #2A3544;color:#7A889C;font-family:var(--font-mono);font-size:12.5px;line-height:1.6">ℹ️ Le correcteur (' + esc(r._meta?.model_used || "LLM") + ') n\'a pas généré de feedback textuel structuré. Les champs "Feedback", "Verdict", "Retour", "Appréciation" étaient vides. Utilise un modèle plus grand (ex: anthropic/claude-sonnet) pour obtenir ce champ.</div>') +
    "</div>";

  // BLOC 3 — Your Response (copie + underlines rouges, comme la maquette)
  const votreCopie =
    '<div style="background:#18222E;border:1px solid #2A3544;border-radius:14px;padding:20px 22px;margin:0 0 22px">' +
    '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">' +
    '<h3 style="margin:0;color:#E9E5D7;font-family:var(--font-sans);font-size:15.5px;font-weight:600">Your Response</h3>' +
    '<span style="color:#7A889C;font-size:12.5px;font-family:var(--font-sans)">Tap a highlighted phrase to see the correction</span>' +
    "</div>" +
    (copieOriginale
      ? '<div style="color:#E5E0CE;font-family:var(--font-serif);font-size:15.5px;line-height:1.75;white-space:pre-wrap">' + surlignerDansCopie(copieOriginale, r.erreurs) + "</div>"
      : '<div style="padding:12px 14px;border-radius:10px;border:1px dashed #2A3544;background:#131C27;color:#7A889C;font-family:var(--font-mono);font-size:12.5px">ℹ️ Texte original de la copie non disponible pour cette vue.</div>') +
    "</div>";

  // BLOC 4 — Corrected Version (bordure verte) — toujours affiché avec placeholder si vide
  const correctedCard =
    '<div style="background:#14261F;border:1px solid #224A3C;border-radius:14px;padding:18px 20px;margin:0 0 22px;border-top:4px solid #3CCF91">' +
    '<h3 style="margin:0 0 12px;color:#3CCF91;font-family:var(--font-sans);font-size:15.5px;font-weight:700">Corrected Version</h3>' +
    (cv
      ? '<div style="font-family:var(--font-serif);color:#DCE7E0;font-size:15px;line-height:1.75;white-space:pre-wrap">' + esc(cv) + "</div>"
      : '<div style="padding:14px 14px;border-radius:10px;background:#101F19;border:1px dashed #224A3C;color:#7A889C;font-family:var(--font-mono);font-size:12.5px;line-height:1.6">ℹ️ Ce modèle (' + esc(r._meta?.model_used || "LLM") + ') n\'a pas renvoyé de version corrigée complète. Cherche les clés "corrected_version / version_corrigée / correction_complete" ou utilise un modèle plus grand (claude-sonnet / gpt-4o).<br><br>Tu peux quand même lire "Your Response" + les Grammar Corrections ci-dessous pour corriger ta copie manuellement.</div>') +
    '<div style="margin-top:12px;padding-top:10px;border-top:1px dashed #26493C">' +
    '<button type="button" data-toggle-en style="all:unset;cursor:pointer;color:#56C79A;font-family:var(--font-mono);font-size:12.5px;font-weight:500" onclick="const t=this.nextElementSibling;t.style.display=t.style.display!==\'block\'?\'block\':\'none\';">▸ Show English Translation</button>' +
    '<div style="display:none;margin-top:8px;color:#98B4A5;font-size:13px;font-family:var(--font-sans);line-height:1.6">' +
    "(Translation placeholder — à remplir si traduction fournie par le correcteur.)" +
    "</div>" +
    "</div>" +
    "</div>";

  // BLOC 5 — Strengths (✅) · Areas for Improvement (⚡) — FLEX ROW 2 colonnes, maquette
  const pointsFortsHTML =
    '<div style="background:#14261F;border:1px solid #224A3C;border-radius:14px;padding:18px 20px">' +
    '<h3 style="margin:0 0 10px;color:#3CCF91;font-size:15px;font-weight:700;font-family:var(--font-sans)">✓ Strengths</h3>' +
    '<ul style="margin:0;padding-left:18px;list-style:none">' +
    (strengthsArr.length
      ? strengthsArr.map((x) => {
          return (
            '<li style="color:#D2E1D9;font-family:var(--font-sans);font-size:14px;line-height:1.55;padding:3px 0;position:relative">' +
            '<span style="position:absolute;left:-16px;top:5px;color:#3CCF91">•</span>' +
            esc(x) +
            "</li>"
          );
        }).join("")
      : '<li style="color:#7A889C;font-family:var(--font-mono);font-size:12.5px;padding:6px 2px;list-style:none">— Ce modèle n\'a pas listé les points forts (champs "strengths / points_forts" vides). Relance sur un modèle plus grand, ou note tes points forts à la main dans tes notes.</li>') +
    "</ul>" +
    "</div>";

  const axesAmeliorationHTML =
    '<div style="background:#2A2115;border:1px solid #4F3A1B;border-radius:14px;padding:18px 20px">' +
    '<h3 style="margin:0 0 10px;color:#E8A83C;font-size:15px;font-weight:700;font-family:var(--font-sans)">↗ Areas for Improvement</h3>' +
    '<ul style="margin:0;padding-left:18px;list-style:none">' +
    (areasArr.length
      ? areasArr.map((x) => {
          return (
            '<li style="color:#E9DFC6;font-family:var(--font-sans);font-size:14px;line-height:1.55;padding:3px 0;position:relative">' +
            '<span style="position:absolute;left:-16px;top:5px;color:#E8A83C">•</span>' +
            esc(x) +
            "</li>"
          );
        }).join("")
      : '<li style="color:#7A889C;font-family:var(--font-mono);font-size:12.5px;padding:6px 2px;list-style:none">— Aucun "axe d\'amélioration" renvoyé. Cherche Grammar Corrections + Grammar Tips plus bas — ils contiennent déjà la plupart des pistes d\'amélioration (niveau phrase / mot).</li>') +
    "</ul>" +
    "</div>";

  const deuxColonnes =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:0 0 22px">' +
    pointsFortsHTML +
    axesAmeliorationHTML +
    "</div>";

  // Grammar tips · Vocab upgrades — cartes sombres scrollables (maquette) — toujours affichées
  const grammarTips =
    '<div class="panneau-sombre"><h3>Grammar Tips</h3><div class="liste-scroll">' +
    (grammarTipsArr.length
      ? grammarTipsArr.map((g) => (
          '<div class="tip-item">' +
          "<h4>" + esc(g.regle) + "</h4>" +
          (g.exemple ? '<span class="ex">Example: ' + esc(g.exemple) + "</span>" : "") +
          (g.explication ? "<p>" + esc(g.explication) + "</p>" : "") +
          "</div>"
        )).join("")
      : '<div style="padding:14px 14px;border-radius:10px;background:#131C27;border:1px dashed #2A3544;color:#7A889C;font-family:var(--font-mono);font-size:12.5px;line-height:1.6">ℹ️ Ce modèle (' + esc(r._meta?.model_used || "LLM") + ') n\'a pas généré de conseils grammaire structurés. Cherche les clés "grammar_tips / conseils_grammaire / astuces_grammaire". Les Grammar Corrections ci-dessus contiennent déjà les pistes principales — ou utilise un modèle plus grand.</div>') +
    "</div></div>";

  const vocabUpgrades =
    '<div class="panneau-sombre"><h3>Vocabulary Upgrades</h3><div class="liste-scroll">' +
    (vocabArr.length
      ? vocabArr.map((v) => (
          '<div class="vocab-item">' +
          '<div class="paire-pilules">' +
          '<span class="pilule pilule-avant">' + esc(v.original) + "</span>" +
          '<span class="fleche">→</span>' +
          '<span class="pilule pilule-apres">' + esc(v.suggestion) + "</span>" +
          "</div>" +
          (v.explication ? "<p>" + esc(v.explication) + "</p>" : "") +
          "</div>"
        )).join("")
      : '<div style="padding:14px 14px;border-radius:10px;background:#131C27;border:1px dashed #2A3544;color:#7A889C;font-family:var(--font-mono);font-size:12.5px;line-height:1.6">ℹ️ Ce modèle (' + esc(r._meta?.model_used || "LLM") + ') n\'a pas renvoyé d\'améliorations de vocabulaire. Cherche les clés "vocabulary_upgrades / améliorations_vocabulaire / améliorations_lexicales". Relance sur un modèle plus grand (claude-sonnet, gpt-4o).</div>') +
    "</div></div>";

  const examples =
    '<div class="bloc"><h3>📝 Example Responses — B1 · B2 · C1</h3>' +
    (exemplesArr.length
      ? exemplesArr.map((ex) => (
          '<div style="margin-bottom:14px">' +
          '<h4 style="margin:0 0 6px;color:var(--color-encre-2);font-family:var(--font-mono);font-size:11px;letter-spacing:.12em">' +
          "NIVEAU " + esc(ex.niveau) + "</h4>" +
          '<div class="modele" style="font-family:var(--font-serif);font-size:14px;line-height:1.65;white-space:pre-wrap">' +
          esc(ex.texte) +
          "</div></div>"
        )).join("")
      : '<div style="padding:14px 14px;border-radius:10px;border:1px dashed #C9BFA3;background:#F5EFE0;color:#7A6F55;font-family:var(--font-mono);font-size:12.5px;line-height:1.6">ℹ️ Ce modèle (' + esc(r._meta?.model_used || "LLM") + ') n\'a pas généré de réponses modèles. Cherche les clés "example_responses / exemples_réponse / modèles_réponse / réponses_exemple". Relance sur un modèle plus grand.</div>') +
    "</div>";

  // ===== HTML FINAL — ORDRE EXACT DE LA MAQUETTE (palette sombre bureau profond) =====
  // Couleurs reference exact screenshot: dark wrapper #0E141B, cartes #18222E corrigé/forces #14261F axes #2A2115 rails verts 2FA671→3CCF91
  // Variables CSS cascade override: swap les classes .badge .note-grande du theme papier → theme sombre en 1 wrapper
  const overrideClairSurSombreVars =
    "--color-encre:#F0EBD6;" +
    "--color-encre-2:#C9D4E8;" +
    "--color-encre-3:#8492A4;" +
    "--color-vert:#3CCF91;" +
    "--color-vert-fond:rgba(60,207,145,.11);" +
    "--color-rouge:#EF8FA0;" +
    "--color-rouge-fond:rgba(239,143,160,.11);" +
    "--color-ambre:#E8A83C;" +
    "--color-ambre-fond:rgba(232,168,60,.12);";
  const html =
    // WRAPPER GLOBAL carte sombre (contient titre + KPIs + toutes sections → couleur fond #0E141B bureau profond)
    '<div style="background:#0E141B;color:#F0EBD6;border-radius:16px;overflow:hidden;' +
    'background-image:radial-gradient(ellipse at 15% -10%, #1C2935 0%, transparent 60%),radial-gradient(ellipse at 100% 100%, #162526 0%, transparent 50%)' +
    '">' +

    // 0. Titre (palette sombre)
    '<div style="padding:16px 22px 4px;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:baseline;justify-content:space-between">' +
    '<h2 style="margin:0;font-family:var(--font-serif);font-size:19px;color:#F0EBD6">' +
    "Correction · " +
    esc(TACHES[tacheActive].titre) +
    '</h2>' +
    '<span style="font-family:var(--font-mono);font-size:10px;letter-spacing:.12em;color:#8492A4">' +
    (r.erreurs || []).length +
    " erreurs · " +
    esc(r._meta?.model_used || "") +
    "</span>" +
    "</div>" +

    // Header note/20 + KPIs badges (cascade variables sombres)
    '<div class="note-bloc" style="margin-top:4px;border-bottom-color:rgba(255,255,255,.06);' + overrideClairSurSombreVars + '">' +
    '<div class="note-grande" style="border-right-color:rgba(255,255,255,.06)"><div class="val">' +
    note +
    '<small style="color:#8492A4">/20</small></div><div class="lbl" style="color:#8492A4">note TCF /20</div></div>' +
    '<div class="badges">' +
    // Badge 1 : Sur 100 (placeholder pointillé si absent → pointillé gris sombre)
    '<div class="badge" style="min-width:118px;border-color:rgba(255,255,255,.09);background:rgba(255,255,255,.03);' +
    (score100Existe ? '' : 'border:1px dashed #4A5568;opacity:.92') +
    '"><div class="k">Sur 100</div><div class="v">' +
    score100 +
    " / 100</div></div>" +
    // Badge 2 : CECRL — CALCULÉ IMPÉRATIVEMENT depuis note20 (JAMAIS r.cecrl) ; ALERTE ROUGE POINTILLÉE si LLM a triché
    '<div class="badge" style="border-color:rgba(255,255,255,.09);background:rgba(255,255,255,.03);' +
    (CECRL(Math.max(0, Math.min(20, Math.round(r.note20 || 0)))) === r.cecrl ? '' : 'border:1.5px dashed #E05252 !important;box-shadow:0 0 0 3px rgba(224,82,82,.08)') +
    '"><div class="k" style="' + (CECRL(Math.max(0, Math.min(20, Math.round(r.note20 || 0)))) === r.cecrl ? '' : 'color:#E05252') + '">CECRL</div><div class="v">' +
    esc(CECRL(Math.max(0, Math.min(20, Math.round(note))))) +
    "</div></div>" +
    // Badge 3 : NCLC / CLB
    '<div class="badge ' +
    (atteint7 ? "cible-atteinte" : "cible-manquée") +
    '" style="' +
    (atteint7 ? 'border-color:rgba(60,207,145,.35);background:rgba(60,207,145,.08)' : 'border-color:rgba(239,143,160,.35);background:rgba(239,143,160,.07)') +
    ';' + nclcPh + '"><div class="k">NCLC / CLB</div><div class="v">' +
    esc(nclcAffiche) +
    "</div></div>" +
    // Badge 4 : Longueur (ligne 2 cible min–max sous-texte sombre)
    '<div class="badge ' +
    longueurClasse +
    '" style="' +
    (longueurOK ? 'border-color:rgba(255,255,255,.09);background:rgba(255,255,255,.03)' : 'border-color:rgba(239,143,160,.35);background:rgba(239,143,160,.07)') +
    '"><div class="k">Longueur</div><div class="v">' +
    nbMotsCopie +
    " mots</div>" +
    '<div style="font-size:10px;color:#8492A4;margin-top:2px;letter-spacing:.04em">cible ' +
    t.min +
    "–" +
    t.max +
    "</div></div>" +
    // Badge 5 : Objectif — wording hiérarchique + palette sombre ok/ko
    '<div class="badge ' +
    objectifClasse +
    '" style="' +
    (objectifClasse === 'cible-atteinte' ? 'border-color:rgba(60,207,145,.35);background:rgba(60,207,145,.09)' :
      objectifClasse === 'cible-manquée' ? 'border-color:rgba(239,143,160,.35);background:rgba(239,143,160,.07)' :
      'border-color:rgba(255,255,255,.09);background:rgba(255,255,255,.03)') +
    '"><div class="k">Objectif</div><div class="v">' +
    objectifTexte +
    "</div></div>" +
    "</div></div>" +

    // PADDING CONTENEUR GLOBAL — fond sombre bureau #0E141B transparent (hérite du wrapper)
    '<div style="padding:10px 22px 28px;background:transparent;' + overrideClairSurSombreVars + '">' +

    // 1. Score Breakdown (toujours affiché, placeholder rayé + bannière ambre si modèle petit)
    '<div style="background:#18222E;border:1px solid #2A3544;border-radius:14px;padding:20px 22px;margin:0 0 22px;' + breakdownStylePlaceholder + '">' +
    '<h3 style="margin:0 0 14px;color:#F0EBD6;font-family:var(--font-sans);font-size:15.5px;font-weight:700">Score Breakdown</h3>' +
    (breakdownExiste ? "" : '<div style="margin:-4px 0 12px;padding:10px 12px;border-radius:8px;background:rgba(217,159,42,.1);border:1px dashed #C77A00;color:#E9A432;font-family:var(--font-mono);font-size:12px;line-height:1.55">ℹ️ Score Breakdown non fourni par le LLM — utiliser un modèle plus grand (claude-sonnet / gpt-4o) pour obtenir les 5 rails Grammar/Vocab/Coherence/Task/Style.</div>') +
    breakdownHTML +
    "</div>" +

    // 2. Feedback
    feedbackCard +
    // 3. Your Response
    votreCopie +
    // 4. Corrected Version
    correctedCard +
    // 5. Strengths | Areas for Improvement (2 colonnes)
    deuxColonnes +

    // 6. Verdict → carte sombre (ex-papier)
    (r.verdict
      ? '<div style="background:#18222E;border:1px solid #2A3544;border-radius:14px;padding:20px 22px;margin:0 0 22px">' +
        '<h3 style="margin:0 0 12px;color:#D7E3F5;font-family:var(--font-sans);font-size:15px;font-weight:700">Verdict du correcteur</h3>' +
        '<p style="margin:0;color:#C9D4E8;font-family:var(--font-serif);font-size:16px;line-height:1.65">' +
        esc(r.verdict) +
        "</p></div>"
      : "") +

    // 7. Critères barème 5 × /5 (ex .criteres papier → carte sombre, rails vert/rouge/ambre + textes clair)
    (crit ?
      '<div style="background:#18222E;border:1px solid #2A3544;border-radius:14px;padding:20px 22px;margin:0 0 22px">' +
      '<h3 style="margin:0 0 14px;color:#F0EBD6;font-family:var(--font-sans);font-size:15px;font-weight:700">Barème TCF — 5 critères / 20</h3>' +
      crit.replace(/class="critere"/g, 'style="margin-bottom:14px"')
          .replace(/class="nom"/g, 'style="font-weight:600;font-size:13.5px;color:#E7E3D6"')
          .replace(/class="sc"/g, 'style="font-family:var(--font-mono);font-size:12px;color:#93A0B3"')
          .replace(/style="height:7px;border-radius:4px;background:rgba(26, 35, 48, 0.1);margin:6px 0 5px;overflow:hidden"/g,
            'style="height:8px;border-radius:999px;background:#25323F;margin:7px 0 6px;overflow:hidden"')
          .replace(/style="margin:0;font-size:12.5px;color:var\(--color-encre-2\);line-height:1.5"/g,
            'style="margin:0;font-size:12.5px;color:#93A0B3;line-height:1.55"') +
      "</div>"
      : "") +

    // 8. Grammar Tips · Vocab Upgrades · Grammar Corrections → déjà panneau-sombre (✓ ok)
    grammarTips +
    vocabUpgrades +
    grammarCorrections +

    // 9. Example Responses B1/B2/C1 (ex .bloc.papier → 3 cartes sombres séparées distinctes par niveau, B1+B2 fond #18222E, C1 fond vert #14261F)
    '<div style="background:#18222E;border:1px solid #2A3544;border-radius:14px;padding:20px 22px;margin:0 0 22px">' +
    '<h3 style="margin:0 0 16px;color:#F0EBD6;font-family:var(--font-sans);font-size:15.5px;font-weight:700">📝 Example Responses — B1 · B2 · C1</h3>' +
    (exemplesArr.length
      ? exemplesArr.map((ex) => {
          const lv = String(ex.niveau || "").toUpperCase().replace(/\+/g, "");
          const isC = lv.startsWith("C");
          return (
            '<div style="margin-bottom:14px;padding:15px 17px;border-radius:12px;' +
            (isC
              ? 'background:#14261F;border:1px solid #224A3C'
              : 'background:#131C27;border:1px solid #263345') +
            '">' +
            '<h4 style="margin:0 0 8px;' +
            (isC ? 'color:#3CCF91' : 'color:#E8A83C') +
            ';font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;font-weight:700">' +
            "NIVEAU " + esc(ex.niveau) + "</h4>" +
            '<div style="font-family:var(--font-serif);font-size:14.5px;line-height:1.7;white-space:pre-wrap;color:#E5E0CE;background:transparent;padding:0;border:0">' +
            esc(ex.texte) +
            "</div></div>"
          );
        }).join("")
      : '<div style="padding:14px 14px;border-radius:10px;background:#131C27;border:1px dashed #2A3544;color:#8492A4;font-family:var(--font-mono);font-size:12.5px;line-height:1.6">ℹ️ Ce modèle (' + esc(r._meta?.model_used || "LLM") + ') n\'a pas généré de réponses modèles. Cherche les clés "example_responses / exemples_réponse / modèles_réponse / réponses_exemple". Relance sur un modèle plus grand.</div>') +
    "</div>" +

    // 10. Écart NCLC 7 (10–11/20) → carte sombre
    '<div style="background:#18222E;border:1px solid #2A3544;border-radius:14px;padding:20px 22px;margin:0 0 22px">' +
    '<h3 style="margin:0 0 12px;color:#D7E3F5;font-family:var(--font-sans);font-size:15px;font-weight:700">' +
    (atteint7 ? "Consolider le NCLC 7" : "Écart jusqu'au NCLC 7 (10–11/20)") +
    "</h3>" +
    listeGap(r.gap_7)
      .replace(/class="puces"/g, 'style="margin:0;padding-left:18px;color:#C9D4E8;font-size:13.5px"')
      .replace(/<li/g, '<li style="margin-bottom:6px;color:#C9D4E8"')
      .replace(/<h3 style="margin-top:12px">/g,
        '<h3 style="margin:14px 0 10px;color:#E8A83C;font-family:var(--font-mono);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase">') +
    "</div>" +

    // 11. Écart NCLC 8 (12–13/20) → carte verte sombre
    '<div style="background:#14261F;border:1px solid #224A3C;border-radius:14px;padding:20px 22px;margin:0">' +
    '<h3 style="margin:0 0 12px;color:#3CCF91;font-family:var(--font-sans);font-size:15px;font-weight:700">Écart jusqu\'au NCLC 8 (12–13/20)</h3>' +
    listeGap(r.gap_8)
      .replace(/class="puces"/g, 'style="margin:0;padding-left:18px;color:#DCE7E0;font-size:13.5px"')
      .replace(/<li/g, '<li style="margin-bottom:6px;color:#DCE7E0"')
      .replace(/<h3 style="margin-top:12px">/g,
        '<h3 style="margin:14px 0 10px;color:#56C79A;font-family:var(--font-mono);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase">') +
    "</div>" +

    "</div>" +  // fermeture padding sections
    "</div>";    // fermeture wrapper sombre global

  return (
    <section
      className="carte sombre visible"
      id="resultat"
      style={{ background: "transparent", border: "none", boxShadow: "0 10px 40px rgba(0,0,0,.35)", borderRadius: 18, overflow: "hidden" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function ResultatTropCourt({ tacheActive }: { tacheActive: 1 | 2 | 3 }) {
  const t = TACHES[tacheActive];
  return (
    <section className="carte visible" id="resultat">
      <div className="bloc">
        <h3>Copie trop courte</h3>
        <p style={{ margin: 0, fontSize: 13.5 }}>
          Rédigez au moins une trentaine de mots avant de demander la correction.
          La cible pour la {t.titre.toLowerCase()} est de {t.min} à {t.max} mots.
        </p>
      </div>
    </section>
  );
}

export function ResultatChargement() {
  return (
    <section className="carte visible" id="resultat">
      <div className="charge">
        <span className="spin" />
        Le correcteur applique le barème et relève les erreurs.
      </div>
    </section>
  );
}

export function ResultatBrut({
  brut,
  tacheActive,
}: {
  brut: string;
  tacheActive: 1 | 2 | 3;
}) {
  return (
    <section className="carte visible" id="resultat">
      <div className="entete-carte">
        <h2>Correction · {TACHES[tacheActive].titre}</h2>
      </div>
      <div className="bloc">
        <h3>Correction en texte brut</h3>
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 12.5,
            color: "var(--color-encre-2)",
          }}
        >
          Le barème détaillé n'a pas pu être mis en forme, mais voici l'analyse
          telle que le correcteur l'a rédigée.
        </p>
        <div className="modele">{esc(brut)}</div>
      </div>
    </section>
  );
}

export function ResultatErreur({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="carte visible" id="resultat">
      <div className="bloc">
        <h3>La correction n'a pas abouti</h3>
        <p style={{ margin: "0 0 10px", fontSize: 13.5 }}>{esc(message)}</p>
        <p style={{ margin: "0 0 12px", fontSize: 13.5, color: "var(--color-encre-2)" }}>
          Relancez la correction : cette interruption est presque toujours
          passagère.
        </p>
        <button className="bouton principal" onClick={onRetry}>
          Relancer la correction
        </button>
      </div>
    </section>
  );
}

export { motsDe };
