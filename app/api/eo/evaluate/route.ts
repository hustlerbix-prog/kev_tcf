import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LLMSettings } from "@/lib/types/tcf";
import {
  type CriterionId,
  type TaskId,
  type EoSession,
  type EoEvaluation,
  type TaskEvaluation,
  type CriterionScore,
  type Turn,
  type ErreurEO,
  type UpgradeEO,
} from "@/lib/types/eo";
import { appelOpenRouter } from "@/lib/llm/openrouter";
import { lireJSON } from "@/lib/llm/parser";
import {
  levelFromCriteria,
  applyHardPenalties,
  buildEvaluation,
} from "@/lib/eo/scoring";
import { calcSpeechMetrics } from "@/lib/eo/speechMetrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EVALUATOR_A_PERSONA = "Correcteur standard, tempéré et juste";
const EVALUATOR_B_PERSONA = "Correcteur sévère, exigeant sur la grammaire et la structure";
const EVALUATOR_C_PERSONA = "Correcteur-arbitre, neutre et précis, chargé de départager deux évaluations divergentes";

const CRITERES_PROMPT = `CRITÈRES D'ÉVALUATION EXPRESSION ORALE · 0..6 demi-points :
P1 · Adéquation au rôle / à la situation: répondre à toutes les questions, respecter le scénario
P2 · Pertinence et richesse du contenu: exemples, détails, nuance
P3 · Cohérence / Structure logique: introduction → développement → conclusion; connecteurs
L1 · Correction grammaticale: accords, temps, conjugaison, structures complexes
L2 · Richesse du vocabulaire: registre approprié, variété lexicale, précision
L3 · Maîtrise phonique / Intonation: débit, intelligibilité, prononciation, fluidité
S1 · Intéraction / Écoute active (T2/T3): écoute, relance, ne coupe pas la parole`;

const FORMAT_PROMPT = `FORMAT RÉPONSE JSON UNIQUE (rien hors JSON):
{
  "tasks": [ {
    "task": 1|2|3,
    "criteria": {
      "P1": {"score": X, "level": "B2", "evidence": "citation exacte", "comment": "≤ 220 chars"},
      "P2": {"score": X, "level": "B2", "evidence": "citation exacte", "comment": "≤ 220 chars"},
      "P3": {"score": X, "level": "B2", "evidence": "citation exacte", "comment": "≤ 220 chars"},
      "L1": {"score": X, "level": "B2", "evidence": "citation exacte", "comment": "≤ 220 chars"},
      "L2": {"score": X, "level": "B2", "evidence": "citation exacte", "comment": "≤ 220 chars"},
      "L3": {"score": X, "level": "B2", "evidence": "citation exacte", "comment": "≤ 220 chars"},
      "S1": {"score": X, "level": "B2", "evidence": "citation exacte", "comment": "≤ 220 chars"}
    },
    "taskLevel": 0..6 pondéré,
    "penalties": ["PEN01_questions_zero"],
    "errors": [{"type":"grammaire","heard":"","correction":"","rule":"","cost":"L1","priority":1}],
    "upgrades": [{"said":"","b2":"","why":""}]
  } ],
  "synthesis": {
    "strengths": ["","",""],
    "topThreeFixes": [{"what":"","why":"","drill":""}],
    "nextSession": {"recommendedTask":1,"recommendedCategory":"Environnement","reason":""}
  }
}`;

interface TaskRunInput {
  task: TaskId;
  archetype?: {
    id?: string;
    consigne?: string;
    categorie?: string;
    required_moves?: string[] | null;
    scene_facts?: string[] | null;
    complication?: string | null;
    duration_sec?: number;
  } | null;
  turns: Turn[];
  prep_notes?: string | null;
  metrics?: ReturnType<typeof calcSpeechMetrics> | null;
}

interface EvaluateBody {
  session?: Partial<EoSession>;
  tasks: TaskRunInput[];
}

interface LLMTaskEval {
  task: TaskId;
  criteria: Record<CriterionId, CriterionScore>;
  taskLevel?: number;
  penalties?: string[];
  errors?: ErreurEO[];
  upgrades?: UpgradeEO[];
}

interface LLMResponseShape {
  tasks?: LLMTaskEval[];
  synthesis?: unknown;
}

