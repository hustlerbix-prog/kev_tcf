import {
  CRITERION_WEIGHTS,
  TASK_WEIGHTS,
  LEVEL_TO_NOTE_ANCHORS,
  LEVELS,
  type CriterionId,
  type TaskId,
  type EoGlobalResult,
  type TaskEvaluation,
  type EoEvaluation,
  type CriterionScore,
  type CefrLevel,
  type SpeechMetrics,
} from "@/lib/types/eo";

export function levelToNote20(level: number): number {
  const lv = Math.max(0, Math.min(6, level));
  const anchors = LEVEL_TO_NOTE_ANCHORS;
  if (lv <= anchors[0][0]) return anchors[0][1];
  if (lv >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [x0, y0] = anchors[i];
    const [x1, y1] = anchors[i + 1];
    if (lv >= x0 && lv <= x1) {
      const t = (lv - x0) / (x1 - x0);
      const interpolated = y0 + t * (y1 - y0);
      const rounded = Math.round(interpolated);
      return Math.max(0, Math.min(20, rounded));
    }
  }
  return 0;
}

export function note20ToNclc(note20: number): string {
  if (note20 >= 16) return "10+";
  if (note20 >= 14) return "9";
  if (note20 >= 12) return "8";
  if (note20 >= 10) return "7";
  return "<7";
}

export function levelFromCriteria(
  criteria: Record<CriterionId, CriterionScore>,
  task: TaskId
): number {
  const weights = CRITERION_WEIGHTS[task];
  let sum = 0;
  (Object.keys(weights) as CriterionId[]).forEach((k) => {
    const s = criteria[k]?.score ?? 0;
    sum += s * weights[k];
  });
  return Math.max(0, Math.min(6, sum));
}

function cloneDeepCriteria(
  c: Record<CriterionId, CriterionScore>
): Record<CriterionId, CriterionScore> {
  const out = {} as Record<CriterionId, CriterionScore>;
  (Object.keys(c) as CriterionId[]).forEach((k) => {
    out[k] = { ...c[k] };
  });
  return out;
}

export function applyHardPenalties(
  task: TaskId,
  metrics: SpeechMetrics | undefined,
  criteria: Record<CriterionId, CriterionScore>
): Record<CriterionId, CriterionScore> {
  const out = cloneDeepCriteria(criteria);
  const penalties: string[] = [];

  const allIds: CriterionId[] = ["P1", "P2", "P3", "L1", "L2", "L3", "S1"];

  const turnCount = metrics?.turnCount ?? 0;
  if (turnCount === 0) {
    allIds.forEach((cid) => {
      out[cid] = {
        ...out[cid],
        score: 0,
        level: "A1_non_atteint",
      };
    });
    penalties.push("PEN03_zero_tour");
  } else {
    if (task === 2 && (metrics?.questionsAsked ?? 0) === 0) {
      if (out.P1) out.P1.score = Math.min(out.P1.score, 1);
      if (out.P3) out.P3.score = Math.min(out.P3.score, 1);
      penalties.push("PEN01_questions_zero");
    }

    const totalSpeaking =
      (metrics?.candidateSpeakingSec ?? 0) + (metrics?.examinerSpeakingSec ?? 0);
    const threshold = Math.min(30, 0.25 * Math.max(totalSpeaking, 0.0001));
    if ((metrics?.candidateSpeakingSec ?? 0) < threshold) {
      if (out.L3) out.L3.score = Math.min(out.L3.score, 2);
      penalties.push("PEN02_trop_peu_parole");
    }
  }

  const taskDurationSec = (metrics as unknown as { taskDurationSec?: number } | undefined)
    ?.taskDurationSec;
  if (
    typeof taskDurationSec === "number" &&
    (metrics?.candidateSpeakingSec ?? 0) > taskDurationSec * 0.95
  ) {
    if (out.P2) out.P2.score = Math.max(0, out.P2.score - 0.5);
    if (out.S1) out.S1.score = Math.max(0, out.S1.score - 0.5);
    penalties.push("PEN04_trop_long");
  }

  allIds.forEach((cid) => {
    if (out[cid]) {
      out[cid].score = Math.max(0, Math.min(6, out[cid].score));
      if (!Array.isArray((out[cid] as unknown as { penalties?: string[] }).penalties)) {
        (out[cid] as unknown as { penalties: string[] }).penalties = [];
      }
      const existing = (out[cid] as unknown as { penalties: string[] }).penalties;
      penalties.forEach((p) => {
        if (!existing.includes(p)) existing.push(p);
      });
    }
  });

  return out;
}

function cefrFromLevel(levelScore: number): CefrLevel {
  const bands: Array<[number, CefrLevel]> = [
    [6.0, "C2"],
    [5.0, "C1"],
    [4.0, "B2"],
    [3.0, "B1"],
    [2.0, "A2"],
    [1.0, "A1"],
    [0.0, "A1_non_atteint"],
  ];
  for (const [threshold, label] of bands) {
    if (levelScore >= threshold) return label;
  }
  return "A1_non_atteint";
}

function gapToTargetHuman(levelScore: number, note20: number): string {
  const targetNote = 10;
  if (note20 >= targetNote) {
    return "Objectif atteint, bravo !";
  }
  const manquePts = targetNote - note20;
  const cefrActuel = cefrFromLevel(levelScore);
  const cibleCEFR: CefrLevel = "B2";
  const idxActuel = LEVELS.indexOf(cefrActuel);
  const idxCible = LEVELS.indexOf(cibleCEFR);
  if (idxActuel < idxCible) {
    return `Il manque ${manquePts} point${manquePts > 1 ? "s" : ""} pour B2.`;
  }
  return `Il manque ${manquePts} point${manquePts > 1 ? "s" : ""} pour atteindre le seuil.`;
}

