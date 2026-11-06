import { sortEntries } from './points.js';

// "Страх и тренировки" card (I-40, mockup G-26 v1), rules by Yana 2026-11-03:
// emotions of the group "Страх и тревога" (страх, тревога, неуверенность; нервозность is in
// "Злость" since 2026-11-03 and does not count) in 2 trainings in a row, all sports together,
// like the red flag. No pause: the card shows every time the condition holds.
export const FEAR_CODES = ['Сл-30', 'Сл-33', 'Сл-29'];
export const FEAR_STREAK = 2;

const hasFear = (entry) => entry.emotions.some((code) => FEAR_CODES.includes(code));

// True when this training and the trainings right before it (all sports) all have fear.
export function showFearCard(entries, entry) {
  const sorted = sortEntries(entries);
  const i = sorted.findIndex((e) => e.id === entry.id);
  if (i < FEAR_STREAK - 1) return false;
  return sorted.slice(i - FEAR_STREAK + 1, i + 1).every(hasFear);
}
