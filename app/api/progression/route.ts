import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EssaiExpressionEcrite, ProgressionDashboard, CritereGap, CodeErreur } from "@/lib/types/tcf";
import { NCLC } from "@/lib/llm/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEUIL_NCLC8_NOTE20 = 12;
const SEUIL_PAR_CRITERE_20 = 12; // les 5 critères barème /20 → B2 nécessite 12/20 en moyenne

const LABELS_CRITERES: Record<CritereGap["cle"], string> = {
  grammaire_syntaxe_20: "Grammar & Syntax",
  gamme_vocabulaire_20: "Vocabulary Range",
  coherence_cohesion_20: "Coherence & Cohesion",
  realisation_tache_20: "Task Completion",
  style_registre_20: "Style & Register",
};

const LABELS_CODES: Record<CodeErreur, string> = {
  REG: "Registre tu / vous",
  ORT: "Orthographe · accents a/à où/ou",
  GR: "Grammaire · articles · contractions",
  CONJ: "Conjugaison · temps · accord",
  ESP: "Interférence espagnole · calque",
  LEX: "Lexique pauvre ou répété",
  COH: "Cohérence · connecteurs",
};

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("essais_expression_ecrite")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "DB fetch failed", detail: error.message },
      { status: 500 }
    );
  }

  const tous = (data || []) as EssaiExpressionEcrite[];
  const chrono = [...tous].sort(
    (a, b) =>
      new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );
  const derniers = [...chrono].reverse().slice(0, 10);

  const notes = tous.map((e) => num(e.note_20)).filter((n) => n > 0);
  const score100s = tous.map((e) => num(e.score_100)).filter((n) => n > 0);

  const total = tous.length;
  const moy = notes.length ? notes.reduce((s, n) => s + n, 0) / notes.length : 0;
  const moyArrondie = Math.round(moy * 10) / 10;
  const moy100 = score100s.length
    ? score100s.reduce((s, n) => s + n, 0) / score100s.length
    : moy > 0 ? Math.round((moy / 20) * 1000) / 10 : 0;
  const n7 = notes.filter((n) => n >= 10).length;
  const n8 = notes.filter((n) => n >= SEUIL_NCLC8_NOTE20).length;
  const pct8 = total ? Math.round((n8 / total) * 100) : 0;
  const max = notes.length ? Math.max(...notes) : 0;

  const meilleureParTache = { 1: null as number | null, 2: null as number | null, 3: null as number | null };
  const sommeTache = { 1: 0, 2: 0, 3: 0 };
  const countTache = { 1: 0, 2: 0, 3: 0 };
  tous.forEach((e) => {
    const t = (e.tache_num || 1) as 1 | 2 | 3;
    const n = num(e.note_20);
    if (n > 0) {
      if (meilleureParTache[t] === null || n > (meilleureParTache[t] as number)) {
        meilleureParTache[t] = n;
      }
      sommeTache[t] += n;
      countTache[t] += 1;
    }
  });
  const moyParTache = {
    1: countTache[1] ? Math.round((sommeTache[1] / countTache[1]) * 10) / 10 : 0,
    2: countTache[2] ? Math.round((sommeTache[2] / countTache[2]) * 10) / 10 : 0,
    3: countTache[3] ? Math.round((sommeTache[3] / countTache[3]) * 10) / 10 : 0,
  };

  // Tendance : comparer les notes des 2 derniers tiers vs 2 premiers tiers
  let tendance: ProgressionDashboard["kpis"]["tendance"] = null;
  if (notes.length >= 4) {
    const ordre = chrono.map((e) => num(e.note_20)).filter((n) => n > 0);
    const moitié = Math.floor(ordre.length / 2);
    const prem = ordre.slice(0, moitié);
    const dern = ordre.slice(ordre.length - moitié);
    const mprem = prem.reduce((s, n) => s + n, 0) / prem.length;
    const mdern = dern.reduce((s, n) => s + n, 0) / dern.length;
    const delta = mdern - mprem;
    if (delta > 0.6) tendance = "hausse";
    else if (delta < -0.6) tendance = "baisse";
    else tendance = "stable";
  }

  // Écarts par critère (moyenne par critère /20 vs 12/20 attendu)
  const cles: CritereGap["cle"][] = [
    "grammaire_syntaxe_20",
    "gamme_vocabulaire_20",
    "coherence_cohesion_20",
    "realisation_tache_20",
    "style_registre_20",
  ];
  const sommesCrit: Record<CritereGap["cle"], number> = {
    grammaire_syntaxe_20: 0,
    gamme_vocabulaire_20: 0,
    coherence_cohesion_20: 0,
    realisation_tache_20: 0,
    style_registre_20: 0,
  };
  const countsCrit: Record<CritereGap["cle"], number> = {
    grammaire_syntaxe_20: 0,
    gamme_vocabulaire_20: 0,
    coherence_cohesion_20: 0,
    realisation_tache_20: 0,
    style_registre_20: 0,
  };
  tous.forEach((e) => {
    const sb = e.score_breakdown;
    if (!sb || typeof sb !== "object") return;
    cles.forEach((k) => {
      const v = num((sb as Record<string, unknown>)[k]);
      if (v > 0) {
        sommesCrit[k] += v;
        countsCrit[k] += 1;
      }
    });
  });
  const ecartParCritere: CritereGap[] = cles.map((k) => {
    const moyenne20 = countsCrit[k]
      ? Math.round((sommesCrit[k] / countsCrit[k]) * 10) / 10
      : 0;
    const delta = moyenne20 - SEUIL_PAR_CRITERE_20;
    return {
      cle: k,
      label: LABELS_CRITERES[k],
      seuil_nclc8_20: SEUIL_PAR_CRITERE_20,
      moyenne_20: moyenne20,
      delta_20: Math.round(delta * 10) / 10,
      points_manquants_sur_20: Math.max(0, Math.round(-delta * 10) / 10),
    };
  });

  const ecartGlobal = Math.max(
    0,
    Math.round((SEUIL_NCLC8_NOTE20 - moy) * 10) / 10
  );
  const prochaineCible = moy < SEUIL_NCLC8_NOTE20
    ? Math.min(20, Math.ceil(moy) + (ecartGlobal <= 1 ? ecartGlobal : 1))
    : Math.min(20, SEUIL_NCLC8_NOTE20 + 1);

  // Top manques / actions gap_8
  const freqManques = new Map<string, number>();
  const freqActions = new Map<string, number>();
  tous.forEach((e) => {
    (e.gap_8?.manque || []).forEach((m) =>
      freqManques.set(m, (freqManques.get(m) || 0) + 1)
    );
    (e.gap_8?.actions || []).forEach((a) =>
      freqActions.set(a, (freqActions.get(a) || 0) + 1)
    );
  });
  const topManques = [...freqManques.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([m]) => m);
  const topActions = [...freqActions.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([a]) => a);

  // Codes erreurs les plus fréquents
  const freqCodes = new Map<CodeErreur, number>();
  tous.forEach((e) => {
    (e.erreurs || []).forEach((er) => {
      if (er.code) freqCodes.set(er.code, (freqCodes.get(er.code) || 0) + 1);
    });
  });
  const codesFrequents = [...freqCodes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([code, count]) => ({
      code,
      count,
      label: LABELS_CODES[code] || String(code),
    }));

  const tendancePoints = chrono
    .map((e, i) => ({
      i: i + 1,
      note_20: num(e.note_20),
      nclc: e.nclc || (num(e.note_20) ? NCLC(num(e.note_20)) : undefined),
      created_at: e.created_at,
    }))
    .filter((p) => p.note_20 > 0);

  const dash: ProgressionDashboard = {
    kpis: {
      total_essais: total,
      moyenne_note_20: moyArrondie,
      score_100_moyen: Math.round(moy100 * 10) / 10,
      seuil_nclc7_atteint: n7,
      seuil_nclc8_atteint: n8,
      pourcentage_nclc8: pct8,
      note_max_20: max,
      meilleure_par_tache: meilleureParTache,
      moyenne_par_tache: moyParTache,
      total_par_tache: countTache,
      tendance,
    },
    ecart_nclc8_sur_note_globale: ecartGlobal,
    prochaine_cible_note_20: prochaineCible,
    ecart_par_critere: ecartParCritere,
    derniers_essais: derniers,
    top_manques_gap8: topManques,
    top_actions_gap8: topActions,
    codes_erreurs_les_plus_frequents: codesFrequents,
    tendance_points: tendancePoints,
  };

  return NextResponse.json(dash);
}
