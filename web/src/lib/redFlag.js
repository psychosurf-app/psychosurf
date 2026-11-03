import { sortEntries } from './points.js';

// Red flag (I-20, R-22): the two latest trainings in a row are "Ничего не чувствую",
// counted across all sports together, even on the same day (V-22).
export const RED_FLAG_STREAK = 2;

export function isRedFlag(entries) {
  const latest = sortEntries(entries).slice(-RED_FLAG_STREAK);
  return latest.length === RED_FLAG_STREAK && latest.every((e) => e.tone === 'numb');
}
