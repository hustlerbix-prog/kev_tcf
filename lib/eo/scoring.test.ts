import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  levelToNote20,
  note20ToNclc,
  levelFromCriteria,
  applyHardPenalties,
  aggregateFromTaskLevels,
  buildEvaluation,
} from './scoring';
import { calcSpeechMetrics, countQuestions } from './speechMetrics';
import type {
  CriterionId,
  TaskId,
  TaskEvaluation,
  CriterionScore,
  Turn,
} from '@/lib/types/eo';

function mkCritScore(score: number, level: CriterionScore['level'] = 'B2'): CriterionScore {
  return {
    score,
    level,
    evidence: '',
    comment: '',
  };
}

function mkCriteria(uniform: number): Record<CriterionId, CriterionScore> {
  return {
    P1: mkCritScore(uniform),
    P2: mkCritScore(uniform),
    P3: mkCritScore(uniform),
    L1: mkCritScore(uniform),
    L2: mkCritScore(uniform),
    L3: mkCritScore(uniform),
    S1: mkCritScore(uniform),
  };
}

test('R6 — levelToNote20(4.0) toutes tâches confondues → note === 11', () => {
  const note = levelToNote20(4.0);
  assert.equal(note, 11);
});

test('R6b — levelToNote20(3.0) → note === 8 (<7 attendu en contexte pondéré)', () => {
  const note = levelToNote20(3.0);
  assert.equal(note, 8);
});

test('R6c — levelToNote20(5.0) → note === 15 (NCLC 9)', () => {
  const note = levelToNote20(5.0);
  assert.equal(note, 15);
});

test('R6 aggregate — level=4.0 for all tasks → note20===11 approx', () => {
  const taskLevels = { 1: 4.0, 2: 4.0, 3: 4.0 } as Record<TaskId, number>;
  const result = aggregateFromTaskLevels(taskLevels);
  assert.equal(result.note20, 11);
  assert.equal(result.cefr, 'B2');
});

test('R6 aggregate 3.0 → note20===8 (<7 pondéré proche)', () => {
  const taskLevels = { 1: 3.0, 2: 3.0, 3: 3.0 } as Record<TaskId, number>;
  const result = aggregateFromTaskLevels(taskLevels);
  assert.equal(result.note20, 8);
});

test('R6 aggregate 5.0 → note20===15 (NCLC 9)', () => {
  const taskLevels = { 1: 5.0, 2: 5.0, 3: 5.0 } as Record<TaskId, number>;
  const result = aggregateFromTaskLevels(taskLevels);
  assert.equal(result.note20, 15);
  assert.equal(note20ToNclc(result.note20), '9');
});

test('note20ToNclc boundaries', () => {
  assert.equal(note20ToNclc(16), '10+');
  assert.equal(note20ToNclc(20), '10+');
  assert.equal(note20ToNclc(14), '9');
  assert.equal(note20ToNclc(15), '9');
  assert.equal(note20ToNclc(12), '8');
  assert.equal(note20ToNclc(13), '8');
  assert.equal(note20ToNclc(10), '7');
  assert.equal(note20ToNclc(11), '7');
  assert.equal(note20ToNclc(0), '<7');
  assert.equal(note20ToNclc(9), '<7');
});

test('levelFromCriteria uniform=4 → taskLevel pondéré ==4', () => {
  const c = mkCriteria(4);
  for (const t of [1, 2, 3] as TaskId[]) {
    const lv = levelFromCriteria(c, t);
    assert.equal(Math.round(lv * 100) / 100, 4);
  }
});

test('applyHardPenalties: PEN03_zero_tour → tous critères à 0', () => {
  const c = mkCriteria(4);
  const result = applyHardPenalties(1, {
    candidateSpeakingSec: 0,
    silenceSec: 0,
    longestSilenceSec: 0,
    wordsPerMinute: 0,
    turnCount: 0,
    questionsAsked: 0,
    fillerCount: 0,
    lexicalDiversity: 0,
  }, c);
  (['P1','P2','P3','L1','L2','L3','S1'] as CriterionId[]).forEach((id) => {
    assert.equal(result[id].score, 0);
    assert.equal(result[id].level, 'A1_non_atteint');
  });
});

test('applyHardPenalties: PEN01_questions_zero T2 → P1 & P3 min(score, 1)', () => {
  const c = mkCriteria(4);
  const result = applyHardPenalties(2, {
    candidateSpeakingSec: 60,
    examinerSpeakingSec: 30,
    silenceSec: 0,
    longestSilenceSec: 0,
    wordsPerMinute: 120,
    turnCount: 3,
    questionsAsked: 0,
    fillerCount: 0,
    lexicalDiversity: 0.5,
  }, c);
  assert.ok(result.P1.score <= 1);
  assert.ok(result.P3.score <= 1);
});

test('applyHardPenalties: PEN02_trop_peu_parole → L3 score ≤ 2', () => {
  const c = mkCriteria(4);
  const result = applyHardPenalties(1, {
    candidateSpeakingSec: 5,
    examinerSpeakingSec: 60,
    silenceSec: 0,
    longestSilenceSec: 0,
    wordsPerMinute: 60,
    turnCount: 1,
    questionsAsked: 0,
    fillerCount: 0,
    lexicalDiversity: 0.5,
  }, c);
  assert.ok(result.L3.score <= 2);
});

