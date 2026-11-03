import { DIARY_PHRASES } from '../../data/diaryPhrases.js';
import { bagOf } from '../bags.js';
import { daysBetween } from '../period.js';
import { sortEntries } from '../points.js';
import { pickVariant, fillPhrase } from './phrases.js';
import { addSupport, emotionPlus, motivationPlus, withEmotions, zoneShift } from './rules.js';

// "Коротко" card in the diary of one sport (idea I-32).
// Phrases are Yana's approved texts, chosen by fixed rules. No AI (R-8, V-16).
// Thresholds are Yana's answers to V-28 (2026-10-29), see the phrases doc.

const MAX_PHRASES = 3;
const STREAK = 3; // D-5 / D-6: 3 trainings in a row with emotions in minus
const SWING_WINDOW = 6; // D-9: look at the last 6 trainings...
const SWING_CHANGES = 4; // ...where emotions changed sign 4-5 times
const BREAK_DAYS = 14; // D-11: a break of 14 days or more

// If two bags are equally full, the heavier one wins (V-28, D q.1).
const BAG_ORDER = ['wiped_out', 'paddling', 'sunbathing', 'catch_wave'];
const BAG_PHRASE = { catch_wave: 'D-1', paddling: 'D-2', sunbathing: 'D-3', wiped_out: 'D-4' };

// Length of the minus streak (emotions only) that ends at position `end` (exclusive).
function minusStreakBefore(emo, end) {
  let n = 0;
  for (let i = end - 1; i >= 0 && !emotionPlus(emo[i]); i -= 1) n += 1;
  return n;
}

// Main bag: holds at least half of the trainings; on a tie, the heavier one.
function mainBag(list) {
  const counts = {};
  for (const e of list) {
    const bag = bagOf(e);
    if (bag) counts[bag] = (counts[bag] ?? 0) + 1;
  }
  const best = BAG_ORDER.filter((b) => (counts[b] ?? 0) * 2 >= list.length).sort(
    (a, b) => counts[b] - counts[a],
  )[0];
  return best ? { bag: best, count: counts[best] } : null;
}

// list: this sport's entries in the period. allEntries: all entries of this sport (for D-11).
// Returns [{ id: 'D-1', text }] in display order, at most 3.
export function diarySummary(list, allEntries) {
  const sorted = sortEntries(list);
  if (sorted.length === 0) return [];
  const last = sorted[sorted.length - 1];

  const phrase = (id, values = {}) => ({
    id: id.replace(/-(better|worse)$/, ''),
    key: id,
    heavy: ['D-5', 'D-8-worse', 'D-4', 'D-7-worse'].includes(id),
    support: ['D-6', 'D-1', 'D-7-better', 'D-8-better'].includes(id),
    text: fillPhrase(pickVariant(DIARY_PHRASES[id], `${id}|${sorted.length}|${last.id}`), values),
  });

  // Candidates in Yana's order of importance.
  const candidates = [];

  // D-11: a break of 14+ days right before the last training (shown on that training only).
  const all = sortEntries(allEntries);
  const lastIndex = all.findIndex((e) => e.id === last.id);
  const previous = lastIndex > 0 ? all[lastIndex - 1] : null;
  if (previous && daysBetween(previous.trainingDate, last.trainingDate) >= BREAK_DAYS) {
    candidates.push(phrase('D-11'));
  }

  // Conclusions start from 2 trainings; with one there's only the break and D-12 (V-28, q.2).
  if (sorted.length >= 2) {
    const emo = withEmotions(sorted);
    const lastEmo = emo[emo.length - 1];

    // D-5: the last 3+ trainings in a row with emotions in minus.
    const streak = minusStreakBefore(emo, emo.length);
    if (streak >= STREAK) candidates.push(phrase('D-5', { N: streak }));

    // D-6: the last training is the first plus after 3+ minuses in a row.
    if (lastEmo === last && emotionPlus(last) && minusStreakBefore(emo, emo.length - 1) >= STREAK) {
      candidates.push(phrase('D-6'));
    }

    const motivationShift = zoneShift(sorted, motivationPlus);
    if (motivationShift === 'worse') candidates.push(phrase('D-8-worse'));

    // D-4 or D-1/D-2/D-3: the main bag. "Смыло" ranks higher than the other bags.
    const main = mainBag(sorted);
    const bagPhrase = main && phrase(BAG_PHRASE[main.bag], { k: main.count, n: sorted.length });
    if (main?.bag === 'wiped_out') candidates.push(bagPhrase);
    if (main && main.bag !== 'wiped_out') candidates.push(bagPhrase);

    const emotionShift = zoneShift(emo, emotionPlus);
    if (emotionShift) candidates.push(phrase(`D-7-${emotionShift}`));
    if (motivationShift === 'better') candidates.push(phrase('D-8-better'));

    // D-9: emotions changed sign 4-5 times over the last 6 trainings.
    const window = emo.slice(-SWING_WINDOW);
    if (window.length === SWING_WINDOW) {
      const changes = window.slice(1).filter((e, i) => emotionPlus(e) !== emotionPlus(window[i])).length;
      if (changes >= SWING_CHANGES) candidates.push(phrase('D-9'));
    }

    // D-10: every training in plus for both emotions and motivation.
    if (sorted.every((e) => emotionPlus(e) && motivationPlus(e))) candidates.push(phrase('D-10'));
  }

  // Pairs that say the same thing are never shown together.
  const clashes = (a, b) => {
    const pair = [a.key, b.key].sort().join('+');
    return ['D-4+D-5', 'D-5+D-7-worse', 'D-1+D-10'].includes(pair);
  };
  const isFree = (c, chosen) => !chosen.some((x) => clashes(x, c));

  const few = sorted.length === 1;
  const limit = few ? MAX_PHRASES - 1 : MAX_PHRASES;

  let chosen = [];
  for (const c of candidates) {
    if (chosen.length >= limit) break;
    if (isFree(c, chosen)) chosen.push(c);
  }
  chosen = addSupport(chosen, candidates, limit, (c) => isFree(c, chosen));

  // D-12 always goes last.
  if (few) chosen.push(phrase('D-12'));

  return chosen.map(({ id, text }) => ({ id, text }));
}
