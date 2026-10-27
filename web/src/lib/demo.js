import { optionsOfKind } from '../data/options.js';

// Demo data for checking screens. Open the app with ?demo in the address to use it.
// Mirrors the example on mockup G-9: surfing, padel, hobby-horsing.

export const isDemo = new URLSearchParams(window.location.search).has('demo');

export const DEMO_DIARIES = [
  { key: 'surfing', code: 'surfing', name: 'Сёрфинг', color: '#076a65' },
  { key: 'padel', code: 'padel', name: 'Падел', color: '#e0602b' },
  { key: 'hobby_horsing', code: 'hobby_horsing', name: 'Хобби-хорсинг', color: '#6a5ae0' },
];

// Small seeded random generator so the demo looks the same every time.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const pick = (rand, list, n) =>
  [...list].sort(() => rand() - 0.5).slice(0, n).map((o) => o.code);

function makeEntries(diaryKey, count, lastDaysAgo, seed) {
  const rand = seeded(seed);
  const entries = [];
  for (let i = 0; i < count; i += 1) {
    const daysAgo = lastDaysAgo + (count - 1 - i) * 2;
    const date = new Date(Date.now() - daysAgo * 86400000);
    const good = rand() > 0.4;
    const forward = rand() > 0.35;
    entries.push({
      id: `${diaryKey}-${i}`,
      diaryKey,
      trainingDate: date.toISOString().slice(0, 10),
      createdAt: date.getTime(),
      tone: good ? 'good' : 'hard',
      emotions: [
        ...pick(rand, optionsOfKind(good ? 'E+' : 'E-'), 1 + Math.floor(rand() * 3)),
        ...(rand() > 0.6 ? pick(rand, optionsOfKind(good ? 'E-' : 'E+'), 1) : []),
      ],
      motivation: forward ? 'forward' : 'not_forward',
      motivationOptions: pick(rand, optionsOfKind(forward ? 'M+' : 'M-'), 1 + Math.floor(rand() * 2)),
      emotionNote: '',
      motivationNote: '',
    });
  }
  return entries;
}

export const DEMO_ENTRIES = [
  ...makeEntries('surfing', 12, 0, 11),
  ...makeEntries('padel', 6, 3, 22),
  ...makeEntries('hobby_horsing', 3, 7, 33),
];
