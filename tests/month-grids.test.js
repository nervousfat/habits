import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

test('month grids cover leap February and Monday or Sunday starts', () => {
  for (const [month, count, start] of [
    ['2024-02', 29, '2024-01-29'], ['2025-02', 28, '2025-01-27'],
    ['2025-09', 30, '2025-09-01'], ['2025-06', 30, '2025-05-26'],
    ['2025-12', 31, '2025-12-01']
  ]) {
    const cells = core.monthGrid(month);
    assert.equal(cells.length, 42);
    assert.equal(cells[0].date, start);
    assert.equal(cells.filter(cell => cell.inMonth).length, count);
    assert.equal(new Set(cells.map(cell => cell.date)).size, 42);
    cells.forEach((cell, index) => assert.equal(cell.date, core.addDays(start, index)));
  }
});
test('month parsing rejects malformed months and unsupported grid overflow', () => {
  for (const month of ['2025-1', '2025-00', '2025-13', '2025-01-01', null, '0000-01', '9999-12']) assert.throws(() => core.monthGrid(month));
});
