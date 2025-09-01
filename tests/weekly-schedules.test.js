import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

test('every nonempty weekday subset normalizes without changing the input', () => {
  for (let mask = 1; mask < 128; mask++) {
    const ascending = [0, 1, 2, 3, 4, 5, 6].filter(day => mask & (1 << day));
    const source = Object.freeze([...ascending].reverse());
    assert.deepEqual(core.normalizeWeekdays(source), ascending);
    assert.deepEqual(source, [...ascending].reverse());
  }
});
test('schedule normalization rejects fractional weekdays and duplicate Sunday', () => {
  for (const days of [[0, 0], [1.5], [NaN], [null], [false], [0, 1, 2, 3, 4, 5, 6, 0]]) assert.throws(() => core.normalizeWeekdays(days));
  const source = [6, 0];
  core.normalizeWeekdays(source).push(3);
  assert.deepEqual(source, [6, 0]);
});