function systemPromptFor(persona: string, extraContext = ""): string {
  return `Tu es un correcteur officiel TCF Canada · Expression Orale.
Persona : ${persona}.
${extraContext ? extraContext + "\n" : ""}
${CRITERES_PROMPT}

Notes sur la notation :
- score 0..6 avec demi-points autorisés (2.5, 4.0, 5.5…)
- 0 = A1 non atteint ; 1 = A1 ; 2 = A2 ; 3 = B1 ; 4 = B2 ; 5 = C1 ; 6 = C2
- "level" field dans chaque critère = correspondance CECR du score du critère
- "taskLevel" = niveau pondéré de la tâche, recalcule comme Σ criterion_score × weight_criterion_task
- Pour T2 (interaction spontanée), S1 et P1 sont particulièrement importants
- Pour T3 (monologue argumenté), P2 et L3 sont particulièrement importants
- "evidence" = citation EXACTE du candidat, mot pour mot, entre guillemets
- "comment" ≤ 220 caractères, formatif, précis

${FORMAT_PROMPT}

RÉPONDS UNIQUEMENT DU JSON, AUCUN TEXTE AVANT OU APRÈS.`;
}

function buildUserPrompt(body: EvaluateBody): string {
  const lines: string[] = [];
  const sessionMode = body.session?.mode || "full_exam";
  lines.push(`MODE SESSION : ${sessionMode}`);
  lines.push("");
  lines.push(`NOMBRE DE TÂCHES : ${body.tasks.length}`);
  lines.push("");
  body.tasks.forEach((run, idx) => {
    lines.push(`========== TÂCHE ${idx + 1} · T${run.task} ==========`);
    const arch = run.archetype;
    if (arch) {
      lines.push(`CONSIGNE OFFICIELLE : ${arch.consigne || "(consigne absente)"}`);
      if (arch.categorie) lines.push(`CATÉGORIE : ${arch.categorie}`);
      if (Array.isArray(arch.required_moves) && arch.required_moves.length > 0) {
        lines.push(`POINTS À TRAITER (expected moves) :`);
        arch.required_moves.forEach((m, i) => lines.push(`  - ${i + 1}. ${m}`));
      }
      if (Array.isArray(arch.scene_facts) && arch.scene_facts.length > 0) {
        lines.push(`FAITS DE SCÈNE (connus du candidat) :`);
        arch.scene_facts.forEach((f) => lines.push(`  - ${f}`));
      }
      if (arch.complication) {
        lines.push(`COMPLICATION : ${arch.complication}`);
      }
    }
    if (run.prep_notes && run.prep_notes.trim()) {
      lines.push("NOTES DE PRÉPARATION DU CANDIDAT :");
      lines.push(run.prep_notes.trim());
    }
    lines.push("TRANSCRIPT (timings start_ms/end_ms, role, text) :");
    const ordered = [...(run.turns || [])].sort(
      (a, b) => a.start_ms - b.start_ms
    );
    ordered.forEach((t, i) => {
      const startSec = Math.round(t.start_ms / 100) / 10;
      const endSec = Math.round(t.end_ms / 100) / 10;
      lines.push(
        `  [${i + 1}] ${t.role.toUpperCase()} [${startSec}s → ${endSec}s] : ${t.text}`
      );
    });
    lines.push("");
  });
  lines.push("Évalue UNIQUEMENT ce que le candidat a DIT ou ÉCRIT (prep_notes). Ne fais pas d'hallucination.");
  lines.push("Pour chaque ERREUR, fournis 'heard' (verbatim) et 'correction' (version corrigée).");
  return lines.join("\n");
}

function sanitizeCriteria(c: Record<CriterionId, CriterionScore> | undefined | null): Record<CriterionId, CriterionScore> {
  const critIds: CriterionId[] = ["P1", "P2", "P3", "L1", "L2", "L3", "S1"];
  const out = {} as Record<CriterionId, CriterionScore>;
  critIds.forEach((cid) => {
    const raw = c?.[cid];
    const scoreRaw = typeof raw?.score === "number" ? raw.score : 0;
    const score = Math.max(0, Math.min(6, Math.round(scoreRaw * 2) / 2));
    out[cid] = {
      score,
      level: typeof raw?.level === "string" ? (raw.level as CriterionScore["level"]) : "A1_non_atteint",
      evidence: typeof raw?.evidence === "string" ? raw.evidence : "",
      comment: typeof raw?.comment === "string" ? raw.comment.slice(0, 260) : "",
    };
  });
  return out;
}

function normalizeEvalResponse(r: LLMResponseShape | null): LLMTaskEval[] {
  if (!r || !Array.isArray(r.tasks)) return [];
  return r.tasks
    .filter((t) => t && typeof t.task === "number" && [1, 2, 3].includes(t.task))
    .map((t) => ({
      task: t.task as TaskId,
      criteria: sanitizeCriteria(t.criteria),
      taskLevel: typeof t.taskLevel === "number" ? Math.max(0, Math.min(6, t.taskLevel)) : undefined,
      penalties: Array.isArray(t.penalties) ? t.penalties.filter((p) => typeof p === "string") : [],
      errors: Array.isArray(t.errors) ? (t.errors.slice(0, 8) as ErreurEO[]) : [],
      upgrades: Array.isArray(t.upgrades) ? (t.upgrades.slice(0, 4) as UpgradeEO[]) : [],
    }));
}

