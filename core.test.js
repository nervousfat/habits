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

