import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

test('exportHabits rejects duplicate identifiers and non-lists', () => {
  const pair = [
    { id: 'same', name: 'A', weekdays: [1], color: 'green', createdAt: '2026-08-03', logs: [] },
    { id: 'same', name: 'B', weekdays: [2], color: 'blue', createdAt: '2026-08-03', logs: [] }
  ];
  assert.throws(() => core.exportHabits(pair), /习惯 ID 重复/);
  assert.throws(() => core.exportHabits('nope'), /最多支持 100 个习惯/);
});
test('importHabits only accepts little-habits backups', () => {
  assert.throws(() => core.importHabits('{"app":"other","version":1,"habits":[]}', '2026-08-05'), /不是有效的习惯备份/);
  assert.throws(() => core.importHabits('not json', '2026-08-05'), SyntaxError);
});
