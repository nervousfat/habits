import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('renaming changes only a target name and keeps source snapshots immutable', () => {
  const source = freeze([habit({logs: ['2025-01-02'], color: 'rose'}), habit({id: 'other', name: 'Other'})]);
  const result = core.renameHabit(source, 'read', '  Write  ');
  assert.deepEqual(result[0], {...source[0], name: 'Write'});
  assert.deepEqual(result[1], source[1]);
  result[0].logs.push('2025-01-03');
  assert.deepEqual(source[0].logs, ['2025-01-02']);
});
test('failed renaming leaves all previous values intact', () => {
  const source = freeze([habit()]);
  for (const name of ['', 'x'.repeat(81), null]) assert.throws(() => core.renameHabit(source, 'read', name));
  assert.deepEqual(source, [habit()]);
  assert.throws(() => core.renameHabit(source, 'missing', 'Valid'), /未找到/);
});
