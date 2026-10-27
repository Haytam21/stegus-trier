import { describe, test } from 'node:test';
import assert from 'node:assert';

// Mock localStorage before importing the module under test
globalThis.localStorage = {
  _store: new Map(),
  getItem(k) { return this._store.get(k) ?? null; },
  setItem(k, v) { this._store.set(k, String(v)); },
  removeItem(k) { this._store.delete(k); },
  clear() { this._store.clear(); },
};

const { key, loadProgress, saveProgress } = await import('../src/progress.js');

const PACK_ID = 'trier-2026q4-v0';

describe('progress functions', () => {
  test('key() returns namespaced storage key', (t) => {
    globalThis.localStorage.clear();
    assert.strictEqual(key(PACK_ID, 'anmeldung'), `stegus:${PACK_ID}:anmeldung`);
    assert.strictEqual(key(PACK_ID, 'insurance'), `stegus:${PACK_ID}:insurance`);
  });

  test('loadProgress returns not_done for codes never saved', (t) => {
    globalThis.localStorage.clear();
    const progress = loadProgress(PACK_ID, ['anmeldung', 'insurance', 'taxid']);
    assert.strictEqual(progress.anmeldung, 'not_done');
    assert.strictEqual(progress.insurance, 'not_done');
    assert.strictEqual(progress.taxid, 'not_done');
  });

  test('saveProgress stores done status', (t) => {
    globalThis.localStorage.clear();
    saveProgress(PACK_ID, 'anmeldung', 'done');
    assert.strictEqual(globalThis.localStorage.getItem(key(PACK_ID, 'anmeldung')), 'done');
  });

  test('loadProgress reflects saved done status', (t) => {
    globalThis.localStorage.clear();
    saveProgress(PACK_ID, 'insurance', 'done');
    const progress = loadProgress(PACK_ID, ['anmeldung', 'insurance']);
    assert.strictEqual(progress.anmeldung, 'not_done');
    assert.strictEqual(progress.insurance, 'done');
  });

  test('saveProgress stores not_done status', (t) => {
    globalThis.localStorage.clear();
    saveProgress(PACK_ID, 'taxid', 'not_done');
    assert.strictEqual(globalThis.localStorage.getItem(key(PACK_ID, 'taxid')), 'not_done');
  });

  test('loadProgress treats any non-done value as not_done', (t) => {
    globalThis.localStorage.clear();
    globalThis.localStorage.setItem(key(PACK_ID, 'anmeldung'), 'something-else');
    const progress = loadProgress(PACK_ID, ['anmeldung']);
    assert.strictEqual(progress.anmeldung, 'not_done');
  });

  test('different pack IDs are isolated', (t) => {
    globalThis.localStorage.clear();
    saveProgress(PACK_ID, 'anmeldung', 'done');
    const other = loadProgress('other-pack', ['anmeldung']);
    assert.strictEqual(other.anmeldung, 'not_done');
  });

  test('empty itemCodes returns empty object', (t) => {
    globalThis.localStorage.clear();
    const progress = loadProgress(PACK_ID, []);
    assert.deepStrictEqual(progress, {});
  });
});
