const PRESETS_KEY = 'presets';
const LAST_USED_KEY = 'lastUsedPresetId';

function readPresets(storage) {
  const raw = storage.getItem(PRESETS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writePresets(storage, presets) {
  storage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

export function getPresets(storage = globalThis.localStorage) {
  return readPresets(storage);
}

export function savePreset(preset, storage = globalThis.localStorage) {
  const presets = readPresets(storage);
  const id = preset.id || crypto.randomUUID();
  const toSave = { ...preset, id };
  const index = presets.findIndex((p) => p.id === id);
  if (index === -1) {
    presets.push(toSave);
  } else {
    presets[index] = toSave;
  }
  writePresets(storage, presets);
  return toSave;
}

export function deletePreset(id, storage = globalThis.localStorage) {
  const presets = readPresets(storage).filter((p) => p.id !== id);
  writePresets(storage, presets);
  if (getLastUsedPresetId(storage) === id) {
    storage.removeItem(LAST_USED_KEY);
  }
}

export function getLastUsedPresetId(storage = globalThis.localStorage) {
  return storage.getItem(LAST_USED_KEY) || null;
}

export function setLastUsedPresetId(id, storage = globalThis.localStorage) {
  storage.setItem(LAST_USED_KEY, id);
}
