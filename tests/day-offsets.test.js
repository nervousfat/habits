import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

test('bounded day offsets are reversible across calendar boundaries', () => {
  for (const date of ['1900-03-01', '2000-02-29', '2025-01-01', '2025-03-09', '2025-11-02']) {
    for (const offset of [-36600, -366, -31, -1, 0, 1, 31, 366, 36600]) {
      const shifted = core.addDays(date, offset);
      assert.equal(core.addDays(shifted, -offset), date);
      assert.equal(Date.parse(shifted) - Date.parse(date), offset * 86400000);
    }
  }
});
test('offset and supported-year overflow fail explicitly', () => {
  for (const offset of [-36601, 36601, NaN, '1', null]) assert.throws(() => core.addDays('2025-01-01', offset), /偏移/);
  assert.throws(() => core.addDays('0000-01-01', -1), /日期/);
  assert.throws(() => core.addDays('9999-12-31', 1), /日期/);
});
