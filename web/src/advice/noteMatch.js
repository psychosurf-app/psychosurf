// Finds Yana's dictionary words in the note to emotions (R-4, R-38).
//
// Pure function, no AI: plain word matching against the list in data/noteWords.js.
// Russian words change their endings ("устал", "устала", "устали"), so each
// dictionary word is cut to its stem and matched as the start of a word in the note:
// - "ся/сь" and trailing vowels are cut: "испугался" -> "испугал" finds "испугалась";
// - words of 3 letters or less must match exactly ("эх", "не то");
// - short stems take only a short ending: "вялый" finds "вялая", "мало" not "малыш";
// - "не …" right before a word cancels it: "не устала" is not "устал";
// - a phrase that Yana put under two different groups ("обидно", "бесит") is
//   skipped, so a note never pushes the advice to the wrong group.

import { NOTE_WORDS } from '../data/noteWords.js';
import { OPTION_BY_CODE } from '../data/options.js';
import { EMOTION_GROUPS } from './catalog.js';

const normalize = (s) =>
  (s ?? '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9-]+/g, ' ')
    .trim();

function stem(word) {
  if (word.length <= 3) return { exact: word };
  const cut = word.replace(/(ся|сь)$/, '').replace(/[аеиоуыэюяйь]+$/, '');
  return cut.length >= 2 ? { prefix: cut } : { exact: word };
}

// Short stems ("вял", "мал", "зл") allow only a short ending after them, so
// "вялая" matches but "малыш" or "злоупотреблять" do not.
const matchesWord = (token, s) => {
  if (s.exact) return token === s.exact;
  if (!token.startsWith(s.prefix)) return false;
  return s.prefix.length >= 4 || /^[аеиоуыэюяйьмх]{0,2}$/.test(token.slice(s.prefix.length));
};

const groupOfCode = Object.fromEntries(
  EMOTION_GROUPS.flatMap((g) => g.options.map((c) => [c, g.id])),
);

// All phrases with their codes; phrases shared by two groups are dropped.
function buildPhrases() {
  const byPhrase = new Map();
  for (const [code, words] of Object.entries(NOTE_WORDS)) {
    const label = OPTION_BY_CODE[code]?.label;
    for (const raw of [label, ...words].filter(Boolean)) {
      const key = normalize(raw);
      if (!byPhrase.has(key)) byPhrase.set(key, new Set());
      byPhrase.get(key).add(code);
    }
  }
  const phrases = [];
  for (const [key, codes] of byPhrase) {
    const groups = new Set([...codes].map((c) => groupOfCode[c]));
    if (groups.size > 1) continue;
    const words = key.split(' ');
    phrases.push({ words: words.map(stem), negated: words[0] === 'не', codes: [...codes] });
  }
  return phrases;
}

const PHRASES = buildPhrases();

/**
 * @param note  text of the note to emotions
 * @returns dictionary codes found in it, each once (e.g. ['Сл-18', 'Сл-30'])
 */
export function noteCodes(note) {
  const tokens = normalize(note).split(' ').filter(Boolean);
  const found = new Set();
  for (const p of PHRASES) {
    for (let i = 0; i + p.words.length <= tokens.length; i++) {
      if (!p.words.every((s, k) => matchesWord(tokens[i + k], s))) continue;
      const before = tokens[i - 1];
      if (!p.negated && (before === 'не' || before === 'ни')) continue;
      p.codes.forEach((c) => found.add(c));
      break;
    }
  }
  return [...found];
}

// Phrases that are skipped because Yana listed them under two groups (for the sheet).
export const SKIPPED_SHARED = (() => {
  const seen = new Map();
  for (const [code, words] of Object.entries(NOTE_WORDS)) {
    for (const w of words) {
      const k = normalize(w);
      seen.set(k, new Set([...(seen.get(k) ?? []), groupOfCode[code]]));
    }
  }
  return [...seen].filter(([, g]) => g.size > 1).map(([k]) => k);
})();
