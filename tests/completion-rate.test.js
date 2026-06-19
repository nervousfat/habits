import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

test('completionRate measures scheduled versus completed days', () => {
  const target = { id: 'w', name: 'Walk', weekdays: [1, 2, 3, 4, 5], color: 'blue', createdAt: '2026-05-04', logs: ['2026-05-04', '2026-05-05', '2026-05-07'] };
  const rate = core.completionRate(target, '2026-05-04', '2026-05-08');
  assert.equal(rate.scheduled, 5);
  assert.equal(rate.completed, 3);
  assert.equal(rate.percent, 60);
});
