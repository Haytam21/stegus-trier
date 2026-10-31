import { describe, test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

function loadPack(path) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
}

const national = loadPack('../content/packs/national.json');
const trier = loadPack('../content/packs/trier.json');
const berlin = loadPack('../content/packs/berlin.json');
const munich = loadPack('../content/packs/munich.json');
const hamburg = loadPack('../content/packs/hamburg.json');

const ALL_PACKS = [
  { path: '../content/packs/national.json', pack: national },
  { path: '../content/packs/trier.json', pack: trier },
  { path: '../content/packs/berlin.json', pack: berlin },
  { path: '../content/packs/munich.json', pack: munich },
  { path: '../content/packs/hamburg.json', pack: hamburg },
];

describe('pack schema (all packs)', () => {
  test('every pack has required top-level fields', (t) => {
    for (const { path, pack } of ALL_PACKS) {
      assert.strictEqual(typeof pack.pack_id, 'string', `${path}: pack_id`);
      assert.strictEqual(typeof pack.city, 'string', `${path}: city`);
      assert.strictEqual(typeof pack.version, 'string', `${path}: version`);
      assert.strictEqual(typeof pack.reviewed_on, 'string', `${path}: reviewed_on`);
      assert.ok(Array.isArray(pack.locale_set), `${path}: locale_set`);
      assert.ok(pack.locale_set.length > 0, `${path}: locale_set non-empty`);
      assert.ok(pack.locale_set.includes('en'), `${path}: locale_set includes en`);
      assert.strictEqual(typeof pack.reviewer, 'string', `${path}: reviewer`);
      assert.strictEqual(typeof pack.fallback_to_national, 'boolean', `${path}: fallback_to_national`);
    }
  });

  test('pack_id is non-empty', (t) => {
    for (const { path, pack } of ALL_PACKS) {
      assert.ok(pack.pack_id.length > 0, `${path}: pack_id non-empty`);
    }
  });

  test('version follows dot-separated numeric format', (t) => {
    for (const { path, pack } of ALL_PACKS) {
      assert.match(pack.version, /^\d+\.\d+\.\d+$/, `${path}: version ${pack.version}`);
    }
  });

  test('reviewed_on is a valid ISO date', (t) => {
    for (const { path, pack } of ALL_PACKS) {
      const d = new Date(pack.reviewed_on);
      assert.ok(!isNaN(d.getTime()), `${path}: reviewed_on ${pack.reviewed_on}`);
      assert.strictEqual(d.toISOString().slice(0, 10), pack.reviewed_on, `${path}: reviewed_on format`);
    }
  });

  test('every pack has locale_set including en', (t) => {
    for (const { path, pack } of ALL_PACKS) {
      assert.ok(pack.locale_set.includes('en'), `${path}: locale_set includes en`);
    }
  });

  test('every block has a status field', (t) => {
    for (const { path, pack } of ALL_PACKS) {
      const blocks = pack.national_baseline || pack.city_overlay || [];
      for (const block of blocks) {
        assert.ok(
          block.status === 'verified' || block.status === 'unverified',
          `${path}: block ${block.id} status is ${block.status}`
        );
      }
    }
  });

  test('every block has sources with url, last_verified, status', (t) => {
    for (const { path, pack } of ALL_PACKS) {
      const blocks = pack.national_baseline || pack.city_overlay || [];
      for (const block of blocks) {
        assert.ok(Array.isArray(block.sources), `${path}: block ${block.id} sources`);
        for (const src of block.sources) {
          assert.strictEqual(typeof src.url, 'string', `${path}: block ${block.id} source url`);
          assert.ok(
            src.url.startsWith('http://') || src.url.startsWith('https://'),
            `${path}: block ${block.id} source url ${src.url}`
          );
          assert.ok(
            src.last_verified === null || typeof src.last_verified === 'string',
            `${path}: block ${block.id} source last_verified is null or string`
          );
          assert.ok(
            src.status === 'verified' || src.status === 'unverified',
            `${path}: block ${block.id} source status ${src.status}`
          );
        }
      }
    }
  });
});

