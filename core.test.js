import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from './core.js';

test("calendar dates reject rollover and malformed input", () => {
  assert.equal(core.validDate('2024-02-29'), '2024-02-29');
  assert.throws(() => core.validDate('2025-02-29'));
  assert.throws(() => core.validDate('2025-04-31'));
  assert.throws(() => core.validDate('2025-1-01'));
  assert.throws(() => core.validDate('hello'));
  assert.throws(() => core.validDate(null));
  assert.equal(core.validDate('2026-09-10'), '2026-09-10');
  assert.throws(() => core.validDate('2026-13-01'));
});

test("date offsets cross month and year boundaries", () => {
  assert.equal(core.addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(core.addDays('2024-02-29', 1), '2024-03-01');
  assert.equal(core.addDays('2025-01-01', -1), '2024-12-31');
  assert.equal(core.addDays('2025-03-09', 1), '2025-03-10');
  assert.equal(core.addDays('2026-09-10', 0), '2026-09-10');
  assert.throws(() => core.addDays('2026-09-10', 1.5));
  assert.throws(() => core.addDays('2026-09-10', Infinity));
  assert.throws(() => core.addDays('invalid', 1));
});

test("local date keys reflect local clock components", () => {
  const date = new Date(2026, 8, 10, 23, 59);
  assert.equal(core.todayKey(date), '2026-09-10');
  assert.equal(core.todayKey(new Date(2026, 0, 1)), '2026-01-01');
  assert.throws(() => core.todayKey(new Date(NaN)));
  assert.throws(() => core.todayKey('2026-09-10'));
  const result = core.todayKey();
  assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(core.validDate(result), result);
});

