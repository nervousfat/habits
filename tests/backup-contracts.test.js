import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';
import {habit, freeze} from './fixtures.mjs';

test('input accepts exactly five million UTF-8 bytes and rejects the next byte', () => {
  const json = core.exportHabits([habit({name: '中文 🪴'})]);
  const exact = json + ' '.repeat(5_000_000 - new TextEncoder().encode(json).byteLength);
  assert.deepEqual(core.importHabits(exact, '2025-01-10'), [habit({name: '中文 🪴'})]);
  assert.throws(() => core.importHabits(exact + ' ', '2025-01-10'), /5 MB/);
  const unicodePayload = JSON.stringify({app: 'little-habits', version: 1, habits: [], ignored: '汉'.repeat(1_666_667)});
  assert.ok(unicodePayload.length < 5_000_000);
  assert.throws(() => core.importHabits(unicodePayload, '2025-01-10'), /5 MB/);
});
test('oversized valid records fail export instead of producing an unusable backup', () => {
  const start = Date.parse('1900-01-01');
  const logs = Array.from({length: 20000}, (_, index) => new Date(start + index * 86400000).toISOString().slice(0, 10));
  const records = Array.from({length: 15}, (_, index) => habit({id: String(index), createdAt: '1900-01-01', logs}));
  assert.equal(core.normalizeHabit(records[0]).logs.length, 20000);
  assert.throws(() => core.exportHabits(records), /5 MB/);
  const small = core.exportHabits(records.slice(0, 2));
  assert.equal(core.exportHabits(core.importHabits(small, '2025-01-10')), small);
});
test('backup collections enforce identity capacity version and reference-date rules', () => {
  const records = Array.from({length: 100}, (_, index) => habit({id: String(index)}));
  assert.equal(core.importHabits(core.exportHabits(records), '2025-01-10').length, 100);
  assert.throws(() => core.exportHabits([...records, habit({id: 'extra'})]), /100/);
  for (const data of [
    {app: 'other', version: 1, habits: []}, {app: 'little-habits', version: 2, habits: []},
    {app: 'little-habits', version: 1, habits: [habit(), habit()]}
  ]) assert.throws(() => core.importHabits(JSON.stringify(data), '2025-01-10'));
  assert.throws(() => core.importHabits(core.exportHabits([habit({createdAt: '2025-01-11'})]), '2025-01-10'), /未来/);
  assert.throws(() => core.importHabits(new Uint8Array(), '2025-01-10'), /文本/);
});
