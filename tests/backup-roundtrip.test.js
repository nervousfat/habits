import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

const habit = (fields = {}) => ({
  id: 'h1', name: 'Read', weekdays: [1], color: 'green',
  createdAt: '2026-03-02', logs: [], ...fields
});

test('exportHabits and importHabits round-trip records', () => {
  const habits = [habit({ logs: ['2026-03-02'] })];
  const restored = core.importHabits(core.exportHabits(habits), '2026-03-05');
  assert.deepEqual(restored, habits);
});
test('importHabits rejects future records and oversize collections', () => {
  const future = core.exportHabits([habit({ logs: ['2026-03-02'] })]);
  assert.throws(() => core.importHabits(future, '2026-03-01'), /备份包含未来记录/);
  const many = Array.from({ length: 101 }, (_, index) => ({ id: 'h' + index, name: 'H', weekdays: [1], color: 'green', createdAt: '2026-03-02', logs: [] }));
  assert.throws(() => core.exportHabits(many), /最多支持 100 个习惯/);
});
