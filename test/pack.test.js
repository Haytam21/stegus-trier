import { describe, test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const pack = JSON.parse(readFileSync(new URL('../content/packs/trier.json', import.meta.url), 'utf8'));

describe('city pack (trier.json)', () => {
  test('has required top-level fields', (t) => {
    assert.strictEqual(typeof pack.pack_id, 'string');
    assert.strictEqual(typeof pack.city, 'string');
    assert.strictEqual(typeof pack.version, 'string');
    assert.strictEqual(typeof pack.reviewed_on, 'string');
    assert.ok(Array.isArray(pack.locale_set));
    assert.ok(pack.locale_set.length > 0);
    assert.ok(Array.isArray(pack.blocks));
    assert.ok(pack.blocks.length > 0);
  });

  test('pack_id is non-empty', (t) => {
    assert.ok(pack.pack_id.length > 0);
  });

  test('version follows dot-separated numeric format', (t) => {
    assert.match(pack.version, /^\d+\.\d+\.\d+$/);
  });

  test('reviewed_on is a valid ISO date', (t) => {
    const d = new Date(pack.reviewed_on);
    assert.ok(!isNaN(d.getTime()));
    assert.strictEqual(d.toISOString().slice(0, 10), pack.reviewed_on);
  });

  test('locale_set contains at least en', (t) => {
    assert.ok(pack.locale_set.includes('en'));
  });

  test('every block has required fields', (t) => {
    for (const block of pack.blocks) {
      assert.strictEqual(typeof block.id, 'string');
      assert.ok(block.id.length > 0);
      assert.ok(block.title, `block ${block.id} missing title`);
      assert.ok(Array.isArray(block.steps), `block ${block.id} missing steps array`);
      assert.ok(block.steps.length > 0, `block ${block.id} has no steps`);
      assert.strictEqual(typeof block.disclaimer_en, 'string');
      assert.ok(Array.isArray(block.sources));
      assert.ok(Array.isArray(block.estimated_days_window));
      assert.strictEqual(block.estimated_days_window.length, 2);
      assert.ok(block.estimated_days_window[0] <= block.estimated_days_window[1]);
    }
  });

  test('block ids are unique', (t) => {
    const ids = pack.blocks.map(b => b.id);
    assert.strictEqual(new Set(ids).size, ids.length);
  });

  test('every block title is an object with at least en', (t) => {
    for (const block of pack.blocks) {
      assert.ok(typeof block.title === 'object', `block ${block.id} title is not an object`);
      assert.ok(!Array.isArray(block.title), `block ${block.id} title is an array`);
      assert.strictEqual(typeof block.title.en, 'string');
      assert.ok(block.title.en.length > 0);
    }
  });

  test('every step has required fields', (t) => {
    for (const block of pack.blocks) {
      for (const step of block.steps) {
        assert.strictEqual(typeof step.order, 'number');
        assert.strictEqual(typeof step.text_en, 'string');
        assert.ok(step.text_en.length > 0, `block ${block.id} step order ${step.order} missing text_en`);
      }
    }
  });

  test('step orders are sequential starting at 1 within each block', (t) => {
    for (const block of pack.blocks) {
      const orders = block.steps.map(s => s.order).sort((a, b) => a - b);
      for (let i = 0; i < orders.length; i++) {
        assert.strictEqual(orders[i], i + 1, `block ${block.id} step order gap`);
      }
    }
  });

  test('every step has text for each locale in locale_set', (t) => {
    for (const block of pack.blocks) {
      for (const step of block.steps) {
        for (const locale of pack.locale_set) {
          const field = `text_${locale}`;
          assert.ok(field in step, `block ${block.id} step order ${step.order} missing ${field}`);
          assert.strictEqual(typeof step[field], 'string');
          assert.ok(step[field].length > 0, `block ${block.id} step order ${step.order} has empty ${field}`);
        }
      }
    }
  });

  test('disclaimer fields are strings when present', (t) => {
    for (const block of pack.blocks) {
      for (const locale of pack.locale_set) {
        const field = `disclaimer_${locale}`;
        if (field in block) {
          assert.strictEqual(typeof block[field], 'string');
        }
      }
    }
  });

  test('sources are non-empty and start with http(s) when present', (t) => {
    for (const block of pack.blocks) {
      for (const source of block.sources) {
        assert.strictEqual(typeof source, 'string');
        assert.ok(source.length > 0);
        const urlPart = source.split(' ')[0];
        assert.ok(
          urlPart.startsWith('http://') || urlPart.startsWith('https://'),
          `block ${block.id} source does not start with http(s): ${source}`
        );
        try {
          new URL(urlPart);
        } catch (e) {
          assert.fail(`block ${block.id} source URL part is invalid: ${urlPart}`);
        }
      }
    }
  });
});
