import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('normalization respects name and identifier bounds and known colors', () => {
  assert.equal(core.normalizeHabit(habit({name: '字'.repeat(80), id: 'i'.repeat(100)})).name.length, 80);
  for (const fields of [{name: '字'.repeat(81)}, {id: 'i'.repeat(101)}, {name: ' '}, {id: null}]) assert.throws(() => core.normalizeHabit(habit(fields)));
  assert.equal(core.normalizeHabit(habit({name: '  Read  '})).name, 'Read');
  for (const color of ['green', 'blue', 'amber', 'rose']) assert.equal(core.normalizeHabit(habit({color})).color, color);
  assert.equal(core.normalizeHabit(habit({color: 'purple'})).color, 'green');
});
test('normalization sorts independent arrays and strips unknown fields', () => {
  const source = freeze(habit({weekdays: [6, 0, 1], logs: ['2025-01-06', '2025-01-04'], internal: true}));
  const result = core.normalizeHabit(source);
  assert.deepEqual(result.weekdays, [0, 1, 6]);
  assert.deepEqual(result.logs, ['2025-01-04', '2025-01-06']);
  assert.equal('internal' in result, false);
  result.logs.push('2025-01-11');
  result.weekdays.push(2);
  assert.deepEqual(source.logs, ['2025-01-06', '2025-01-04']);
  assert.deepEqual(source.weekdays, [6, 0, 1]);
});
test('record validation rejects rest-day logs and excessive log counts', () => {
  assert.throws(() => core.normalizeHabit(habit({weekdays: [1], logs: ['2025-01-07']})), /计划/);
  assert.throws(() => core.normalizeHabit(habit({logs: Array(20001).fill('2025-01-01')})), /过多/);
  for (const raw of [[], null, 'habit']) assert.throws(() => core.normalizeHabit(raw), /数据/);
});
