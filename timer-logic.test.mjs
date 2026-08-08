import assert from 'node:assert/strict';
import { PREP_SECONDS, formatTime, validatePreset, buildPhaseSequence } from './timer-logic.mjs';

// formatTime
assert.equal(formatTime(0), '00:00');
assert.equal(formatTime(5), '00:05');
assert.equal(formatTime(65), '01:05');
assert.equal(formatTime(600), '10:00');

// prep countdown is an explicit project requirement: 10 seconds, pinned as a literal
assert.equal(PREP_SECONDS, 10);

// validatePreset
{
  const { valid, errors } = validatePreset({ name: 'Test', rounds: 12, workSeconds: 180, restSeconds: 60 });
  assert.equal(valid, true);
  assert.deepEqual(errors, {});
}
{
  const { valid, errors } = validatePreset({ name: '', rounds: 0, workSeconds: 0, restSeconds: -1 });
  assert.equal(valid, false);
  assert.ok(errors.name);
  assert.ok(errors.rounds);
  assert.ok(errors.workSeconds);
  assert.ok(errors.restSeconds);
}
{
  // restSeconds of 0 is valid (back-to-back rounds), workSeconds of 0 is not
  const { valid } = validatePreset({ name: 'X', rounds: 1, workSeconds: 30, restSeconds: 0 });
  assert.equal(valid, true);
}

// buildPhaseSequence
{
  const seq = buildPhaseSequence({ rounds: 2, workSeconds: 180, restSeconds: 60 });
  assert.equal(seq.length, 5); // prep, round1, rest1, round2, done
  assert.deepEqual(seq[0], { type: 'prep', seconds: PREP_SECONDS });
  assert.deepEqual(seq[1], { type: 'round', seconds: 180, roundNumber: 1 });
  assert.deepEqual(seq[2], { type: 'rest', seconds: 60, roundNumber: 1 });
  assert.deepEqual(seq[3], { type: 'round', seconds: 180, roundNumber: 2 });
  assert.deepEqual(seq[4], { type: 'done', seconds: 0 });
}
{
  // single-round session has no rest at all
  const seq = buildPhaseSequence({ rounds: 1, workSeconds: 60, restSeconds: 30 });
  assert.deepEqual(seq.map((p) => p.type), ['prep', 'round', 'done']);
}

console.log('timer-logic.test.mjs: all assertions passed');
