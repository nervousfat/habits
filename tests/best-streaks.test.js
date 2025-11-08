import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('past best streak survives a recent gap across a year boundary', () => {
  const record = freeze(habit({createdAt: '2024-12-16', weekdays: [1], logs: ['2025-01-13', '2024-12-30', '2024-12-16', '2024-12-23']}));
  assert.equal(core.bestStreak(record, '2025-01-13'), 3);
  assert.equal(core.currentStreak(record, '2025-01-13'), 1);
  assert.equal(core.bestStreak(record, '2024-12-23'), 2);
  assert.deepEqual(record.logs, ['2025-01-13', '2024-12-30', '2024-12-16', '2024-12-23']);
});
test('a daily streak counts leap-day adjacency but not future completions', () => {
  const record = habit({createdAt: '2024-02-28', logs: ['2024-02-28', '2024-02-29', '2024-03-01']});
  assert.equal(core.bestStreak(record, '2024-02-29'), 2);
  assert.equal(core.bestStreak(record, '2024-03-01'), 3);
  assert.equal(core.bestStreak({...record, logs: ['2024-02-28', '2024-03-01']}, '2024-03-01'), 1);
});