export function aggregateFromTaskLevels(
  taskLevels: Record<TaskId, number>
): EoGlobalResult {
  let levelScore = 0;
  (Object.keys(TASK_WEIGHTS) as unknown as TaskId[]).forEach((tid) => {
    const t = Number(tid) as TaskId;
    levelScore += (taskLevels[t] ?? 0) * TASK_WEIGHTS[t];
  });
  levelScore = Math.max(0, Math.min(6, levelScore));
  const note20 = levelToNote20(levelScore);
  const cefr = cefrFromLevel(levelScore);
  const nclc = note20ToNclc(note20);
  const targetMet = note20 >= 10;
  const gapToTarget = gapToTargetHuman(levelScore, note20);
  return { levelScore, note20, cefr, nclc, targetMet, gapToTarget };
}

interface CriterionAcc {
  id: CriterionId;
  score: number;
  evidence: string;
  comment: string;
  occurrences: number;
}

export function buildEvaluation(tasks: TaskEvaluation[]): EoEvaluation {
  const taskLevels = {} as Record<TaskId, number>;
  tasks.forEach((t) => {
    taskLevels[t.task] = t.taskLevel;
  });
  (Object.keys(TASK_WEIGHTS) as unknown as TaskId[]).forEach((tid) => {
    const t = Number(tid) as TaskId;
    if (!(t in taskLevels)) taskLevels[t] = 0;
  });
  const global = aggregateFromTaskLevels(taskLevels);

  const scoresMap = new Map<CriterionId, CriterionAcc>();
  const critIds: CriterionId[] = ["P1", "P2", "P3", "L1", "L2", "L3", "S1"];
  critIds.forEach((cid) => {
    scoresMap.set(cid, { id: cid, score: 0, evidence: "", comment: "", occurrences: 0 });
  });
  tasks.forEach((t) => {
    critIds.forEach((cid) => {
      const cs = t.criteria[cid];
      const acc = scoresMap.get(cid)!;
      if (cs) {
        acc.score += cs.score;
        acc.occurrences += 1;
        if (cs.evidence && cs.evidence.length > acc.evidence.length) {
          acc.evidence = cs.evidence;
          acc.comment = cs.comment || "";
        }
      }
    });
  });
  const avgScores = critIds.map((cid) => {
    const a = scoresMap.get(cid)!;
    return {
      id: cid,
      avg: a.occurrences > 0 ? a.score / a.occurrences : 0,
      evidence: a.evidence,
      comment: a.comment,
    };
  });

  const sortedDesc = [...avgScores].sort((a, b) => b.avg - a.avg);
  const strengthsCandidates = sortedDesc.filter((x) => x.avg >= 4.5);
  const topStrengths = strengthsCandidates.slice(0, 2).map((x) => {
    const ev = x.evidence ? ` : «${x.evidence}»` : "";
    return `${nomCritere(x.id)}${ev}`;
  });
  while (topStrengths.length < 3) topStrengths.push("");
  const strengths = topStrengths;

  const sortedAsc = [...avgScores].sort((a, b) => a.avg - b.avg);
  const topThreeFixes = sortedAsc.slice(0, 3).map((x) => ({
    what: nomCritere(x.id),
    why: x.comment || `Améliorer ${nomCritere(x.id)}.`,
    drill: drillFor(x.id),
  }));

  const finishedTasks = tasks.filter((t) => Array.isArray(t.criteria) || t.criteria);
  let recommendedTask: TaskId = 1;
  let recommendedCategory = "Expression Orale";
  let reason = "Tâche recommandée pour progresser.";
  if (finishedTasks.length > 0) {
    let minLevel = Infinity;
    finishedTasks.forEach((t) => {
      if (t.taskLevel < minLevel) {
        minLevel = t.taskLevel;
        recommendedTask = t.task;
      }
    });
    const catMap: Record<TaskId, string> = {
      1: "Interaction guidée",
      2: "Interaction spontanée",
      3: "Monologue argumenté",
    };
    recommendedCategory = catMap[recommendedTask] || recommendedCategory;
    reason = `Cette tâche a obtenu le niveau le plus bas (${minLevel.toFixed(1)}/6).`;
  }

  return {
    tasks,
    global,
    synthesis: {
      strengths,
      topThreeFixes,
      nextSession: {
        recommendedTask,
        recommendedCategory,
        reason,
      },
    },
  };
}

function nomCritere(cid: CriterionId): string {
  const noms: Record<CriterionId, string> = {
    P1: "Adéquation au rôle / à la situation",
    P2: "Pertinence et richesse du contenu",
    P3: "Cohérence / Structure logique",
    L1: "Correction grammaticale",
    L2: "Richesse du vocabulaire",
    L3: "Maîtrise phonique / Intonation",
    S1: "Intéraction / Écoute active",
  };
  return noms[cid] || cid;
}

function drillFor(cid: CriterionId): string {
  const drills: Record<CriterionId, string> = {
    P1: "Relire la consigne et lister tous les points à traiter avant de parler.",
    P2: "Ajouter un exemple concret + un chiffre ou une anecdote personnelle par argument.",
    P3: "Utiliser la structure Intro → 2 arguments → Conclusion ; ajouter 3 connecteurs (d'abord, ensuite, enfin).",
    L1: "Drill 10 phrases de niveau B2 : accord du participe passé, subjonctif après expression de doute.",
    L2: "Repérer 3 mots génériques (bien, chose, faire) et les remplacer par 3 synonymes précis.",
    L3: "Lire à voix haute un texte de 150 mots en 60 secondes ; enregistrer et réécouter.",
    S1: "Exercice de reformulation : reprendre la question de l'examinateur avant de répondre.",
  };
  return drills[cid] || "Exercice ciblé à définir.";
}
