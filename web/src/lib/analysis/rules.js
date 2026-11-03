import { sortEntries } from '../points.js';

// Rules shared by both "Коротко" cards. Thresholds are Yana's answers to V-28 (2026-10-29).

// A shift needs at least this many trainings (3 in each half).
const SHIFT_MIN = 6;

export const isNumb = (e) => e.tone === 'numb';

// "Nothing" entries don't count for emotions, but count for motivation (V-28, q.1).
export const withEmotions = (list) => sortEntries(list).filter((e) => !isNumb(e));
export const emotionPlus = (e) => e.tone === 'good';
export const motivationPlus = (e) => e.motivation === 'forward';

// "More often" = ahead by at least one training. A tie is not "more often" (V-28, q.3).
export const moreOften = (a, b) => a > b;

// Zone of a group of trainings: 'plus', 'minus' or null on a tie.
function zone(list, isPlus) {
  const plus = list.filter(isPlus).length;
  const minus = list.length - plus;
  if (moreOften(plus, minus)) return 'plus';
  if (moreOften(minus, plus)) return 'minus';
  return null;
}

// Shift (A-7, D-7, D-8): the zone changed between the first and the second half
// of the period, at least 6 trainings. Returns 'better', 'worse' or null.
// `list` must already hold only the trainings that count (e.g. withEmotions for emotions).
export function zoneShift(list, isPlus) {
  const sorted = sortEntries(list);
  if (sorted.length < SHIFT_MIN) return null;
  const half = Math.floor(sorted.length / 2);
  const before = zone(sorted.slice(0, half), isPlus);
  const after = zone(sorted.slice(half), isPlus);
  if (!before || !after || before === after) return null;
  return after === 'plus' ? 'better' : 'worse';
}

// Rule 2 of both cards: after a heavy phrase, if possible, a support phrase follows,
// so the summary doesn't end on a minus. `isFree(c)` says whether a candidate may still be added.
export function addSupport(chosen, candidates, limit, isFree) {
  const firstHeavy = chosen.findIndex((c) => c.heavy);
  if (firstHeavy === -1 || chosen.some((c) => c.support)) return chosen;
  const support = candidates.find((c) => c.support && !chosen.includes(c) && isFree(c));
  if (!support) return chosen;
  const result = [...chosen];
  if (result.length >= limit && result.length - 1 !== firstHeavy) result.pop();
  if (result.length < limit) result.splice(firstHeavy + 1, 0, support);
  return result;
}
