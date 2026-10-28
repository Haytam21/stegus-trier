import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  CITIES, haversine, nearestCity, mergePacks, filterByProfile,
  sortByDependency, isLocked, formatDeadline
} from '../src/data-model.js';

describe('CITIES constant', () => {
  test('has expected cities with coordinates', (t) => {
    const ids = CITIES.map(c => c.id);
    assert.ok(ids.includes('trier'));
    assert.ok(ids.includes('berlin'));
    assert.ok(ids.includes('munich'));
    assert.ok(ids.includes('hamburg'));
  });

  test('every city has id, name, lat, lon, status', (t) => {
    for (const c of CITIES) {
      assert.strictEqual(typeof c.id, 'string');
      assert.strictEqual(typeof c.name, 'string');
      assert.strictEqual(typeof c.lat, 'number');
      assert.strictEqual(typeof c.lon, 'number');
      assert.strictEqual(typeof c.status, 'string');
    }
  });
});

describe('haversine', () => {
  test('distance from a point to itself is 0', (t) => {
    const d = haversine(49.7567, 6.6424, 49.7567, 6.6424);
    assert.strictEqual(d, 0);
  });

  test('distance is symmetric', (t) => {
    const d1 = haversine(49.7567, 6.6424, 52.5200, 13.4050);
    const d2 = haversine(52.5200, 13.4050, 49.7567, 6.6424);
    assert.strictEqual(d1, d2);
  });

  test('returns positive distance for different cities', (t) => {
    const d = haversine(49.7567, 6.6424, 52.5200, 13.4050);
    assert.ok(d > 0);
    assert.ok(d < 1000); // Trier to Berlin is ~500km
  });
});

describe('nearestCity', () => {
  test('returns the closest city by haversine distance', (t) => {
    // Frankfurt is roughly between Trier and Berlin, closer to Trier
    const nearest = nearestCity(50.1109, 8.6821);
    assert.ok(nearest.id === 'trier' || nearest.id === 'berlin');
  });

  test('returns a city object with id and name', (t) => {
    const nearest = nearestCity(52.5200, 13.4050); // Berlin coordinates
    assert.strictEqual(nearest.id, 'berlin');
    assert.strictEqual(nearest.name, 'Berlin');
  });
});

describe('mergePacks', () => {
  const national = {
    pack_id: 'national-2026q4-v0',
    national_baseline: [
      { id: 'scam-warnings', title: { en: 'Scam warnings' }, steps: [] },
      { id: 'bank-account', title: { en: 'Bank account' }, steps: [] },
    ],
  };

  test('returns national baseline when overlay is empty', (t) => {
    const overlay = { city_overlay: [] };
    const merged = mergePacks(national, overlay);
    assert.strictEqual(merged.length, 2);
    assert.strictEqual(merged[0].id, 'scam-warnings');
    assert.strictEqual(merged[1].id, 'bank-account');
  });

  test('overlay block replaces national block with same id', (t) => {
    const overlay = {
      city_overlay: [
        { id: 'bank-account', title: { en: 'Bank account (Berlin)' }, steps: [] },
      ],
    };
    const merged = mergePacks(national, overlay);
    assert.strictEqual(merged.length, 2);
    const bank = merged.find(b => b.id === 'bank-account');
    assert.strictEqual(bank.title.en, 'Bank account (Berlin)');
  });

  test('overlay block with new id is appended', (t) => {
    const overlay = {
      city_overlay: [
        { id: 'anmeldung', title: { en: 'Anmeldung' }, steps: [], city_only: true },
      ],
    };
    const merged = mergePacks(national, overlay);
    assert.strictEqual(merged.length, 3);
    assert.ok(merged.find(b => b.id === 'anmeldung'));
  });

  test('does not mutate input arrays', (t) => {
    const overlay = { city_overlay: [] };
    const before = [...national.national_baseline];
    mergePacks(national, overlay);
    assert.deepStrictEqual(national.national_baseline, before);
  });
});

