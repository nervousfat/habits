import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

const habit = { id: 'h1', name: 'Read', weekdays: [1], color: 'green', createdAt: '2026-07-06', logs: [] };

test('scheduledDates lists every planned day in a window', () => {
  const dates = core.scheduledDates(habit, '2026-07-06', '2026-07-20');
  assert.deepEqual(dates, ['2026-07-06', '2026-07-13', '2026-07-20']);
  assert.deepEqual(core.scheduledDates(habit, '2026-07-07', '2026-07-07'), []);
});
