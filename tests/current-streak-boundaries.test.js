import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('a streak created at year zero does not step outside the supported date domain', () => {
  const record = habit({createdAt: '0000-01-01', logs: ['0000-01-01']});
  assert.equal(core.currentStreak(record, '0000-01-01'), 1);
  assert.equal(core.currentStreak({...record, logs: []}, '0000-01-01'), 0);
  assert.equal(core.currentStreak({...record, weekdays: [0], logs: []}, '0000-01-01'), 0);
  assert.equal(core.currentStreak({...record, logs: ['0000-01-01', '0000-01-02']}, '0000-01-02'), 2);
});
test('weekly streaks allow an unfinished today but expire on the next day', () => {
  const record = habit({createdAt: '2024-12-23', weekdays: [1], logs: ['2024-12-23', '2024-12-30']});
  assert.equal(core.currentStreak(record, '2025-01-06'), 2);
  assert.equal(core.currentStreak(record, '2025-01-07'), 0);
  assert.equal(core.currentStreak({...record, logs: [...record.logs, '2025-01-06']}, '2025-01-07'), 3);
});
