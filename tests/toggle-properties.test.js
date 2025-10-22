import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('toggling each past scheduled day twice restores the initial collection', () => {
  const source = freeze([habit({weekdays: [1, 3, 5], logs: ['2025-01-03']}), habit({id: 'other'})]);
  for (const date of ['2025-01-01', '2025-01-03', '2025-01-06', '2025-01-08']) {
    const once = core.toggleLog(source, 'read', date, '2025-01-10');
    assert.deepEqual(core.toggleLog(once, 'read', date, '2025-01-10'), source);
    assert.deepEqual(once[1], source[1]);
  }
  assert.deepEqual(source[0].logs, ['2025-01-03']);
});
test('future before-creation and rest-day failures cannot modify logs', () => {
  const source = freeze([habit({createdAt: '2025-01-06', weekdays: [1, 3, 5]})]);
  for (const date of ['2025-01-03', '2025-01-07', '2025-01-13']) assert.throws(() => core.toggleLog(source, 'read', date, '2025-01-10'));
  assert.deepEqual(source[0].logs, []);
  const today = core.toggleLog(source, 'read', '2025-01-10', '2025-01-10');
  assert.deepEqual(today[0].logs, ['2025-01-10']);
});
