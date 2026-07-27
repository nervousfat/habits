import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

test('sampleHabits ships three planned examples', () => {
  const habits = core.sampleHabits('2026-07-08');
  assert.deepEqual(habits.map(item => item.id), ['sample-read', 'sample-walk', 'sample-water']);
  for (const item of habits) {
    assert.ok(item.logs.every(date => date < '2026-07-08'));
    assert.deepEqual(core.normalizeHabit(item), item);
  }
});
