import { describe, test } from 'node:test';
import assert from 'node:assert';
import { generateIcs, escapeHtml } from '../src/ics-export.js';

describe('escapeHtml', () => {
  test('escapes HTML special characters', (t) => {
    assert.strictEqual(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  test('leaves plain text unchanged', (t) => {
    assert.strictEqual(escapeHtml('Hello world'), 'Hello world');
  });

  test('escapes ampersand', (t) => {
    assert.strictEqual(escapeHtml('A & B'), 'A &amp; B');
  });
});

describe('generateIcs', () => {
  const events = [
    {
      start: new Date('2026-01-15'),
      summary: 'Stegus: Anmeldung — Book appointment',
      description: 'City: Berlin\nBlock: Anmeldung\nStep: Book appointment at Bürgeramt',
    },
    {
      start: new Date('2026-02-01'),
      summary: 'Stegus: Bank account — Open account',
      description: 'City: Berlin\nBlock: Bank account\nStep: Open German bank account',
    },
  ];

  test('produces valid VCALENDAR wrapper', (t) => {
    const ics = generateIcs(events);
    assert.ok(ics.startsWith('BEGIN:VCALENDAR'));
    assert.ok(ics.endsWith('END:VCALENDAR'));
    assert.ok(ics.includes('VERSION:2.0'));
    assert.ok(ics.includes('PRODID:-//Stegus//Arrival Hub//EN'));
  });

  test('includes VEVENT for each event', (t) => {
    const ics = generateIcs(events);
    const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
    assert.strictEqual(veventCount, 2);
    const endCount = (ics.match(/END:VEVENT/g) || []).length;
    assert.strictEqual(endCount, 2);
  });

  test('includes DTSTART with date value', (t) => {
    const ics = generateIcs(events);
    assert.ok(ics.includes('DTSTART;VALUE=DATE:20260115'));
    assert.ok(ics.includes('DTSTART;VALUE=DATE:20260201'));
  });

  test('includes SUMMARY and DESCRIPTION for each event', (t) => {
    const ics = generateIcs(events);
    assert.ok(ics.includes('SUMMARY:Stegus: Anmeldung — Book appointment'));
    assert.ok(ics.includes('DESCRIPTION:City: Berlin'));
  });

  test('escapes special characters in SUMMARY and DESCRIPTION', (t) => {
    const unsafeEvents = [{
      start: new Date('2026-01-15'),
      summary: 'Summary with <script>alert(1)</script>',
      description: 'Description with "quotes" and & ampersand',
    }];
    const ics = generateIcs(unsafeEvents);
    assert.ok(!ics.includes('<script>'));
    assert.ok(ics.includes('&lt;script&gt;'));
    assert.ok(ics.includes('&amp;'));
  });

  test('includes DTSTAMP and UID for each event', (t) => {
    const ics = generateIcs(events);
    assert.ok(ics.match(/DTSTAMP:/));
    assert.ok(ics.match(/UID:/));
  });

  test('empty events array produces valid calendar with no events', (t) => {
    const ics = generateIcs([]);
    assert.ok(ics.startsWith('BEGIN:VCALENDAR'));
    assert.ok(ics.endsWith('END:VCALENDAR'));
    assert.strictEqual(ics.match(/BEGIN:VEVENT/g), null);
  });
});
