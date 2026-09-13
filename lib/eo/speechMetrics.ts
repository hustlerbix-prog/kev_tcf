import type { Turn, SpeechMetrics } from "@/lib/types/eo";

const QUESTION_INVERSION =
  /^(?:Est-ce\s+que|Pouvez-vous|Peux-tu|Pourquoi|Comment|Quel|Quels|Quelle|Quelles|Que|Qu'est-ce\s+que|Qui|Où|Quand|Combien|Comment\s+se\s+fait|Est-il\s+vrai\s+que|Ne\s+pensez-vous\s+pas\s+que)\b/i;

export function countQuestions(text: string): number {
  if (!text) return 0;
  const lines = text.split(/\n|(?<=[.!?])\s+(?=[A-ZÀ-Ý])/g).filter((l) => l.trim());
  let count = 0;
  lines.forEach((line) => {
    const l = line.trim();
    if (!l) return;
    if (/\?\s*$/.test(l)) {
      count += 1;
    } else if (QUESTION_INVERSION.test(l)) {
      count += 1;
    }
  });
  return count;
}

const FILLER_RE =
  /\b(euh+|hum+|hein|ben|ouais+|este|bueno|o\s?-?sea|like|you\s?know)\b|(comment\s+dire\s*\?)|(qu'est-ce\s+que\s+c'est\s+déjà)/gi;

function countFillers(text: string): number {
  if (!text) return 0;
  const matches = text.match(FILLER_RE);
  return matches ? matches.length : 0;
}

function lexicalDiversity(text: string): number {
  if (!text) return 0;
  const raw = text.toLowerCase().match(/[a-zàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšž]+/gi) || [];
  const tokens = raw.filter((t) => t.length > 0);
  if (tokens.length === 0) return 0;
  const unique = new Set(tokens.map((t) => t.toLowerCase()));
  const ratio = unique.size / tokens.length;
  return Math.max(0, Math.min(1, ratio));
}

export function calcSpeechMetrics(
  turns: Turn[],
  opts?: { taskDurationSec?: number }
): SpeechMetrics {
  const list = Array.isArray(turns) ? turns : [];
  const candidateTurns = list.filter((t) => t.role === "candidate");
  const examinerTurns = list.filter((t) => t.role === "examiner");

  const candidateSpeakingSec = candidateTurns.reduce((acc, t) => {
    return acc + Math.max(0, (t.end_ms - t.start_ms)) / 1000;
  }, 0);

  const examinerSpeakingSec = examinerTurns.reduce((acc, t) => {
    return acc + Math.max(0, (t.end_ms - t.start_ms)) / 1000;
  }, 0);

  let silenceSec = 0;
  let longestSilenceSec = 0;
  const ordered = [...list].sort((a, b) => a.start_ms - b.start_ms);
  for (let i = 0; i < ordered.length - 1; i++) {
    const cur = ordered[i];
    const nxt = ordered[i + 1];
    if (cur.role === "examiner" && nxt.role === "candidate") {
      const gap = (nxt.start_ms - cur.end_ms) / 1000;
      if (gap > 2) {
        silenceSec += gap;
        if (gap > longestSilenceSec) longestSilenceSec = gap;
      }
    }
  }

  const totalWords = candidateTurns.reduce((acc, t) => {
    const parts = (t.text || "").split(/\s+/).filter((p) => p.length > 0);
    return acc + parts.length;
  }, 0);
  const wordsPerMinute = (60 * totalWords) / Math.max(1, candidateSpeakingSec);

  const turnCount = candidateTurns.length;

  const questionsAsked = candidateTurns.reduce(
    (acc, t) => acc + countQuestions(t.text || ""),
    0
  );

  const fillerCount = candidateTurns.reduce(
    (acc, t) => acc + countFillers(t.text || ""),
    0
  );

  const fullText = candidateTurns.map((t) => t.text || "").join(" ");
  const lexicalDiversityVal = lexicalDiversity(fullText);

  const taskDurationSec = opts?.taskDurationSec ?? 120;

  return {
    candidateSpeakingSec,
    silenceSec,
    longestSilenceSec,
    wordsPerMinute,
    turnCount,
    questionsAsked,
    fillerCount,
    lexicalDiversity: lexicalDiversityVal,
    examinerSpeakingSec,
    taskDurationSec,
  } as unknown as SpeechMetrics;
}
