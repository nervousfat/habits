import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('splitting adjacent date ranges preserves the complete planned schedule', () => {
  const record = habit({createdAt: '2024-12-30', weekdays: [0, 1, 4]});
  const whole = core.scheduledDates(record, '2024-12-20', '2025-01-20');
  const pieces = [...core.scheduledDates(record, '2024-12-20', '2024-12-31'), ...core.scheduledDates(record, '2025-01-01', '2025-01-20')];
  assert.deepEqual(pieces, whole);
  assert.equal(new Set(whole).size, whole.length);
  assert.ok(whole.every(date => date >= record.createdAt));
});
test('range limits count day differences while enumeration includes endpoints', () => {
  const record = habit({createdAt: '2000-01-01'});
  const end = core.addDays('2000-01-01', 3660);
  assert.equal(core.scheduledDates(record, '2000-01-01', end).length, 3661);
  assert.throws(() => core.scheduledDates(record, '2000-01-01', core.addDays(end, 1)), /范围/);
  assert.deepEqual(core.scheduledDates(record, '2000-01-01', '2000-01-01'), ['2000-01-01']);
});
