// Turns a saved pick (ids, R-38) into what the advice screen shows (G-23).
// No texts are written here: everything comes from Yana's pool or her
// approved line templates (I-50). Nothing is generated (R-8).

import { EMOTION_GROUPS, MOTIVATION_GROUPS, MOTIVATION_TIE_REASONS } from './catalog.js';
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

// "a", "a и b", "a, b и c": all marked emotions, no limit (V-46, Yana 2026-11-13).
const joinRu = (labels) =>
  labels.length <= 1 ? (labels[0] ?? '') : `${labels.slice(0, -1).join(', ')} и ${labels.at(-1)}`;

export function listEmotions(codes) {
  return joinRu(codes.map(label).filter(Boolean));
}

// Motivation options go in quotes as they are: they are phrases, not nouns (I-51).
export function listMotivation(codes) {
  return joinRu(
    codes.map((c) => OPTION_BY_CODE[c]?.label).filter(Boolean).map((l) => `«${l.toLowerCase()}»`),
  );
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

const motivationGroupById = Object.fromEntries(MOTIVATION_GROUPS.map((g) => [g.id, g]));
const motivationGroupOfCode = Object.fromEntries(
  MOTIVATION_GROUPS.flatMap((g) => g.options.map((c) => [c, g])),
);

// The small line above part 3 (I-51, texts approved by Yana 2026-11-13).
// Shown whenever part 3 comes from a motivation group. On a tie between two
// groups Yana adds a reason why we talk about this one; until her reason for
// that group is approved, the line names only the options of the chosen group.
export function motivationLine(entry, pick) {
  const group = motivationGroupById[pick.motivationGroup];
  if (!group || !pick.part3) return null;
  const options = (entry.motivationOptions ?? []).filter(
    (c) => motivationGroupOfCode[c]?.sign === entry.motivation,
  );
  const counts = new Map();
  for (const c of options) {
    const g = motivationGroupOfCode[c];
    counts.set(g.id, (counts.get(g.id) ?? 0) + 1);
  }
  const max = Math.max(...counts.values());
  const tie = [...counts.values()].filter((n) => n === max).length > 1;
  const reason = MOTIVATION_TIE_REASONS[group.id];
  const shown = tie && !reason ? options.filter((c) => motivationGroupOfCode[c].id === group.id) : options;
  const line = `Про мотивацию ты отметил ${listMotivation(shown)}. Такой настрой мы называем «${group.name}».`;
  return tie && reason ? `${line} Сегодня поговорим про «${group.name}»: ${reason}` : line;
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
      flag: p.flag ?? null,
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
    motivationLine: special ? null : motivationLine(entry, pick),
    tabs,
    part3: part3Piece.part3 ?? null,
    part3Title: ending?.heading ?? 'Как двигаться дальше',
    finalLine: ending?.line ?? null,
    articles,
  };
}
