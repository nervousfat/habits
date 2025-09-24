import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('removing a habit also removes only its history from the returned collection', () => {
  const source = freeze(['a', 'b', 'c'].map(id => habit({id, logs: ['2025-01-01']})));
  for (const id of ['a', 'b', 'c']) {
    const result = core.removeHabit(source, id);
    assert.deepEqual(result.map(item => item.id), ['a', 'b', 'c'].filter(value => value !== id));
    assert.ok(result.every(item => item.logs.length === 1));
  }
  assert.equal(source.length, 3);
  assert.deepEqual(core.removeHabit([habit()], 'read'), []);
});
test('duplicate target identifiers cannot silently remove multiple habits', () => {
  const source = freeze([habit(), habit({name: 'Other'})]);
  assert.throws(() => core.removeHabit(source, 'read'), /重复/);
  assert.equal(source.length, 2);
  assert.throws(() => core.removeHabit(null, 'read'), /列表/);
  assert.throws(() => core.removeHabit([], 'read'), /未找到/);
});
