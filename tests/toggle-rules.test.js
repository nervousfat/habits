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
