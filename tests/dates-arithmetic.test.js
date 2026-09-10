import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

test('addDays crosses month and year boundaries in UTC', () => {
  assert.equal(core.addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(core.addDays('2025-12-31', 1), '2026-01-01');
  assert.equal(core.addDays('2026-02-28', 1), '2026-03-01');
  assert.equal(core.addDays('2026-03-01', -1), '2026-02-28');
});