describe('filterByProfile', () => {
  const blocks = [
    { id: 'scam-warnings', title: { en: 'Scam warnings' } },
    { id: 'residence-permit', title: { en: 'Residence permit' } },
    { id: 'bank-account', title: { en: 'Bank account' } },
  ];

  test('non-EU users see all blocks', (t) => {
    const result = filterByProfile(blocks, false);
    assert.strictEqual(result.length, 3);
  });

  test('EU users do not see residence-permit', (t) => {
    const result = filterByProfile(blocks, true);
    assert.strictEqual(result.length, 2);
    assert.ok(result.find(b => b.id === 'scam-warnings'));
    assert.ok(result.find(b => b.id === 'bank-account'));
    assert.ok(!result.find(b => b.id === 'residence-permit'));
  });

  test('does not mutate input array', (t) => {
    const before = [...blocks];
    filterByProfile(blocks, true);
    assert.deepStrictEqual(blocks, before);
  });
});

describe('sortByDependency', () => {
  const blocks = [
    { id: 'c', title: { en: 'C' }, depends_on: ['b'] },
    { id: 'a', title: { en: 'A' }, depends_on: [] },
    { id: 'b', title: { en: 'B' }, depends_on: ['a'] },
  ];

  test('returns blocks in dependency order', (t) => {
    const result = sortByDependency(blocks);
    const ids = result.map(b => b.id);
    assert.deepStrictEqual(ids, ['a', 'b', 'c']);
  });

  test('blocks with no dependencies come first', (t) => {
    const result = sortByDependency(blocks);
    assert.strictEqual(result[0].id, 'a');
  });

  test('handles empty array', (t) => {
    const result = sortByDependency([]);
    assert.deepStrictEqual(result, []);
  });

  test('does not mutate input array', (t) => {
    const before = [...blocks];
    sortByDependency(blocks);
    assert.deepStrictEqual(blocks, before);
  });

  test('circular dependencies do not infinite-loop', (t) => {
    const circular = [
      { id: 'x', title: { en: 'X' }, depends_on: ['y'] },
      { id: 'y', title: { en: 'Y' }, depends_on: ['x'] },
    ];
    const result = sortByDependency(circular);
    assert.ok(result.length <= 2);
  });
});

describe('isLocked', () => {
  test('block with no dependencies is not locked', (t) => {
    const block = { id: 'a', depends_on: [] };
    const progress = {};
    assert.strictEqual(isLocked(block, progress), false);
  });

  test('block with done dependency is not locked', (t) => {
    const block = { id: 'b', depends_on: ['a'] };
    const progress = { a: 'done' };
    assert.strictEqual(isLocked(block, progress), false);
  });

  test('block with not_done dependency is locked', (t) => {
    const block = { id: 'b', depends_on: ['a'] };
    const progress = { a: 'not_done' };
    assert.strictEqual(isLocked(block, progress), true);
  });

  test('block with missing dependency is locked', (t) => {
    const block = { id: 'b', depends_on: ['a'] };
    const progress = {};
    assert.strictEqual(isLocked(block, progress), true);
  });

  test('block with multiple dependencies: all must be done', (t) => {
    const block = { id: 'c', depends_on: ['a', 'b'] };
    const progress = { a: 'done', b: 'not_done' };
    assert.strictEqual(isLocked(block, progress), true);
  });
});

describe('formatDeadline', () => {
  test('returns empty string when no arrival date', (t) => {
    assert.strictEqual(formatDeadline('', 14), '');
    assert.strictEqual(formatDeadline(null, 14), '');
  });

  test('returns empty string when no deadline days', (t) => {
    assert.strictEqual(formatDeadline('2026-01-01', null), '');
    assert.strictEqual(formatDeadline('2026-01-01', undefined), '');
  });

  test('returns Overdue when deadline is in the past', (t) => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const result = formatDeadline(twoDaysAgo.toISOString().slice(0, 10), 1);
    assert.strictEqual(result, 'Overdue');
  });

  test('returns Due today when deadline is today', (t) => {
    const today = new Date().toISOString().slice(0, 10);
    const result = formatDeadline(today, 0);
    assert.strictEqual(result, 'Due today');
  });

  test('returns Due in N days for future deadline', (t) => {
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    const result = formatDeadline(twoWeeks.toISOString().slice(0, 10), 14);
    assert.ok(result.startsWith('Due in'));
    assert.ok(result.includes('days'));
  });
});