describe('national baseline blocks', () => {
  test('has 10 national baseline blocks', (t) => {
    assert.strictEqual(national.national_baseline.length, 10);
  });

  test('block ids are unique within national baseline', (t) => {
    const ids = national.national_baseline.map(b => b.id);
    assert.strictEqual(new Set(ids).size, ids.length);
  });

  test('every block has required fields', (t) => {
    for (const block of national.national_baseline) {
      assert.strictEqual(typeof block.id, 'string');
      assert.ok(block.id.length > 0);
      assert.ok(block.title, `block ${block.id} missing title`);
      assert.ok(typeof block.title === 'object', `block ${block.id} title is object`);
      assert.ok(typeof block.title.en === 'string', `block ${block.id} title.en`);
      assert.ok(Array.isArray(block.steps), `block ${block.id} steps`);
      assert.ok(block.steps.length > 0, `block ${block.id} has steps`);
      assert.ok(typeof block.disclaimer === 'object', `block ${block.id} disclaimer is object`);
      assert.ok(Array.isArray(block.sources), `block ${block.id} sources`);
      assert.ok(Array.isArray(block.estimated_days_window), `block ${block.id} window`);
      assert.strictEqual(block.estimated_days_window.length, 2);
      assert.ok(block.estimated_days_window[0] <= block.estimated_days_window[1]);
      assert.ok(
        block.status === 'verified' || block.status === 'unverified',
        `block ${block.id} status`
      );
      assert.ok(Array.isArray(block.depends_on || []), `block ${block.id} depends_on`);
    }
  });

  test('every block has sources with last_verified and status', (t) => {
    for (const block of national.national_baseline) {
      for (const src of block.sources) {
        assert.strictEqual(typeof src.url, 'string');
        assert.strictEqual(typeof src.last_verified, 'string');
        assert.ok(src.status === 'verified' || src.status === 'unverified');
      }
    }
  });

  test('every step has required fields', (t) => {
    for (const block of national.national_baseline) {
      for (const step of block.steps) {
        assert.strictEqual(typeof step.order, 'number');
        assert.ok(typeof step.text_en === 'string');
        assert.ok(step.text_en.length > 0);
        assert.ok(typeof step.text_de === 'string');
        assert.ok(step.text_de.length > 0);
        assert.ok(typeof step.text_ar === 'string');
        assert.ok(step.text_ar.length > 0);
        assert.ok(Array.isArray(step.what_to_bring || []));
        assert.ok(Array.isArray(step.depends_on || []));
        assert.ok(
          step.deadline_days === null ||
          step.deadline_days === undefined ||
          typeof step.deadline_days === 'number'
        );
      }
    }
  });

  test('step orders are sequential starting at 1 within each block', (t) => {
    for (const block of national.national_baseline) {
      const orders = block.steps.map(s => s.order).sort((a, b) => a - b);
      for (let i = 0; i < orders.length; i++) {
        assert.strictEqual(orders[i], i + 1, `block ${block.id} step order gap`);
      }
    }
  });

  test('dependency chains are valid (all depends_on reference existing block ids)', (t) => {
    const ids = new Set(national.national_baseline.map(b => b.id));
    for (const block of national.national_baseline) {
      for (const dep of block.depends_on || []) {
        assert.ok(ids.has(dep), `block ${block.id} depends on unknown block ${dep}`);
      }
    }
  });

  test('expected block ids are present', (t) => {
    const expected = [
      'scam-warnings', 'residence-permit', 'enrollment', 'blocked-account',
      'bank-account', 'semester-ticket', 'sim-card', 'health-insurance-exemption',
      'liability-insurance', 'rundfunkbeitrag',
    ];
    const ids = national.national_baseline.map(b => b.id);
    for (const e of expected) {
      assert.ok(ids.includes(e), `missing block: ${e}`);
    }
  });
});

describe('city overlay packs', () => {
  test('trier has anmeldung and sunday-emergency overlays', (t) => {
    const ids = trier.city_overlay.map(b => b.id);
    assert.ok(ids.includes('anmeldung'));
    assert.ok(ids.includes('sunday-emergency'));
  });

  test('berlin has anmeldung overlay', (t) => {
    const ids = berlin.city_overlay.map(b => b.id);
    assert.ok(ids.includes('anmeldung'));
  });

  test('munich and hamburg have empty overlays', (t) => {
    assert.strictEqual(munich.city_overlay.length, 0);
    assert.strictEqual(hamburg.city_overlay.length, 0);
  });

  test('overlay blocks have city_only and intent fields', (t) => {
    for (const pack of [trier, berlin]) {
      for (const block of pack.city_overlay) {
        assert.strictEqual(typeof block.city_only, 'boolean');
        assert.ok(
          block.intent === 'guide' || block.intent === 'reference',
          `block ${block.id} intent ${block.intent}`
        );
      }
    }
  });
});

describe('disclaimer locales', () => {
  test('disclaimer is an object with locale keys', (t) => {
    for (const block of national.national_baseline) {
      assert.ok(typeof block.disclaimer.en === 'string');
      assert.ok(block.disclaimer.en.length > 0);
    }
  });
});
