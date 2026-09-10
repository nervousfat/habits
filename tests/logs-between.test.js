import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

const habit = { id: 'h1', name: 'Read', weekdays: [1], color: 'green', createdAt: '2026-08-31', logs: ['2026-08-31', '2026-09-07'] };

test('logsBetween returns sorted scheduled records inside the window', () => {
  assert.deepEqual(core.logsBetween(habit, '2026-08-30', '2026-09-10'), ['2026-08-31', '2026-09-07']);
  assert.deepEqual(core.logsBetween(habit, '2026-09-01', '2026-09-06'), []);
});
test('logsBetween validates its window', () => {
  assert.throws(() => core.logsBetween(habit, '2026-09-10', '2026-09-01'), /开始日期不能晚于结束日期/);
  assert.deepEqual(core.logsBetween({ ...habit, logs: [] }, '2026-08-30', '2026-09-10'), []);
});
