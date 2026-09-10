import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

test('addDays crosses month and year boundaries in UTC', () => {
  assert.equal(core.addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(core.addDays('2025-12-31', 1), '2026-01-01');
  assert.equal(core.addDays('2026-02-28', 1), '2026-03-01');
  assert.equal(core.addDays('2026-03-01', -1), '2026-02-28');
});
test('validDate rejects impossible calendar days', () => {
  assert.equal(core.validDate('2024-02-29'), '2024-02-29');
  assert.throws(() => core.validDate('2025-02-29'), /日期不存在/);
  assert.throws(() => core.validDate('2026-13-01'), /日期不存在/);
  assert.throws(() => core.addDays('2026-09-01', 40000), /日期偏移超出范围/);
});
