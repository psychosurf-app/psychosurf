import { OPTION_BY_CODE } from '../data/options.js';

// Chart point formulas from decision R-25.
// An entry looks like:
// { tone: 'good' | 'hard' | 'numb', emotions: [codes], motivation: 'forward' | 'not_forward' | null, motivationOptions: [codes] }

// Share of chosen options whose kind matches `kind`. Empty choice counts as full strength.
// Open question V-23: what to do when nothing is chosen. Until Yana answers, we use 1.
function shareOfKind(codes, kind) {
  const known = codes.map((c) => OPTION_BY_CODE[c]).filter(Boolean);
  if (known.length === 0) return 1;
  return known.filter((o) => o.kind === kind).length / known.length;
}

// Emotion point: sign from tone, height = share of chosen emotions of that sign. Range -1..1.
export function emotionPoint(entry) {
  if (entry.tone === 'good') return shareOfKind(entry.emotions, 'E+');
  if (entry.tone === 'hard') return -shareOfKind(entry.emotions, 'E-');
  return 0;
}

// Motivation point: sign from "pulls forward / doesn't", height = share of options of that sign.
export function motivationPoint(entry) {
  if (entry.motivation === 'forward') return shareOfKind(entry.motivationOptions, 'M+');
  if (entry.motivation === 'not_forward') return -shareOfKind(entry.motivationOptions, 'M-');
  return 0;
}

// Order entries the way charts show them: by training date, then by save time (R-26).
export function sortEntries(entries) {
  return [...entries].sort(
    (a, b) => a.trainingDate.localeCompare(b.trainingDate) || a.createdAt - b.createdAt,
  );
}
