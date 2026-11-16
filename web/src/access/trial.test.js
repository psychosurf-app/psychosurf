import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessState } from './trial.js';

const at = (day, trainings) =>
  accessState({ firstDay: '2026-11-01', today: `2026-11-${String(day).padStart(2, '0')}`, trainings });

test('first two weeks are open whatever the trainings', () => {
  assert.equal(at(1, 0).full, true);
  assert.equal(at(14, 10).full, true); // day 14 = 13 days after the start
});

test('after two weeks: open until 4 trainings, whichever is later', () => {
  assert.equal(at(16, 3).full, true);
  assert.equal(at(16, 4).full, false);
});

test('never longer than 30 days', () => {
  assert.equal(at(30, 1).full, true);
  assert.equal(accessState({ firstDay: '2026-11-01', today: '2026-12-01', trainings: 1 }).full, false);
});

test('a subscription opens everything', () => {
  assert.equal(accessState({ firstDay: '2026-01-01', today: '2026-11-16', trainings: 50, subscribed: true }).full, true);
});
