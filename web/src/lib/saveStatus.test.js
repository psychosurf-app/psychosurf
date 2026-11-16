import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackSave, retryFailedSave } from './saveStatus.js';

const tick = () => new Promise((r) => setTimeout(r, 0));

test('a failed save can be retried and then clears', async () => {
  let calls = 0;
  let ok = false;
  const run = async () => {
    calls += 1;
    if (!ok) throw new Error('offline');
  };
  const origError = console.error;
  console.error = () => {};
  trackSave(run);
  await tick();
  assert.equal(calls, 1);
  ok = true;
  retryFailedSave();
  await tick();
  assert.equal(calls, 2);
  retryFailedSave(); // nothing left to retry
  await tick();
  assert.equal(calls, 2);
  console.error = origError;
});
