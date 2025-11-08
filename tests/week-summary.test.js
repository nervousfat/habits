import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('Monday and Sunday anchors in one week produce identical aggregate dates', () => {
  const records = freeze([habit({logs: ['2025-01-06', '2025-01-07']}), habit({id: 'weekly', weekdays: [1], logs: ['2025-01-06']})]);
  const monday = core.weekSummary(records, '2025-01-06');
  assert.deepEqual(core.weekSummary(records, '2025-01-12'), monday);
  assert.deepEqual(monday[0], {date: '2025-01-06', scheduled: 2, completed: 2});
  assert.deepEqual(monday[1], {date: '2025-01-07', scheduled: 1, completed: 1});
  assert.equal(monday.reduce((sum, day) => sum + day.scheduled, 0), 8);
  assert.equal(monday.reduce((sum, day) => sum + day.completed, 0), 3);
});
test('weekly summaries retain seven empty dates across a year boundary', () => {
  const result = core.weekSummary([], '2025-01-01');
  assert.equal(result[0].date, '2024-12-30');
  assert.equal(result.at(-1).date, '2025-01-05');
  assert.ok(result.every(day => day.scheduled === 0 && day.completed === 0));
  assert.equal(new Set(result.map(day => day.date)).size, 7);
});
