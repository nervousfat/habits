import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('creating multiple habits never shares logs or weekday arrays', () => {
  const weekdays = Object.freeze([5, 1, 3]);
  const first = core.createHabit('First', weekdays, 'first', '2025-01-01', 'rose');
  const second = core.createHabit('Second', weekdays, 'second', '2025-01-01');
  first.logs.push('2025-01-03');
  first.weekdays.push(6);
  assert.deepEqual(second.logs, []);
  assert.deepEqual(second.weekdays, [1, 3, 5]);
  assert.deepEqual(weekdays, [5, 1, 3]);
  assert.equal(first.color, 'rose');
  assert.equal(second.color, 'green');
});
test('creation uses supplied date and rejects invalid plans before returning', () => {
  assert.equal(core.createHabit('Read', [0], 'sunday', '2025-01-01').createdAt, '2025-01-01');
  for (const date of ['2025-02-29', '', null]) assert.throws(() => core.createHabit('Read', [1], 'read', date));
  assert.throws(() => core.createHabit('Read', [], 'read', '2025-01-01'));
  assert.deepEqual(core.createHabit('Read', [0, 1, 2, 3, 4, 5, 6], 'read', '2025-01-01'), habit());
});
