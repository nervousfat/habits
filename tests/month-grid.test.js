import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

test('monthGrid lays out six Monday-anchored weeks', () => {
  const grid = core.monthGrid('2026-01');
  assert.equal(grid.length, 42);
  assert.equal(grid[0].date, '2025-12-29');
  assert.equal(grid[3].date, '2026-01-01');
  assert.equal(grid.filter(cell => cell.inMonth).length, 31);
  assert.throws(() => core.monthGrid('2026-1'), /月份格式应为 YYYY-MM/);
});