test('R5 tie-break simulation: T2 diff 2.5 ≥ 1.5 → discrepancy flagged', () => {
  const levelA = { 1: 4.0, 2: 2.0, 3: 4.0 } as Record<TaskId, number>;
  const levelB = { 1: 4.0, 2: 4.5, 3: 4.0 } as Record<TaskId, number>;
  type Disc = { task: TaskId; levelA: number; levelB: number };
  const discrepancies: Disc[] = [];
  ([1, 2, 3] as TaskId[]).forEach((t) => {
    const a = levelA[t];
    const b = levelB[t];
    if (Math.abs(a - b) >= 1.5) {
      discrepancies.push({ task: t, levelA: a, levelB: b });
    }
  });
  assert.equal(discrepancies.length, 1);
  assert.equal(discrepancies[0].task, 2);
  assert.equal(discrepancies[0].levelA, 2.0);
  assert.equal(discrepancies[0].levelB, 4.5);
  const tiebreakUsed = discrepancies.length > 0;
  assert.equal(tiebreakUsed, true);
});

test('Speech metrics: countQuestions "Bonjour ? Comment allez-vous ?" → ≥2', () => {
  const text = 'Bonjour ? Comment allez-vous ?';
  const count = countQuestions(text);
  assert.ok(count >= 2, `attendu ≥2, obtenu ${count}`);
});

test('Speech metrics: inversion Est-ce que → count ≥1', () => {
  const text = 'Est-ce que tu as fini ton travail ?';
  const count = countQuestions(text);
  assert.ok(count >= 1);
});

test('Speech metrics: inversion Pourquoi → count ≥1', () => {
  const text = 'Pourquoi tu es en retard aujourd\'hui ?';
  const count = countQuestions(text);
  assert.ok(count >= 1);
});

test('Speech metrics: calcSpeechMetrics → 2 questions + 2 fillers', () => {
  const turns: Turn[] = [
    { role: 'examiner', text: 'Bonjour ! Parlez-moi de vous.', start_ms: 0, end_ms: 3000 },
    { role: 'candidate', text: 'Bonjour ? Comment allez-vous ? euh euh hum je m\'appelle Jean.', start_ms: 4000, end_ms: 14000 },
  ];
  const m = calcSpeechMetrics(turns, { taskDurationSec: 120 });
  assert.ok(m.questionsAsked >= 2, `questionsAsked=${m.questionsAsked} attendu≥2`);
  assert.ok(m.fillerCount >= 2, `fillerCount=${m.fillerCount} attendu≥2`);
  assert.equal(m.turnCount, 1);
});

test('Speech metrics: typeTokenRatio hello hello hello → 1/3 ≈0.33', () => {
  const turns: Turn[] = [
    { role: 'candidate', text: 'hello hello hello', start_ms: 0, end_ms: 5000 },
  ];
  const m = calcSpeechMetrics(turns);
  const expected = 1 / 3;
  assert.ok(
    Math.abs(m.lexicalDiversity - expected) < 0.01,
    `TTR=${m.lexicalDiversity}, attendu ~${expected.toFixed(3)}`
  );
});

test('Speech metrics: speakingSec computed from ms diffs', () => {
  const turns: Turn[] = [
    { role: 'candidate', text: 'un', start_ms: 0, end_ms: 2500 },
    { role: 'examiner', text: 'deux', start_ms: 3000, end_ms: 4000 },
    { role: 'candidate', text: 'trois', start_ms: 5000, end_ms: 8000 },
  ];
  const m = calcSpeechMetrics(turns);
  assert.equal(m.candidateSpeakingSec, 2.5 + 3.0);
  assert.equal(m.examinerSpeakingSec, 1.0);
});

test('Speech metrics: gaps between examiner then candidat > 2s', () => {
  const turns: Turn[] = [
    { role: 'examiner', text: 'question', start_ms: 0, end_ms: 2000 },
    { role: 'candidate', text: 'réponse', start_ms: 8000, end_ms: 12000 },
  ];
  const m = calcSpeechMetrics(turns);
  const gap = (8000 - 2000) / 1000;
  assert.ok(m.silenceSec >= gap - 0.001, `silenceSec=${m.silenceSec} vs gap=${gap}`);
  assert.equal(m.longestSilenceSec, gap);
});

test('buildEvaluation returns valid EoEvaluation with synthesis fields', () => {
  const t1: TaskEvaluation = {
    task: 1,
    criteria: mkCriteria(4),
    taskLevel: 4.0,
    penalties: [],
    errors: [],
    upgrades: [],
  };
  const t2: TaskEvaluation = {
    task: 2,
    criteria: mkCriteria(3),
    taskLevel: 3.0,
    penalties: [],
    errors: [],
    upgrades: [],
  };
  const t3: TaskEvaluation = {
    task: 3,
    criteria: mkCriteria(5),
    taskLevel: 5.0,
    penalties: [],
    errors: [],
    upgrades: [],
  };
  const ev = buildEvaluation([t1, t2, t3]);
  assert.ok(ev.global.levelScore >= 0 && ev.global.levelScore <= 6);
  assert.ok(Number.isInteger(ev.global.note20));
  assert.ok(ev.synthesis.strengths.length >= 3);
  assert.equal(ev.synthesis.topThreeFixes.length, 3);
  assert.equal(typeof ev.synthesis.nextSession.recommendedTask, 'number');
});

test('aggregateFromTaskLevels: targetMet true when note20 >=10', () => {
  const tl = { 1: 4.0, 2: 4.0, 3: 4.0 } as Record<TaskId, number>;
  const r = aggregateFromTaskLevels(tl);
  assert.equal(r.targetMet, true);
  assert.ok(/B2|atteint/i.test(r.gapToTarget) || r.gapToTarget.length > 0);
});

test('aggregateFromTaskLevels: targetMet false when low score', () => {
  const tl = { 1: 2.0, 2: 2.0, 3: 2.0 } as Record<TaskId, number>;
  const r = aggregateFromTaskLevels(tl);
  assert.equal(r.targetMet, false);
  assert.ok(/manque/.test(r.gapToTarget), `gapToTarget="${r.gapToTarget}" doit contenir "manque"`);
});
