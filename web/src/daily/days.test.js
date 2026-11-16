import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardIndex, daysBetween } from './days.js';

test('day 1 is card 1, then one card per calendar day', () => {
  assert.equal(cardIndex('2026-11-16', '2026-11-16', 365), 0);
  assert.equal(cardIndex('2026-11-16', '2026-11-17', 365), 1);
  // a missed day is skipped, like a calendar
  assert.equal(cardIndex('2026-11-16', '2026-11-20', 365), 4);
});

test('after the last card the circle starts again', () => {
  assert.equal(cardIndex('2026-01-01', '2027-01-01', 365), 0);
});

test('works across the clock change (local dates, no hours)', () => {
  assert.equal(daysBetween('2026-03-28', '2026-03-30'), 2);
  assert.equal(daysBetween('2026-10-24', '2026-10-26'), 2);
});
