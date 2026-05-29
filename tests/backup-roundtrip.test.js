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
