import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('each single-weekday plan selects exactly one day of a calendar week', () => {
  const week = ['2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09', '2025-01-10', '2025-01-11', '2025-01-12'];
  for (let weekday = 0; weekday < 7; weekday++) {
    const record = habit({weekdays: [weekday]});
    assert.deepEqual(week.filter(date => core.isScheduled(record, date)), [week[(weekday + 6) % 7]]);
  }
});
test('creation is inclusive and dates before it never count as planned', () => {
  const record = habit({createdAt: '2025-01-08', weekdays: [3]});
  assert.equal(core.isScheduled(record, '2025-01-01'), false);
  assert.equal(core.isScheduled(record, '2025-01-08'), true);
  assert.equal(core.isScheduled(record, '2025-01-09'), false);
  assert.equal(core.isScheduled(record, '2025-01-15'), true);
});
