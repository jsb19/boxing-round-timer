export const PREP_SECONDS = 10;

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function validatePreset({ name, rounds, workSeconds, restSeconds }) {
  const errors = {};
  if (!name || !String(name).trim()) errors.name = 'Name is required.';
  if (!Number.isInteger(rounds) || rounds < 1) errors.rounds = 'Rounds must be a whole number of at least 1.';
  if (!Number.isInteger(workSeconds) || workSeconds < 1) errors.workSeconds = 'Work time must be a whole number of at least 1 second.';
  if (!Number.isInteger(restSeconds) || restSeconds < 0) errors.restSeconds = 'Rest time must be a whole number of at least 0 seconds.';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function buildPhaseSequence({ rounds, workSeconds, restSeconds }) {
  const sequence = [{ type: 'prep', seconds: PREP_SECONDS }];
  for (let roundNumber = 1; roundNumber <= rounds; roundNumber += 1) {
    sequence.push({ type: 'round', seconds: workSeconds, roundNumber });
    if (roundNumber < rounds) {
      sequence.push({ type: 'rest', seconds: restSeconds, roundNumber });
    }
  }
  sequence.push({ type: 'done', seconds: 0 });
  return sequence;
}
