import type {
  EoSessionStateKind,
  TaskId,
  ModeId,
  EoTaskRun,
  Turn,
} from '@/lib/types/eo';

export interface SessionState {
  kind: EoSessionStateKind;
  currentTask: TaskId;
  mode: ModeId;
  remainingMs: number;
  totalMs: number;
  prepRemainingMs: number;
  prepTotalMs: number;
  archetypeId?: string;
  run?: EoTaskRun;
  transcript: Turn[];
  error?: string;
  startedAtMs?: number;
  notes?: string;
  conversationTurn: number;
}

export type SessionAction =
  | {
      type: 'INIT';
      payload: {
        archetypeId?: string;
        task: TaskId;
        mode: ModeId;
        durationSec: number;
        prepSec: number;
      };
    }
  | { type: 'START' }
  | { type: 'PREP_DONE' }
  | { type: 'TICK'; payload: number }
  | { type: 'EXAMINER_SPEAK'; payload: Turn }
  | { type: 'EXAMINER_DONE_SPEAKING' }
  | { type: 'LISTENING_START' }
  | { type: 'CANDIDATE_TEXT'; payload: { text: string; endMs?: number } }
  | { type: 'THINKING' }
  | { type: 'ADVANCE_TASK' }
  | { type: 'TASK_COMPLETE' }
  | { type: 'START_EVAL' }
  | { type: 'EVAL_DONE' }
  | { type: 'RESET' }
  | { type: 'ERROR'; payload: string };

export function createInitialState(): SessionState {
  return {
    kind: 'IDLE',
    currentTask: 1,
    mode: 'drill_text',
    remainingMs: 0,
    totalMs: 0,
    prepRemainingMs: 0,
    prepTotalMs: 0,
    transcript: [],
    conversationTurn: 0,
  };
}

/**
 * Réducteur pur pour la session EO.
 *
 * Règles de transition (Action × État courant → État suivant) :
 *
 * | Action              | IDLE | BRIEFING | PREPARING | EXAMINER_OP | LISTENING | THINKING | EXAMINER_T | TASK_COMP | EVALUATING | REPORT |
 * |---------------------|------|----------|-----------|-------------|-----------|----------|------------|-----------|------------|--------|
 * | INIT                |  ✓   |    ✓     |     ✓     |      ✓      |     ✓     |    ✓     |     ✓      |     ✓     |     ✓      |   ✓    | → IDLE
 * | START               |  ✓   |    —     |     —     |      —      |     —     |    —     |     —      |     —     |     —      |   —    | → PREPARING si prepTotalMs>0 sinon EXAMINER_OPENING
 * | PREP_DONE           |  —   |    —     |     ✓     |      —      |     —     |    —     |     —      |     —     |     —      |   —    | → EXAMINER_OPENING
 * | TICK                |  —   |    —     |     ✓     |      ✓      |     ✓     |    ✓     |     ✓      |     —     |     ✓      |   —    | décrémente; PREPARING→EXAMINER_OP si prep==0; LISTENING/EXAMINER_T→TASK_COMPLETE si remaining==0
 * | EXAMINER_SPEAK      |  —   |    —     |     —     |      ✓      |     ✓     |    —     |     ✓      |     —     |     —      |   —    | push turn → EXAMINER_TURN
 * | EXAMINER_DONE_SPK   |  —   |    —     |     —     |      —      |     —     |    —     |     ✓      |     —     |     —      |   —    | → LISTENING
 * | LISTENING_START     |  —   |    —     |     —     |      ✓      |     —     |    —     |     ✓      |     —     |     —      |   —    | → LISTENING
 * | CANDIDATE_TEXT      |  —   |    —     |     —     |      —      |     ✓     |    —     |     —      |     —     |     —      |   —    | push turn, kind LISTENING
 * | THINKING            |  —   |    —     |     —     |      —      |     ✓     |    —     |     ✓      |     —     |     —      |   —    | → THINKING
 * | ADVANCE_TASK        |  —   |    —     |     —     |      —      |     ✓     |    ✓     |     ✓      |     —     |     —      |   —    | → TASK_COMPLETE
 * | TASK_COMPLETE       |  —   |    —     |     —     |      —      |     ✓     |    ✓     |     ✓      |     ✓     |     —      |   —    | → TASK_COMPLETE
 * | START_EVAL          |  —   |    —     |     —     |      —      |     —     |    —     |     —      |     ✓     |     —      |   —    | → EVALUATING
 * | EVAL_DONE           |  —   |    —     |     —     |      —      |     —     |    —     |     —      |     —     |     ✓      |   —    | → REPORT
 * | RESET               |  ✓   |    ✓     |     ✓     |      ✓      |     ✓     |    ✓     |     ✓      |     ✓     |     ✓      |   ✓    | → IDLE (createInitialState)
 * | ERROR               |  ✓   |    ✓     |     ✓     |      ✓      |     ✓     |    ✓     |     ✓      |     ✓     |     ✓      |   ✓    | champ error=.payload, kind inchangé
 *
 * LÉGENDE : ✓ = autorisé / — = ignoré (sans effet, retour de l'état actuel)
 */
