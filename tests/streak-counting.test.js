import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

const habit = (fields = {}) => ({
  id: 'h1', name: 'Read', weekdays: [0], color: 'green',
  createdAt: '2025-11-01', logs: [], ...fields
});

test('bestStreak bridges unscheduled days and resets after gaps', () => {
  const dense = habit({ logs: ['2025-12-07', '2025-12-14'] });
  assert.equal(core.bestStreak(dense, '2025-12-20'), 2);
  const sparse = habit({ logs: ['2025-12-07', '2025-12-28'] });
  assert.equal(core.bestStreak(sparse, '2026-01-04'), 1);
});
test('currentStreak allows today to stay open without breaking', () => {
  const target = habit({ logs: ['2025-12-07', '2025-12-14'] });
  assert.equal(core.currentStreak(target, '2025-12-14'), 2);
  assert.equal(core.currentStreak(target, '2025-12-15'), 2);
  const fresh = habit({ createdAt: '2025-12-21' });
  assert.equal(core.currentStreak(fresh, '2025-12-21'), 0);
});
