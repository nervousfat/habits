import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('completion percentage is bounded and rounded from planned dates', () => {
  const dates = ['2025-01-01', '2025-01-02', '2025-01-03'];
  for (let count = 0; count <= dates.length; count++) {
    const result = core.completionRate(habit({logs: dates.slice(0, count)}), dates[0], dates[2]);
    assert.deepEqual(result, {scheduled: 3, completed: count, percent: [0, 33, 67, 100][count]});
    assert.ok(result.completed <= result.scheduled);
  }
});
test('before-creation windows and rest-only windows have zero completion rates', () => {
  const record = habit({createdAt: '2025-01-06', weekdays: [1, 3, 5], logs: ['2025-01-06']});
  assert.deepEqual(core.completionRate(record, '2025-01-01', '2025-01-05'), {scheduled: 0, completed: 0, percent: 0});
  assert.deepEqual(core.completionRate(record, '2025-01-11', '2025-01-12'), {scheduled: 0, completed: 0, percent: 0});
  assert.deepEqual(core.completionRate(record, '2025-01-06', '2025-01-06'), {scheduled: 1, completed: 1, percent: 100});
});
