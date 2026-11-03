import { COMPARE_PHRASES } from '../../data/comparePhrases.js';
import { bagOf } from '../bags.js';
import { sortEntries } from '../points.js';
import { pickVariant, fillPhrase } from './phrases.js';

// "Коротко" card on the sport comparison screen (idea I-31).
// Phrases are Yana's approved texts, chosen by fixed rules. No AI (R-8, V-16).
// Thresholds are Yana's answers to V-28 (2026-10-29), see the phrases doc.

const MAX_PHRASES = 3;
// A shift (A-7) needs at least this many trainings with emotions (3 in each half).
const SHIFT_MIN = 6;

const isNumb = (e) => e.tone === 'numb';

// Counts for one sport in the period.
// "Nothing" entries don't count for emotions, but count for motivation (V-28, q.1).
export function sportStats(list) {
  const withEmotions = list.filter((e) => !isNumb(e));
  const ePlus = withEmotions.filter((e) => e.tone === 'good').length;
  return {
    total: list.length,
    emoTotal: withEmotions.length,
    ePlus,
    eMinus: withEmotions.length - ePlus,
    mPlus: list.filter((e) => e.motivation === 'forward').length,
    mMinus: list.filter((e) => e.motivation === 'not_forward').length,
    wipedOut: list.filter((e) => bagOf(e) === 'wiped_out').length,
  };
}

// "More often" = ahead by at least one training. A tie is not "more often" (V-28, q.3).
const moreOften = (a, b) => a > b;

// Emotion zone of a group of trainings: 'plus', 'minus' or null on a tie.
function emotionZone(list) {
  const plus = list.filter((e) => e.tone === 'good').length;
  const minus = list.length - plus;
  if (plus > minus) return 'plus';
  if (minus > plus) return 'minus';
  return null;
}

// A-7: the emotion zone changed between the first and the second half of the period (V-28, q.7).
export function emotionShift(list) {
  const withEmotions = sortEntries(list).filter((e) => !isNumb(e));
  if (withEmotions.length < SHIFT_MIN) return null;
  const half = Math.floor(withEmotions.length / 2);
  const before = emotionZone(withEmotions.slice(0, half));
  const after = emotionZone(withEmotions.slice(half));
  if (!before || !after || before === after) return null;
  return after === 'plus' ? 'better' : 'worse';
}

// The one sport with the highest share, or null if several share the top (V-28, q.5-6).
function uniqueTop(rows, share) {
  const scored = rows.map((r) => ({ r, s: share(r) })).sort((a, b) => b.s - a.s);
  if (scored.length === 0) return null;
  if (scored.length > 1 && scored[0].s === scored[1].s) return null;
  return scored[0].r;
}

// rows: [{ diary: { key, name }, list: [entries in the period] }], in profile order.
// totalSports: how many sports the person has in the profile.
// Returns [{ id: 'A-1', text }] in display order, at most 3.
export function compareSummary(rows, totalSports) {
  const active = rows
    .filter((r) => r.list.length > 0)
    .map((r) => ({ ...r, stats: sportStats(r.list) }));
  if (active.length === 0) return [];

  const phrase = (id, row, k, n) => {
    const variants = COMPARE_PHRASES[id];
    const seed = `${id}|${row?.diary.key ?? ''}|${row?.stats.total ?? active.length}`;
    return {
      id: id.startsWith('A-7') ? 'A-7' : id,
      sportKey: row?.diary.key ?? null,
      heavy: ['A-5', 'A-2', 'A-7-worse'].includes(id),
      support: ['A-1', 'A-7-better'].includes(id),
      text: fillPhrase(pickVariant(variants, seed), { sport: row?.diary.name, k, n }),
    };
  };

  // A-9: only one sport in the profile, nothing to compare.
  if (totalSports < 2) return [phrase('A-9', null)];

  // "Few entries" = exactly one training of the sport in the period (V-28, q.2).
  // Such a sport takes no part in the comparison and only gets A-8.
  const few = active.filter((r) => r.stats.total === 1);
  const counted = active.filter((r) => r.stats.total >= 2);

  // Candidates in Yana's order of importance:
  // A-5 → A-3 / A-4 → A-7 → A-1 → A-2 → A-6 → A-8 (last).
  const candidates = [];

  for (const r of counted) {
    // A-5: "Смыло" on at least half of this sport's trainings (V-28, q.4).
    if (r.stats.wipedOut * 2 >= r.stats.total) candidates.push(phrase('A-5', r));
  }
  for (const r of counted) {
    const { ePlus, eMinus, mPlus, mMinus, total, emoTotal } = r.stats;
    if (moreOften(eMinus, ePlus) && moreOften(mPlus, mMinus)) candidates.push(phrase('A-3', r, mPlus, total));
    if (moreOften(ePlus, eMinus) && moreOften(mMinus, mPlus)) candidates.push(phrase('A-4', r, ePlus, emoTotal));
  }
  for (const r of counted) {
    const shift = emotionShift(r.list);
    if (shift) candidates.push(phrase(`A-7-${shift}`, r));
  }
  // Leader and heavy need at least two sports to compare.
  const ranked = counted.filter((r) => r.stats.emoTotal > 0);
  if (ranked.length >= 2) {
    // A-1: any lead is enough, but the leader itself must be more often in plus (V-28, q.5).
    const leader = uniqueTop(ranked, (r) => r.stats.ePlus / r.stats.emoTotal);
    if (leader && moreOften(leader.stats.ePlus, leader.stats.eMinus)) {
      candidates.push(phrase('A-1', leader, leader.stats.ePlus, leader.stats.emoTotal));
    }
    // A-2: same rule, more often in minus.
    const heavy = uniqueTop(ranked, (r) => r.stats.eMinus / r.stats.emoTotal);
    if (heavy && moreOften(heavy.stats.eMinus, heavy.stats.ePlus)) {
      candidates.push(phrase('A-2', heavy, heavy.stats.eMinus, heavy.stats.emoTotal));
    }
  }

  // Leave the last slot for A-8 if some sport has only one training.
  const limit = few.length > 0 ? MAX_PHRASES - 1 : MAX_PHRASES;

  // Rule 1: one phrase per sport.
  const chosen = [];
  const usedSports = new Set();
  for (const c of candidates) {
    if (chosen.length >= limit) break;
    if (usedSports.has(c.sportKey)) continue;
    chosen.push(c);
    usedSports.add(c.sportKey);
  }

  // Rule 2: after a heavy phrase, if possible, a support (A-1 or A-7 "better"),
  // so the summary doesn't end on a minus.
  const firstHeavy = chosen.findIndex((c) => c.heavy);
  if (firstHeavy !== -1 && !chosen.some((c) => c.support)) {
    const support = candidates.find((c) => c.support && !usedSports.has(c.sportKey));
    if (support) {
      if (chosen.length >= limit && chosen.length - 1 !== firstHeavy) chosen.pop();
      if (chosen.length < limit) chosen.splice(firstHeavy + 1, 0, support);
    }
  }

  // A-6: even, no clear leader — only when nothing else was found.
  if (chosen.length === 0 && counted.length >= 2) chosen.push(phrase('A-6', null));

  // A-8 always goes last. One sport is enough: the card stays short.
  if (few.length > 0) chosen.push(phrase('A-8', few[0]));

  return chosen.map(({ id, text }) => ({ id, text }));
}
