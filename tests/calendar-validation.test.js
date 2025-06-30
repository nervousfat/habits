import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

test('century leap rules and month lengths are validated independently', () => {
  for (const year of [1600, 2000, 2400]) assert.equal(core.validDate(year + '-02-29'), year + '-02-29');
  for (const year of [1700, 1800, 1900, 2100]) assert.throws(() => core.validDate(year + '-02-29'), /不存在/);
  for (const month of ['04', '06', '09', '11']) {
    assert.equal(core.validDate('2025-' + month + '-30'), '2025-' + month + '-30');
    assert.throws(() => core.validDate('2025-' + month + '-31'), /不存在/);
  }
});
test('date strings must be exact and keep their four-digit year', () => {
  for (const value of [' 2025-01-01', '2025-01-01\n', '2025-01-01T00:00:00Z', '2025-00-01', '2025-01-00', 20250101, {}]) assert.throws(() => core.validDate(value));
  assert.equal(core.validDate('0000-01-01'), '0000-01-01');
  assert.equal(core.validDate('9999-12-31'), '9999-12-31');
});
