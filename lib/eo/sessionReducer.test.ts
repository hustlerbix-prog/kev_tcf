import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  eoSessionReducer,
  createInitialState,
  type SessionState,
  type SessionAction,
} from './sessionReducer';
import type { Turn } from '@/lib/types/eo';

function applyChain(
  initial: SessionState | undefined,
  actions: SessionAction[],
): SessionState {
  let state: SessionState = initial ?? createInitialState();
  for (const action of actions) {
    state = eoSessionReducer(state, action);
  }
  return state;
}

test('1. INIT → kind=IDLE, remainingMs=120000', () => {
  const state = eoSessionReducer(undefined, {
    type: 'INIT',
    payload: {
      task: 1,
      mode: 'drill_text',
      durationSec: 120,
      prepSec: 0,
    },
  });
  assert.equal(state.kind, 'IDLE');
  assert.equal(state.remainingMs, 120000);
  assert.equal(state.totalMs, 120000);
  assert.equal(state.prepRemainingMs, 0);
  assert.equal(state.prepTotalMs, 0);
});

test('2. START (no prep) → EXAMINER_OPENING', () => {
  const state = applyChain(undefined, [
    {
      type: 'INIT',
      payload: {
        task: 2,
        mode: 'conversation',
        durationSec: 60,
        prepSec: 0,
      },
    },
    { type: 'START' },
  ]);
  assert.equal(state.kind, 'EXAMINER_OPENING');
  assert.equal(state.prepTotalMs, 0);
});

test('3. START (prep=120s) → PREPARING', () => {
  const state = applyChain(undefined, [
    {
      type: 'INIT',
      payload: {
        archetypeId: 'arc-001',
        task: 2,
        mode: 'full_exam',
        durationSec: 300,
        prepSec: 120,
      },
    },
    { type: 'START' },
  ]);
  assert.equal(state.kind, 'PREPARING');
  assert.equal(state.prepRemainingMs, 120000);
  assert.equal(state.prepTotalMs, 120000);
  assert.equal(state.archetypeId, 'arc-001');
});

test('4. TICK PREPARING 120_000ms → EXAMINER_OPENING', () => {
  const state = applyChain(undefined, [
    {
      type: 'INIT',
      payload: {
        task: 2,
        mode: 'drill_voice',
        durationSec: 180,
        prepSec: 120,
      },
    },
    { type: 'START' },
    { type: 'TICK', payload: 120000 },
  ]);
  assert.equal(state.kind, 'EXAMINER_OPENING');
  assert.equal(state.prepRemainingMs, 0);
  assert.equal(state.remainingMs, 180000 - 120000);
});

test('5. EXAMINER_SPEAK + EXAMINER_DONE_SPEAKING → transcript.length=1, LISTENING', () => {
  const turn: Turn = {
    role: 'examiner',
    text: 'Bonjour, parlez-moi de vous.',
    start_ms: 0,
    end_ms: 5000,
  };
  const state = applyChain(undefined, [
    {
      type: 'INIT',
      payload: {
        task: 1,
        mode: 'drill_text',
        durationSec: 120,
        prepSec: 0,
      },
    },
    { type: 'START' },
    { type: 'EXAMINER_SPEAK', payload: turn },
    { type: 'EXAMINER_DONE_SPEAKING' },
  ]);
  assert.equal(state.transcript.length, 1);
  assert.equal(state.transcript[0]!.text, turn.text);
  assert.equal(state.transcript[0]!.role, 'examiner');
  assert.equal(state.kind, 'LISTENING');
});

test('6. LISTENING + remainingMs 0 via TICK → TASK_COMPLETE', () => {
  const state = applyChain(undefined, [
    {
      type: 'INIT',
      payload: {
        task: 3,
        mode: 'review',
        durationSec: 5,
        prepSec: 0,
      },
    },
    { type: 'START' },
    { type: 'LISTENING_START' },
    { type: 'TICK', payload: 5000 },
  ]);
  assert.equal(state.kind, 'LISTENING');
  assert.equal(state.remainingMs, 0);

  const finalState = eoSessionReducer(state, { type: 'TICK', payload: 1 });
  assert.equal(finalState.kind, 'TASK_COMPLETE');
});

test('7. ADVANCE_TASK → START_EVAL → EVAL_DONE ⇒ REPORT', () => {
  const state = applyChain(undefined, [
    {
      type: 'INIT',
      payload: {
        task: 1,
        mode: 'conversation',
        durationSec: 60,
        prepSec: 0,
      },
    },
    { type: 'START' },
    { type: 'LISTENING_START' },
    { type: 'ADVANCE_TASK' },
    { type: 'START_EVAL' },
    { type: 'EVAL_DONE' },
  ]);
  assert.equal(state.kind, 'REPORT');
  assert.equal(state.conversationTurn, 1);
});

test('bonus: createInitialState retourne un état IDLE valide', () => {
  const s = createInitialState();
  assert.equal(s.kind, 'IDLE');
  assert.equal(s.transcript.length, 0);
  assert.equal(s.remainingMs, 0);
  assert.equal(s.conversationTurn, 0);
  assert.deepEqual(s.transcript, []);
});

test('bonus: ERROR préserve le kind et remplit error', () => {
  const state = applyChain(undefined, [
    {
      type: 'INIT',
      payload: {
        task: 1,
        mode: 'drill_text',
        durationSec: 60,
        prepSec: 0,
      },
    },
    { type: 'START' },
    { type: 'ERROR', payload: 'oups réseau' },
  ]);
  assert.equal(state.error, 'oups réseau');
  assert.equal(state.kind, 'EXAMINER_OPENING');
});

test('bonus: RESET retourne à IDLE', () => {
  const state = applyChain(undefined, [
    {
      type: 'INIT',
      payload: {
        task: 2,
        mode: 'full_exam',
        durationSec: 180,
        prepSec: 60,
      },
    },
    { type: 'START' },
    { type: 'TICK', payload: 30000 },
    { type: 'RESET' },
  ]);
  const fresh = createInitialState();
  assert.equal(state.kind, fresh.kind);
  assert.equal(state.remainingMs, fresh.remainingMs);
  assert.equal(state.transcript.length, 0);
});
