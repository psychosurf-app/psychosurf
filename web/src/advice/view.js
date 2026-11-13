// Turns a saved pick (ids, R-38) into what the advice screen shows (G-23).
// No texts are written here: everything comes from Yana's pool or her
// approved line templates (I-50). Nothing is generated (R-8).

import { EMOTION_GROUPS } from './catalog.js';
import { OPTION_BY_CODE, dictionaryCode } from '../data/options.js';

export const PART_TITLES = { part1: 'Что происходит', part2: 'На что обратить внимание' };

export const ARTICLE_TITLES = {
  burnout: 'Почитать про выгорание',
  trauma: 'Почитать про травмы',
  emotions: 'Почитать про эмоции',
};

const groupById = Object.fromEntries(EMOTION_GROUPS.map((g) => [g.id, g]));
const groupOfCode = Object.fromEntries(
  EMOTION_GROUPS.flatMap((g) => g.options.map((c) => [c, g])),
);

// Label in the accusative case: "Ты отметил апатию", not "апатия".
// In the dictionary only feminine nouns start a label with -а/-я
// (Эйфория, Апатия, Досада, Самокритика, Тревога, Агрессия), so the first word is enough.
// Words of the "Точно ничего?" screen are phrases, they go in quotes as they are.
function label(code) {
  const o = OPTION_BY_CODE[code];
  if (!o) return '';
  if (o.nothingOnly) return `«${o.label.toLowerCase()}»`;
  const [first, ...rest] = o.label.toLowerCase().split(' ');
  const acc = first.endsWith('я') ? `${first.slice(0, -1)}ю` : first.endsWith('а') ? `${first.slice(0, -1)}у` : first;
  return [acc, ...rest].join(' ');
}

// "a", "a и b", "a, b и c"; more than 3 -> first 3 + "и ещё N" (wording pending, V-46).
export function listEmotions(codes) {
  const labels = codes.map(label).filter(Boolean);
  if (labels.length === 0) return '';
  if (labels.length > 3) return `${labels.slice(0, 3).join(', ')} и ещё ${labels.length - 3}`;
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(', ')} и ${labels.at(-1)}`;
}

// Marked emotions split by tone and by group.
function marked(entry) {
  const codes = entry.emotions ?? [];
  const of = (pred) => codes.filter((c) => pred(groupOfCode[dictionaryCode(c)]));
  return {
    good: of((g) => g?.tone === 'good'),
    hard: of((g) => g?.tone === 'hard'),
    inGroup: (id) => of((g) => g?.id === id),
  };
}

// The small line above the advice (I-50, texts approved by Yana 2026-11-10).
// Returns null where Yana has no line yet (other special cases, group only from a note).
export function introLine(entry, pick) {
  const m = marked(entry);
  const first = pick.advices[0];
  if (pick.lineType === 'tie') {
    return `Сегодня у тебя было поровну и хорошего, и непростого: ${listEmotions(m.good)}, а рядом ${listEmotions(m.hard)}. Поэтому сегодня два совета — о каждом состоянии.`;
  }
  if (pick.lineType === 'good_with_hard') {
    return `Ты отметил ${listEmotions(m.good)}, но в «Было и другое» добавил ${listEmotions(m.hard)}. Тренировка прошла хорошо, а рядом было и что-то тяжёлое. Этот совет — о таком сочетании.`;
  }
  if (first.special) return null;
  const name = groupById[first.group].name;
  if (pick.lineType === 'mixed') {
    const main = first.tone === 'good' ? m.good : m.hard;
    const rest = first.tone === 'good' ? m.hard : m.good;
    return `Ты отметил ${listEmotions(main)}, а ещё немного ${listEmotions(rest)}. Больше всего твоих чувств — о состоянии «${name}», поэтому совет о нём.`;
  }
  const own = m.inGroup(first.group);
  if (own.length === 0) return null;
  return `Ты отметил ${listEmotions(own)}. Похожие чувства мы объединяем в состояние «${name}». Каждый раз совет раскрывает его с новой стороны.`;
}

// Everything the screen needs, read from the pool by ids.
export function adviceView(entry, pick, pool) {
  const piece = (id) => (id ? pool.pieces[id] ?? {} : {});
  const ending = pool.endings[pick.ending]?.[pick.sportGroup] ?? null;

  const tabs = pick.advices.map((a) => {
    const p = piece(a.special ?? a.part12);
    return {
      key: a.special ?? a.part12,
      groupName: a.special ? null : groupById[a.group].name,
      part1: p.part1 ?? null,
      part2: p.part2 ?? null,
      articles: p.articles ?? [],
    };
  });

  // Part 3: of the special case, or of the motivation group (shared for two advices).
  const special = pick.advices.find((a) => a.special);
  const part3Piece = special ? piece(special.special) : piece(pick.part3);

  const articles = [
    ...new Set([...tabs.flatMap((t) => t.articles), ...(special ? [] : part3Piece.articles ?? [])]),
  ];

  return {
    intro: introLine(entry, pick),
    tabs,
    part3: part3Piece.part3 ?? null,
    part3Title: ending?.heading ?? 'Как двигаться дальше',
    finalLine: ending?.line ?? null,
    articles,
  };
}
