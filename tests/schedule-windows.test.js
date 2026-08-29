import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

const habit = { id: 'h1', name: 'Read', weekdays: [1], color: 'green', createdAt: '2026-07-06', logs: [] };

test('scheduledDates lists every planned day in a window', () => {
  const dates = core.scheduledDates(habit, '2026-07-06', '2026-07-20');
  assert.deepEqual(dates, ['2026-07-06', '2026-07-13', '2026-07-20']);
  assert.deepEqual(core.scheduledDates(habit, '2026-07-07', '2026-07-07'), []);
});
test('scheduledDates validates the window span', () => {
  assert.throws(() => core.scheduledDates(habit, '2026-07-10', '2026-07-06'), /日期范围应为 0 到 3660 天/);
  const end = core.addDays('2026-01-01', 3661);
  assert.throws(() => core.scheduledDates(habit, '2026-01-01', end), /日期范围应为 0 到 3660 天/);
});