export function eoSessionReducer(
  state: SessionState | undefined,
  action: SessionAction,
): SessionState {
  const current = state ?? createInitialState();

  switch (action.type) {
    case 'INIT': {
      const {
        archetypeId,
        task,
        mode,
        durationSec,
        prepSec,
      } = action.payload;
      const totalMs = durationSec * 1000;
      const prepTotalMs = prepSec * 1000;
      return {
        ...createInitialState(),
        currentTask: task,
        mode,
        archetypeId,
        remainingMs: totalMs,
        totalMs,
        prepRemainingMs: prepTotalMs,
        prepTotalMs,
      };
    }

    case 'START': {
      if (current.kind !== 'IDLE') return current;
      const nextKind: EoSessionStateKind =
        current.prepTotalMs > 0 ? 'PREPARING' : 'EXAMINER_OPENING';
      return {
        ...current,
        kind: nextKind,
      };
    }

    case 'PREP_DONE': {
      if (current.kind !== 'PREPARING') return current;
      return {
        ...current,
        kind: 'EXAMINER_OPENING',
        prepRemainingMs: 0,
      };
    }

    case 'TICK': {
      const elapsed = action.payload;
      if (elapsed <= 0) return current;

      const canTickMain =
        current.kind === 'PREPARING' ||
        current.kind === 'EXAMINER_OPENING' ||
        current.kind === 'LISTENING' ||
        current.kind === 'THINKING' ||
        current.kind === 'EXAMINER_TURN' ||
        current.kind === 'EVALUATING';

      if (!canTickMain) return current;

      const remainingMs = Math.max(0, current.remainingMs - elapsed);
      let prepRemainingMs = current.prepRemainingMs;
      if (current.kind === 'PREPARING') {
        prepRemainingMs = Math.max(0, prepRemainingMs - elapsed);
      }

      let nextKind: EoSessionStateKind = current.kind;

      if (current.kind === 'PREPARING' && prepRemainingMs === 0) {
        nextKind = 'EXAMINER_OPENING';
      }

      if (
        (current.kind === 'LISTENING' ||
          current.kind === 'EXAMINER_TURN' ||
          current.kind === 'THINKING') &&
        remainingMs === 0
      ) {
        nextKind = 'TASK_COMPLETE';
      }

      return {
        ...current,
        remainingMs,
        prepRemainingMs,
        kind: nextKind,
      };
    }

    case 'EXAMINER_SPEAK': {
      const canSpeak =
        current.kind === 'EXAMINER_OPENING' ||
        current.kind === 'LISTENING' ||
        current.kind === 'EXAMINER_TURN';
      if (!canSpeak) return current;
      return {
        ...current,
        kind: 'EXAMINER_TURN',
        transcript: [...current.transcript, action.payload],
      };
    }

    case 'EXAMINER_DONE_SPEAKING': {
      if (current.kind !== 'EXAMINER_TURN') return current;
      return {
        ...current,
        kind: 'LISTENING',
      };
    }

    case 'LISTENING_START': {
      const canStart =
        current.kind === 'EXAMINER_OPENING' ||
        current.kind === 'EXAMINER_TURN';
      if (!canStart) return current;
      return {
        ...current,
        kind: 'LISTENING',
      };
    }

    case 'CANDIDATE_TEXT': {
      if (current.kind !== 'LISTENING') return current;
      const { text, endMs } = action.payload;
      const lastTurn = current.transcript[current.transcript.length - 1];
      const startMs = lastTurn ? lastTurn.end_ms : 0;
      const turn: Turn = {
        role: 'candidate',
        text,
        start_ms: startMs,
        end_ms: endMs ?? startMs,
      };
      return {
        ...current,
        transcript: [...current.transcript, turn],
      };
    }

    case 'THINKING': {
      const canThink =
        current.kind === 'LISTENING' || current.kind === 'EXAMINER_TURN';
      if (!canThink) return current;
      return {
        ...current,
        kind: 'THINKING',
      };
    }

    case 'ADVANCE_TASK':
    case 'TASK_COMPLETE': {
      const canComplete =
        current.kind === 'LISTENING' ||
        current.kind === 'THINKING' ||
        current.kind === 'EXAMINER_TURN' ||
        current.kind === 'TASK_COMPLETE';
      if (!canComplete) return current;
      return {
        ...current,
        kind: 'TASK_COMPLETE',
        conversationTurn:
          action.type === 'ADVANCE_TASK'
            ? current.conversationTurn + 1
            : current.conversationTurn,
      };
    }

    case 'START_EVAL': {
      if (current.kind !== 'TASK_COMPLETE') return current;
      return {
        ...current,
        kind: 'EVALUATING',
      };
    }

    case 'EVAL_DONE': {
      if (current.kind !== 'EVALUATING') return current;
      return {
        ...current,
        kind: 'REPORT',
      };
    }

    case 'RESET': {
      return createInitialState();
    }

    case 'ERROR': {
      return {
        ...current,
        error: action.payload,
      };
    }

    default:
      return current;
  }
}
