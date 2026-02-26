import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

const habit = (fields = {}) => ({
  id: 'h1', name: 'Read', weekdays: [0, 1, 2, 3, 4, 5, 6], color: 'green',
  createdAt: '2025-06-01', logs: [], ...fields
});

test('normalizeWeekdays sorts selections and rejects duplicates', () => {
  assert.deepEqual(core.normalizeWeekdays([3, 1, 2]), [1, 2, 3]);
  assert.throws(() => core.normalizeWeekdays([1, 1]), /打卡日不能重复/);
  assert.throws(() => core.normalizeWeekdays([]), /请至少选择一个打卡日/);
  assert.throws(() => core.normalizeWeekdays([7]), /星期必须是 0 到 6 的整数/);
});

test('isScheduled respects the creation floor', () => {
  const target = habit({ weekdays: [1], createdAt: '2026-02-02' });
  assert.equal(core.isScheduled(target, '2026-02-02'), true);
  assert.equal(core.isScheduled(target, '2026-01-26'), false);
  assert.equal(core.isScheduled(target, '2026-02-03'), false);
});
