import assert from 'node:assert/strict';
import {
  getPresets, savePreset, deletePreset, getLastUsedPresetId, setLastUsedPresetId,
} from './presets.mjs';

class MockStorage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
}

// getPresets on empty storage
{
  const storage = new MockStorage();
  assert.deepEqual(getPresets(storage), []);
}

// savePreset creates a new preset with a generated id
let firstId;
{
  const storage = new MockStorage();
  const saved = savePreset({ name: '12x3/1', rounds: 12, workSeconds: 180, restSeconds: 60 }, storage);
  assert.ok(saved.id);
  firstId = saved.id;
  assert.equal(saved.name, '12x3/1');
  assert.equal(getPresets(storage).length, 1);

  // savePreset with an existing id updates in place, not appends
  const updated = savePreset({ id: firstId, name: '12x3/1 renamed', rounds: 12, workSeconds: 180, restSeconds: 60 }, storage);
  assert.equal(updated.id, firstId);
  const all = getPresets(storage);
  assert.equal(all.length, 1);
  assert.equal(all[0].name, '12x3/1 renamed');
}

// deletePreset removes it and clears lastUsedPresetId if it matched
{
  const storage = new MockStorage();
  const saved = savePreset({ name: 'Temp', rounds: 3, workSeconds: 60, restSeconds: 30 }, storage);
  setLastUsedPresetId(saved.id, storage);
  assert.equal(getLastUsedPresetId(storage), saved.id);

  deletePreset(saved.id, storage);
  assert.deepEqual(getPresets(storage), []);
  assert.equal(getLastUsedPresetId(storage), null);
}

console.log('presets.test.mjs: all assertions passed');
