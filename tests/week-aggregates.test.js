import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

test('weekSummary aggregates schedules Monday through Sunday', () => {
  const daily = { id: 'd', name: 'Daily', weekdays: [0, 1, 2, 3, 4, 5, 6], color: 'green', createdAt: '2025-11-01', logs: ['2026-01-05'] };
  const week = core.weekSummary([daily], '2026-01-08');
  assert.equal(week.length, 7);
  assert.deepEqual(week.map(day => day.date).slice(0, 3), ['2026-01-05', '2026-01-06', '2026-01-07']);
  assert.equal(week[0].scheduled, 1);
  assert.equal(week[0].completed, 1);
  assert.equal(week[1].completed, 0);
});
