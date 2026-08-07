import { validatePreset } from './timer-logic.mjs';
import {
  getPresets, savePreset, deletePreset, getLastUsedPresetId, setLastUsedPresetId,
} from './presets.mjs';

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

init();