function taskMap(arr: LLMTaskEval[]): Record<number, LLMTaskEval> {
  const m: Record<number, LLMTaskEval> = {};
  arr.forEach((t) => (m[t.task] = t));
  return m;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function pickMiddle3(a: number, b: number, c: number): number {
  const sorted = [a, b, c].sort((x, y) => x - y);
  return sorted[1];
}

export async function POST(req: Request) {
  let body: EvaluateBody;
  try {
    body = (await req.json()) as EvaluateBody;
  } catch {
    return NextResponse.json({ erreur: "JSON invalide" }, { status: 400 });
  }
  if (!body || !Array.isArray(body.tasks) || body.tasks.length === 0) {
    return NextResponse.json(
      { erreur: "Champs requis : tasks[] (1..3)" },
      { status: 400 }
    );
  }
  if (body.tasks.length > 3) {
    return NextResponse.json(
      { erreur: "Maximum 3 tâches" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: setLlm } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", "llm_main")
    .maybeSingle();

  const llmBase: LLMSettings = (setLlm?.value as LLMSettings | null) ?? {
    provider: "openrouter",
    model: "anthropic/claude-sonnet-4",
    temperature: 0.2,
    max_tokens: 3000,
    top_p: 1,
  };

  const userPrompt = buildUserPrompt(body);
  const systemA = systemPromptFor(EVALUATOR_A_PERSONA);
  const systemB = systemPromptFor(EVALUATOR_B_PERSONA);

  const settingsA: LLMSettings = {
    ...llmBase,
    temperature: 0.2,
    max_tokens: llmBase.max_tokens || 3000,
  };
  const settingsB: LLMSettings = {
    ...llmBase,
    temperature: 0.5,
    max_tokens: llmBase.max_tokens || 3000,
  };

  let evalsA: LLMTaskEval[] = [];
  let evalsB: LLMTaskEval[] = [];
  let evalsC: LLMTaskEval[] = [];

  try {
    const [resA, resB] = await Promise.all([
      appelOpenRouter(userPrompt, settingsA, systemA),
      appelOpenRouter(userPrompt, settingsB, systemB),
    ]);
    evalsA = normalizeEvalResponse(lireJSON<LLMResponseShape>(resA.texte));
    evalsB = normalizeEvalResponse(lireJSON<LLMResponseShape>(resB.texte));
  } catch (e) {
    return NextResponse.json(
      {
        erreur: "Erreur appel LLM (A ou B)",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 502 }
    );
  }

  const mapA = taskMap(evalsA);
  const mapB = taskMap(evalsB);
  const discrepancies: EoEvaluation["discrepancies"] = [];
  let tiebreakUsed = false;
  const needsTiebreakTasks: TaskId[] = [];

  body.tasks.forEach((run) => {
    const taskId = run.task;
    const a = mapA[taskId];
    const b = mapB[taskId];
    if (!a || !b) return;
    const levelA = a.taskLevel ?? levelFromCriteria(a.criteria, taskId);
    const levelB = b.taskLevel ?? levelFromCriteria(b.criteria, taskId);
    if (Math.abs(levelA - levelB) >= 1.5) {
      discrepancies.push({ task: taskId, levelA, levelB });
      needsTiebreakTasks.push(taskId);
    }
  });

  const mapC: Record<number, LLMTaskEval> = {};
  if (needsTiebreakTasks.length > 0) {
    tiebreakUsed = true;
    const extraC = `CAS SPÉCIAL : Deux évaluateurs ont divergé (écart ≥ 1,5 niveau) sur ${needsTiebreakTasks.length} tâche(s). Ta mission : arbitre neutre. Rappelle-toi : ta note sera celle retenue pour les tâches ${needsTiebreakTasks.join(", ")}.`;
    const systemC = systemPromptFor(EVALUATOR_C_PERSONA, extraC);
    const settingsC: LLMSettings = {
      ...llmBase,
      temperature: 0.3,
      max_tokens: llmBase.max_tokens || 3000,
    };
    try {
      const resC = await appelOpenRouter(userPrompt, settingsC, systemC);
      evalsC = normalizeEvalResponse(lireJSON<LLMResponseShape>(resC.texte));
      evalsC.forEach((t) => (mapC[t.task] = t));
    } catch {
      /* fallthrough: keep A/B only */
    }
    needsTiebreakTasks.forEach((taskId) => {
      const disc = discrepancies.find((d) => d.task === taskId);
      if (disc && mapC[taskId]) {
        const c = mapC[taskId];
        const levelC = c.taskLevel ?? levelFromCriteria(c.criteria, taskId);
        disc.levelC = levelC;
      }
    });
  }

  const finalTasks: TaskEvaluation[] = body.tasks.map((run) => {
    const taskId = run.task;
    const a = mapA[taskId];
    const b = mapB[taskId];
    const c = mapC[taskId];

    let chosenCriteria: Record<CriterionId, CriterionScore>;
    let chosenPenalties: string[] = [];
    let chosenErrors: ErreurEO[] = [];
    let chosenUpgrades: UpgradeEO[] = [];

    const fallbackCriteria = (): Record<CriterionId, CriterionScore> =>
      sanitizeCriteria(undefined as unknown as Record<CriterionId, CriterionScore>);

    if (!a && !b) {
      chosenCriteria = fallbackCriteria();
    } else {
      const levelA = a ? a.taskLevel ?? levelFromCriteria(a.criteria, taskId) : -1;
      const levelB = b ? b.taskLevel ?? levelFromCriteria(b.criteria, taskId) : -1;
      const hasTiebreak = c && Math.abs(levelA - levelB) >= 1.5;

      if (hasTiebreak) {
        chosenCriteria = c!.criteria;
        chosenPenalties = c!.penalties || [];
        chosenErrors = c!.errors || [];
        chosenUpgrades = c!.upgrades || [];
      } else if (a && b) {
        const midLevel = (levelA + levelB) / 2;
        if (Math.abs(levelA - midLevel) <= Math.abs(levelB - midLevel)) {
          chosenCriteria = mergeCriteriaAvg(a.criteria, b.criteria);
        } else {
          chosenCriteria = mergeCriteriaAvg(b.criteria, a.criteria);
        }
        chosenCriteria = avgCriteria(a.criteria, b.criteria);
        chosenPenalties = Array.from(new Set([...(a.penalties || []), ...(b.penalties || [])]));
        chosenErrors = [...(a.errors || []), ...(b.errors || [])].slice(0, 8);
        chosenUpgrades = [...(a.upgrades || []), ...(b.upgrades || [])].slice(0, 4);
      } else if (a) {
        chosenCriteria = a.criteria;
        chosenPenalties = a.penalties || [];
        chosenErrors = a.errors || [];
        chosenUpgrades = a.upgrades || [];
      } else {
        chosenCriteria = b!.criteria;
        chosenPenalties = b!.penalties || [];
        chosenErrors = b!.errors || [];
        chosenUpgrades = b!.upgrades || [];
      }
    }

    const archetypeDuration = run.archetype?.duration_sec;
    const metricsIn = run.metrics;
    const metricsComputed =
      metricsIn && typeof metricsIn === "object"
        ? (metricsIn as unknown as ReturnType<typeof calcSpeechMetrics>)
        : calcSpeechMetrics(run.turns || [], {
            taskDurationSec: archetypeDuration ?? 120,
          });

    const penalizedCriteria = applyHardPenalties(taskId, metricsComputed, chosenCriteria);

    const taskLevel = clamp(levelFromCriteria(penalizedCriteria, taskId), 0, 6);

    return {
      task: taskId,
      criteria: penalizedCriteria,
      taskLevel,
      penalties: chosenPenalties,
      errors: chosenErrors,
      upgrades: chosenUpgrades,
    };
  });

  const evaluation = buildEvaluation(finalTasks);
  evaluation.evaluatorApersona = EVALUATOR_A_PERSONA;
  evaluation.evaluatorBpersona = EVALUATOR_B_PERSONA;
  evaluation.tiebreakUsed = tiebreakUsed;
  evaluation.discrepancies = discrepancies;

  return NextResponse.json({
    evaluation,
    evaluatorApersona: EVALUATOR_A_PERSONA,
    evaluatorBpersona: EVALUATOR_B_PERSONA,
    tiebreakUsed,
    discrepancies,
  });
}

function avgCriteria(
  a: Record<CriterionId, CriterionScore>,
  b: Record<CriterionId, CriterionScore>
): Record<CriterionId, CriterionScore> {
  const ids: CriterionId[] = ["P1", "P2", "P3", "L1", "L2", "L3", "S1"];
  const out = {} as Record<CriterionId, CriterionScore>;
  ids.forEach((id) => {
    const sa = a[id]?.score ?? 0;
    const sb = b[id]?.score ?? 0;
    const avg = Math.round(((sa + sb) / 2) * 2) / 2;
    out[id] = {
      score: clamp(avg, 0, 6),
      level: (sa >= sb ? a[id]?.level : b[id]?.level) || "A1_non_atteint",
      evidence: (a[id]?.evidence || b[id]?.evidence || ""),
      comment: (a[id]?.comment || b[id]?.comment || "").slice(0, 260),
    };
  });
  return out;
}

function mergeCriteriaAvg(
  a: Record<CriterionId, CriterionScore>,
  _b: Record<CriterionId, CriterionScore>
): Record<CriterionId, CriterionScore> {
  return a;
}
