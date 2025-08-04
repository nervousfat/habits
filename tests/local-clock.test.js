import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../core.js';

import {execFileSync} from 'node:child_process';
const moduleUrl = new URL('../core.js', import.meta.url).href;
function inZone(zone, instant) {
  const source = 'import {todayKey} from ' + JSON.stringify(moduleUrl) + '; process.stdout.write(todayKey(new Date(' + JSON.stringify(instant) + ')));';
  return execFileSync(process.execPath, ['--input-type=module', '-e', source], {
    encoding: 'utf8', env: {...process.env, TZ: zone}, windowsHide: true
  });
}
test('the same instant can belong to different local calendar days', () => {
  const instant = '2025-01-01T00:30:00Z';
  assert.equal(inZone('UTC', instant), '2025-01-01');
  assert.equal(inZone('America/Los_Angeles', instant), '2024-12-31');
  assert.equal(inZone('Asia/Shanghai', instant), '2025-01-01');
});
test('eastern time zones advance the local date before UTC midnight', () => {
  assert.equal(inZone('Asia/Shanghai', '2025-12-31T16:30:00Z'), '2026-01-01');
  assert.equal(inZone('UTC', '2025-12-31T16:30:00Z'), '2025-12-31');
});
