// Which pieces of the advice a training gets (decision R-38, 2026-11-13).
//
// Pure function: no texts, no storage, no screens. It gets the training and
// the picks of earlier trainings and returns ids of the pieces to show.
// The pick is saved inside the training, so an old training always shows the
// same advice, and "what was already read" comes from earlier trainings.
//
// Order of rules:
// 1. Tone: count emotions marked with buttons (incl. "Было и другое").
//    More good -> advice about good, more hard -> about hard, equal -> two advices.
//    Words from notes don't change this balance.
// 2. Group inside the tone: most marked emotions; note words add +1.
//    Equal -> Yana's importance order, but if the previous advice of this tone
//    was about that group, take the next one.
// 3. Special cases (layer 3) replace the assembly; С-27 when good wins but
//    something hard is marked too, never twice in a row.
// 4. Variants go in a circle per slot: base first, then extras, then again.

import {
  EMOTION_GROUPS,
  MOTIVATION_GROUPS,
  SPECIAL_CASES,
  GOOD_WITH_HARD_ID,
  ENDING_VARIANTS,
  TIP_IDS,
} from './catalog.js';

const groupOfOption = (groups) =>
  Object.fromEntries(groups.flatMap((g) => g.options.map((code) => [code, g])));

const EMOTION_GROUP_OF = groupOfOption(EMOTION_GROUPS);
const MOTIVATION_GROUP_OF = groupOfOption(MOTIVATION_GROUPS);

const goodBag = (motivation) => (motivation === 'forward' ? 'catch_wave' : 'sunbathing');
const hardBag = (motivation) => (motivation === 'forward' ? 'paddling' : 'wiped_out');

// Counts marked options per group: Map(group -> count).
function countByGroup(codes, groupOf) {
  const counts = new Map();
  for (const code of codes) {
    const g = groupOf[code];
    if (g) counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  return counts;
}

// Group with the most marks; ties by rank, rotating away from `lastId`.
function pickGroup(counts, lastId) {
  if (counts.size === 0) return null;
  const max = Math.max(...counts.values());
  const tied = [...counts.entries()]
    .filter(([, n]) => n === max)
    .map(([g]) => g)
    .sort((a, b) => a.rank - b.rank);
  if (tied.length > 1 && tied[0].id === lastId) return tied[1];
  return tied[0];
}

// Index of the variant for a slot: how many times the slot was used before.
function variantFor(slot, variants, used) {
  if (variants.length === 0) return null;
  const n = used.filter((s) => s === slot).length;
  return variants[n % variants.length];
}

// All slot keys used by earlier picks, oldest first.
function usedSlots(history) {
  return history.flatMap((pick) => pick?.slots ?? []);
}

// Last emotion group picked for a tone ('good' | 'hard'), if any.
function lastGroupOfTone(history, tone) {
  for (let i = history.length - 1; i >= 0; i--) {
    const found = history[i]?.advices?.find((a) => a.tone === tone && a.group);
    if (found) return found.group;
  }
  return null;
}

/**
 * @param entry   saved training: { tone, emotions, motivation, motivationOptions }
 *                emotions are dictionary codes (use dictionaryCode() for "Точно ничего?" words)
 * @param sportGroup  group of the sport (data/sports.js), 'neutral' for own sport
 * @param history     picks of earlier trainings, oldest first
 * @param noteCodes   dictionary codes found in the notes (keyword matching, later)
 * @returns pick to save in the entry, or null if there is nothing to advise on
 */
export function selectAdvice(entry, sportGroup, history = [], noteCodes = []) {
  const emotionCounts = countByGroup(entry.emotions ?? [], EMOTION_GROUP_OF);
  const good = new Map([...emotionCounts].filter(([g]) => g.tone === 'good'));
  const hard = new Map([...emotionCounts].filter(([g]) => g.tone === 'hard'));
  const sum = (m) => [...m.values()].reduce((a, b) => a + b, 0);
  const goodCount = sum(good);
  const hardCount = sum(hard);
  if (goodCount + hardCount === 0) return null; // "really nothing": no emotion advice

  // Note words: +1 to their group, only inside a tone that already has marks.
  for (const g of countByGroup(noteCodes, EMOTION_GROUP_OF).keys()) {
    const side = g.tone === 'good' ? good : hard;
    if (side.size > 0) side.set(g, (side.get(g) ?? 0) + 1);
  }

  const tones =
    goodCount > hardCount ? ['good'] : hardCount > goodCount ? ['hard'] : ['hard', 'good'];

  const used = usedSlots(history);
  const slots = [];
  const take = (slot, variants) => {
    const id = variantFor(slot, variants, used);
    if (id) slots.push(slot);
    return id;
  };

  // Motivation group (part 3): from options of the chosen sign.
  const motivationGroup = pickGroup(
    countByGroup(
      (entry.motivationOptions ?? []).filter(
        (c) => MOTIVATION_GROUP_OF[c]?.sign === entry.motivation,
      ),
      MOTIVATION_GROUP_OF,
    ),
    null,
  );

  const advices = tones.map((tone) => {
    const group = pickGroup(tone === 'good' ? good : hard, lastGroupOfTone(history, tone));
    return { tone, group: group.id, groupName: group.name, part12: null, special: null };
  });

  let bag = entry.tone === 'good' ? goodBag(entry.motivation) : hardBag(entry.motivation);
  let lineType = tones.length === 2 ? 'tie' : hardCount && goodCount ? 'mixed' : 'single';

  // Special cases only when there is one advice (a special case has its own part 3).
  if (advices.length === 1) {
    const a = advices[0];
    const lastWasGoodWithHard = history.at(-1)?.advices?.[0]?.special === GOOD_WITH_HARD_ID;
    const goodWithHard =
      a.tone === 'good' && hardCount > 0 && !lastWasGoodWithHard
        ? { id: GOOD_WITH_HARD_ID, bag: goodBag(entry.motivation) }
        : null;
    const special =
      goodWithHard ??
      SPECIAL_CASES.find(
        (s) => s.emotion.includes(a.group) && s.motivation === motivationGroup?.id,
      );
    if (special) {
      a.special = special.id;
      bag = special.bag;
      if (special.id === GOOD_WITH_HARD_ID) lineType = 'good_with_hard';
    }
  }

  for (const a of advices) {
    if (a.special) continue;
    const group = EMOTION_GROUPS.find((g) => g.id === a.group);
    a.part12 = take(`emo:${group.id}`, group.variants);
  }

  const hasSpecial = advices.some((a) => a.special);
  const part3 =
    hasSpecial || !motivationGroup
      ? null
      : take(`mot:${motivationGroup.id}`, motivationGroup.variants);
  const ending = take(`end:${bag}:${sportGroup}`, ENDING_VARIANTS[bag] ?? []);
  const tip = take('tip', TIP_IDS);

  return {
    version: 1,
    advices,
    motivationGroup: motivationGroup?.id ?? null,
    part3,
    bag,
    sportGroup,
    ending,
    tip,
    lineType,
    slots,
  };
}
