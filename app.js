import { validatePreset, formatTime, buildPhaseSequence } from './timer-logic.mjs';
import {
  getPresets, savePreset, deletePreset, getLastUsedPresetId, setLastUsedPresetId,
} from './presets.mjs';
import { playBeep } from './audio.mjs';

const setupScreen = document.getElementById('setup-screen');
const sessionScreen = document.getElementById('session-screen');
const doneScreen = document.getElementById('done-screen');

const presetSelect = document.getElementById('preset-select');
const presetForm = document.getElementById('preset-form');
const nameInput = document.getElementById('preset-name');
const roundsInput = document.getElementById('preset-rounds');
const workInput = document.getElementById('preset-work');
const restInput = document.getElementById('preset-rest');
const errorsEl = document.getElementById('preset-errors');
const deleteBtn = document.getElementById('delete-preset-btn');
const newBtn = document.getElementById('new-preset-btn');
const startBtn = document.getElementById('start-btn');

let presets = [];
let currentEditingId = null;

function showScreen(screen) {
  for (const s of [setupScreen, sessionScreen, doneScreen]) {
    s.classList.toggle('hidden', s !== screen);
  }
}

function refreshPresetSelect() {
  presetSelect.innerHTML = '';
  for (const p of presets) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.rounds}x, ${p.workSeconds}s/${p.restSeconds}s)`;
    presetSelect.appendChild(opt);
  }
}

function loadPresetIntoForm(preset) {
  currentEditingId = preset ? preset.id : null;
  nameInput.value = preset ? preset.name : '';
  roundsInput.value = preset ? preset.rounds : '';
  workInput.value = preset ? preset.workSeconds : '';
  restInput.value = preset ? preset.restSeconds : '';
  errorsEl.textContent = '';
}

function selectedPreset() {
  return presets.find((p) => p.id === presetSelect.value) || null;
}

presetSelect.addEventListener('change', () => {
  loadPresetIntoForm(selectedPreset());
});

newBtn.addEventListener('click', () => {
  loadPresetIntoForm(null);
});

presetForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const candidate = {
    id: currentEditingId,
    name: nameInput.value.trim(),
    rounds: Number(roundsInput.value),
    workSeconds: Number(workInput.value),
    restSeconds: Number(restInput.value),
  };
  const { valid, errors } = validatePreset(candidate);
  if (!valid) {
    errorsEl.textContent = Object.values(errors).join(' ');
    return;
  }
  const saved = savePreset(candidate);
  presets = getPresets();
  refreshPresetSelect();
  presetSelect.value = saved.id;
  loadPresetIntoForm(saved);
});

deleteBtn.addEventListener('click', () => {
  const preset = selectedPreset();
  if (!preset) return;
  deletePreset(preset.id);
  presets = getPresets();
  refreshPresetSelect();
  loadPresetIntoForm(presets[0] || null);
});

function init() {
  presets = getPresets();
  refreshPresetSelect();
  const lastId = getLastUsedPresetId();
  const initial = presets.find((p) => p.id === lastId) || presets[0] || null;
  if (initial) presetSelect.value = initial.id;
  loadPresetIntoForm(initial);
  showScreen(setupScreen);
}

const phaseLabelEl = document.getElementById('phase-label');
const countdownEl = document.getElementById('countdown');
const roundCounterEl = document.getElementById('round-counter');
const skipPrepBtn = document.getElementById('skip-prep-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const doneBackBtn = document.getElementById('done-back-btn');

let sequence = [];
let phaseIndex = 0;
let remainingSeconds = 0;
let intervalId = null;
let isPaused = false;

function phaseLabelText(phase) {
  if (phase.type === 'prep') return 'GET READY';
  if (phase.type === 'round') return 'WORK';
  if (phase.type === 'rest') return 'REST';
  return 'DONE';
}

function enterPhase(phase, { announce = true } = {}) {
  remainingSeconds = phase.seconds;
  phaseLabelEl.textContent = phaseLabelText(phase);
  phaseLabelEl.className = `phase-${phase.type}`;
  countdownEl.textContent = formatTime(remainingSeconds);
  skipPrepBtn.classList.toggle('hidden', phase.type !== 'prep');

  if (phase.type === 'round' || phase.type === 'rest') {
    const totalRounds = sequence.filter((p) => p.type === 'round').length;
    roundCounterEl.textContent = `Round ${phase.roundNumber} / ${totalRounds}`;
  }

  if (announce) playBeep();

  if (phase.type === 'done') {
    stopInterval();
    showScreen(doneScreen);
  }
}

function advancePhase() {
  phaseIndex += 1;
  enterPhase(sequence[phaseIndex]);
}

function tick() {
  remainingSeconds -= 1;
  if (remainingSeconds < 0) {
    advancePhase();
    return;
  }
  countdownEl.textContent = formatTime(remainingSeconds);
}

function startInterval() {
  stopInterval();
  intervalId = setInterval(tick, 1000);
  isPaused = false;
  pauseBtn.textContent = 'Pause';
}

function stopInterval() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

startBtn.addEventListener('click', () => {
  const preset = selectedPreset();
  if (!preset) {
    errorsEl.textContent = 'Select or create a preset first.';
    return;
  }
  setLastUsedPresetId(preset.id);
  sequence = buildPhaseSequence(preset);
  phaseIndex = 0;
  enterPhase(sequence[0], { announce: false });
  showScreen(sessionScreen);
  startInterval();
});

skipPrepBtn.addEventListener('click', () => {
  stopInterval();
  advancePhase();
  if (intervalId === null && phaseIndex < sequence.length - 1) startInterval();
});

pauseBtn.addEventListener('click', () => {
  if (isPaused) {
    startInterval();
  } else {
    stopInterval();
    isPaused = true;
    pauseBtn.textContent = 'Resume';
  }
});

stopBtn.addEventListener('click', () => {
  if (!confirm('End this session?')) return;
  stopInterval();
  showScreen(setupScreen);
});

doneBackBtn.addEventListener('click', () => {
  showScreen(setupScreen);
});

init();
