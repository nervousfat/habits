import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

const habit = { id: 'h1', name: 'Read', weekdays: [1], color: 'green', createdAt: '2026-06-01', logs: [] };
const other = { id: 'h2', name: 'Walk', weekdays: [1], color: 'blue', createdAt: '2026-06-01', logs: [] };

test('toggleLog adds and removes records for planned days', () => {
  const added = core.toggleLog([habit, other], 'h1', '2026-06-01', '2026-06-02');
  assert.deepEqual(added[0].logs, ['2026-06-01']);
  assert.deepEqual(added[1].logs, []);
  const removed = core.toggleLog(added, 'h1', '2026-06-01', '2026-06-02');
  assert.deepEqual(removed[0].logs, []);
});
test('toggleLog rejects future dates and unplanned days', () => {
  assert.throws(() => core.toggleLog([habit], 'h1', '2026-06-08', '2026-06-02'), /不能为未来日期打卡/);
  assert.throws(() => core.toggleLog([habit], 'h1', '2026-06-02', '2026-06-05'), /这一天不在习惯计划内/);
  assert.throws(() => core.toggleLog([habit], 'missing', '2026-06-01', '2026-06-02'), /未找到习惯/);
});
