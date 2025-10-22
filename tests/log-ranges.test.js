import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('log selection includes both endpoints but never expands the input range', () => {
  const source = freeze(habit({logs: ['2025-01-10', '2025-01-01', '2025-01-05']}));
  assert.deepEqual(core.logsBetween(source, '2025-01-01', '2025-01-05'), ['2025-01-01', '2025-01-05']);
  assert.deepEqual(core.logsBetween(source, '2025-01-05', '2025-01-05'), ['2025-01-05']);
  assert.deepEqual(core.logsBetween(source, '2025-01-06', '2025-01-09'), []);
  assert.deepEqual(source.logs, ['2025-01-10', '2025-01-01', '2025-01-05']);
});
test('log selection ignores dates outside the plan and rejects inverted bounds', () => {
  const record = habit({weekdays: [1], logs: ['2025-01-06', '2025-01-07']});
  assert.deepEqual(core.logsBetween(record, '2025-01-01', '2025-01-10'), ['2025-01-06']);
  assert.throws(() => core.logsBetween(record, '2025-01-10', '2025-01-01'), /开始/);
  assert.throws(() => core.logsBetween(record, 'bad', '2025-01-10'), /日期/);
});
