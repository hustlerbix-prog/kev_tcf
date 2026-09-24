export type TaskId = 1 | 2 | 3;

export type ModeId =
  | 'drill_text'
  | 'drill_voice'
  | 'conversation'
  | 'full_exam'
  | 'review';

export type CefrLevel = typeof LEVELS[number];

export const LEVELS = [
  'A1_non_atteint',
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
] as const;

export type SetKind = 'quick' | 'full';

export interface Archetype {
  id: string;
  task: TaskId;
  ordre: number;
  categorie: string;
  consigne: string;
  question_ouverture?: string | null;
  translation_es?: string | null;
  duration_sec: number;
  prep_sec: number;
  set: SetKind;
  required_moves: string[];
  relances: string[];
  examiner_role?: string | null;
  candidate_role?: string | null;
  scene_facts?: string[] | null;
  complication?: string | null;
  lexical_field: string[];
  arguments_pour?: string[] | null;
  arguments_contre?: string[] | null;
  exemples_concrets?: string[] | null;
  connecteurs?: string[] | null;
  plan_4t?: string[] | null;
  cheat_sheet?: Record<string, unknown> | null;
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}

export type EoSessionStateKind =
  | 'IDLE'
  | 'BRIEFING'
  | 'PREPARING'
  | 'EXAMINER_OPENING'
  | 'LISTENING'
  | 'THINKING'
  | 'EXAMINER_TURN'
  | 'TASK_COMPLETE'
  | 'EVALUATING'
  | 'REPORT';

export interface Turn {
  id?: string;
  role: 'examiner' | 'candidate';
  text: string;
  start_ms: number;
  end_ms: number;
  internal_note?: string;
  audio_data_base64?: string | null;
  audio_mime_type?: string | null;
  duration_sec?: number | null;
}

export interface SpeechMetrics {
  candidateSpeakingSec: number;
  silenceSec: number;
  longestSilenceSec: number;
  wordsPerMinute: number;
  turnCount: number;
  questionsAsked: number;
  fillerCount: number;
  lexicalDiversity: number;
  examinerSpeakingSec?: number;
}

export interface EoTaskRun {
  id?: string;
  session_id?: string;
  task: TaskId;
  archetype_id?: string | null;
  overtime_seconds: number;
  prep_notes?: string | null;
  metrics?: SpeechMetrics | null;
  turns: Turn[];
}

export interface EoSession {
  id?: string;
  user_id: string;
  mode: ModeId;
  started_at?: string;
  ended_at?: string | null;
  credits_spent: number;
  tasks: EoTaskRun[];
  evaluation?: EoEvaluation | null;
  incomplete: boolean;
  target_note_20?: number;
}

export type CriterionId = 'P1' | 'P2' | 'P3' | 'L1' | 'L2' | 'L3' | 'S1';

export interface CriterionScore {
  score: number;               // 0..6 with half-points
  level: CefrLevel;
  evidence: string;            // citation littérale du candidat
  comment: string;             // ≤ 220 chars
}

export type ErreurKind =
  | 'grammaire'
  | 'lexique'
  | 'registre'
  | 'prononciation'
  | 'calque'
  | 'structure';

export interface ErreurEO {
  type: ErreurKind;
  heard: string;
  correction: string;
  rule: string;
  es?: string;
  cost: CriterionId;
  priority: 1 | 2 | 3;
}

export interface UpgradeEO {
  said: string;
  b2: string;
  why: string;
}

export interface TaskEvaluation {
  task: TaskId;
  criteria: Record<CriterionId, CriterionScore>;
  taskLevel: number;            // 0..6 pondéré
  penalties: string[];
  errors: ErreurEO[];           // ≤ 8
  upgrades: UpgradeEO[];        // ≤ 4
}

export interface EoGlobalResult {
  levelScore: number;           // 0..6
  note20: number;               // 0..20 entier
  cefr: CefrLevel;
  nclc: string;                 // '10+' | '9' | '8' | '7' | '<7'
  targetMet: boolean;
  gapToTarget: string;
}

export interface EoSynthesis {
  strengths: string[];          // 2..3
  topThreeFixes: { what: string; why: string; drill: string }[];
  nextSession: {
    recommendedTask: TaskId;
    recommendedCategory: string;
    reason: string;
  };
}

export interface EoEvaluation {
  tasks: TaskEvaluation[];
  global: EoGlobalResult;
  synthesis: EoSynthesis;
  evaluatorApersona?: string;
  evaluatorBpersona?: string;
  tiebreakUsed?: boolean;
  discrepancies?: { task: TaskId; levelA: number; levelB: number; levelC?: number }[];
}

export interface ExaminerTurnResult {
  speech: string;
  internalNote: string;
  shouldAdvance: boolean;
}

// Poids par critère × tâche (heuristique documentée §6.3)
export const CRITERION_WEIGHTS: Record<TaskId, Record<CriterionId, number>> = {
  1: { P1: .15, P2: .10, P3: .20, L1: .15, L2: .15, L3: .15, S1: .10 },
  2: { P1: .25, P2: .05, P3: .25, L1: .12, L2: .13, L3: .10, S1: .10 },
  3: { P1: .15, P2: .25, P3: .05, L1: .15, L2: .15, L3: .20, S1: .05 },
};

// Poids entre les 3 tâches (heuristique — non publié par FEI)
export const TASK_WEIGHTS: Record<TaskId, number> = {
  1: 0.25,
  2: 0.35,
  3: 0.40,
};

// Anclajes niveau → note /20 : centre de chaque bande CECR §2.5 officiel
// indices: 0..6 = A1_non_atteint .. C2
export const LEVEL_TO_NOTE_ANCHORS: Array<[number, number]> = [
  [0, 0],
  [1, 1],
  [2, 3.5],
  [3, 7.5],
  [4, 11.5],
  [5, 15.5],
  [6, 19],
];

export type CredentialCosts = Record<Exclude<ModeId, 'review'>, 0 | 1 | 3 | 6>;
export const CREDENTIAL_COSTS: CredentialCosts = {
  drill_text: 0,
  drill_voice: 1,
  conversation: 3,
  full_exam: 6,
};

export type ExaminerStatus = 'écoute' | 'réfléchit' | 'parle' | 'attend' | 'préparation';

export interface ArchetypeSummary {
  id: string;
  task: TaskId;
  categorie: string;
  set: SetKind;
  consigne: string;
  duration_sec: number;
  prep_sec: number;
}
