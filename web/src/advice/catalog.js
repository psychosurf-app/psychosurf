// Map of Yana's advice pool WITHOUT the texts (decision R-38, 2026-11-13).
//
// Only ids, groups and which dictionary options belong to which group.
// The texts themselves never go into this public repo (R-34): they live in
// the separate test build (R-39) and later on the server.
// Source of truth: sheet "Пул советов" (columns № and "Состояние / эмоция").
//
// Variant lists are ordered: the first id is the base text, the rest are
// extra variants in number order (V-43, item 5). Add new variants to the end.

// Emotion groups, layer 2 (parts 1-2 of an advice).
// `rank`: Yana's order of importance, 1 = most important (V-42).
// `name`: what the user sees (I-50); ids stay internal.
export const EMOTION_GROUPS = [
  { id: 'empty', name: 'Пустота', tone: 'hard', rank: 1,
    options: ['Сл-24', 'Сл-25'], variants: ['С-6'] },
  { id: 'fear', name: 'Страх и тревога', tone: 'hard', rank: 2,
    options: ['Сл-29', 'Сл-30', 'Сл-33'], variants: ['С-9'] },
  { id: 'anger', name: 'Злость и раздражение', tone: 'hard', rank: 3,
    options: ['Сл-34', 'Сл-35', 'Сл-38', 'Сл-39'], variants: ['С-10'] },
  { id: 'selfcrit', name: 'Самокритика', tone: 'hard', rank: 4,
    options: ['Сл-28', 'Сл-31', 'Сл-32', 'Сл-36'], variants: ['С-8'] },
  { id: 'tired', name: 'Усталость', tone: 'hard', rank: 5,
    options: ['Сл-18', 'Сл-19', 'Сл-20', 'Сл-21', 'Сл-22', 'Сл-23'], variants: ['С-5'] },
  { id: 'letdown', name: 'Разочарование', tone: 'hard', rank: 6,
    options: ['Сл-26', 'Сл-27', 'Сл-37'], variants: ['С-7'] },
  { id: 'pride', name: 'Гордость', tone: 'good', rank: 7,
    options: ['Сл-3', 'Сл-10', 'Сл-11', 'Сл-17'],
    variants: ['С-12', 'С-12.2', 'С-12.3', 'С-12.4', 'С-12.5'] },
  { id: 'lift', name: 'Подъём', tone: 'good', rank: 8,
    options: ['Сл-1', 'Сл-2', 'Сл-5', 'Сл-6', 'Сл-7', 'Сл-8'],
    variants: ['С-11', 'С-11.2', 'С-11.3', 'С-11.4', 'С-11.5'] },
  { id: 'calm', name: 'Покой', tone: 'good', rank: 9,
    options: ['Сл-4', 'Сл-9', 'Сл-12', 'Сл-13', 'Сл-14', 'Сл-15', 'Сл-16'],
    variants: ['С-13', 'С-13.2', 'С-13.3', 'С-13.4', 'С-13.5'] },
];

// Motivation groups, layer 2 (part 3 of an advice).
// No importance order from Yana yet: `rank` follows the sheet order and is
// only used when two groups have the same number of marked options.
export const MOTIVATION_GROUPS = [
  { id: 'interest', name: 'Интерес', sign: 'forward', rank: 1,
    options: ['Сл-41', 'Сл-43', 'Сл-44', 'Сл-45'],
    variants: ['С-14', 'С-14.2', 'С-14.3', 'С-14.4', 'С-14.5'] },
  { id: 'goal', name: 'Цель', sign: 'forward', rank: 2,
    options: ['Сл-42', 'Сл-46', 'Сл-47', 'Сл-48'],
    variants: ['С-15', 'С-15.2', 'С-15.3', 'С-15.4', 'С-15.5'] },
  { id: 'duty', name: 'Долг', sign: 'forward', rank: 3,
    options: ['Сл-49'], variants: ['С-16'] },
  { id: 'boredom', name: 'Скука', sign: 'not_forward', rank: 4,
    options: ['Сл-50', 'Сл-51', 'Сл-55'], variants: ['С-17'] },
  { id: 'reluctant', name: 'Через не хочу', sign: 'not_forward', rank: 5,
    options: ['Сл-52', 'Сл-53', 'Сл-54'], variants: ['С-18'] },
  { id: 'quit', name: 'Хочу бросить', sign: 'not_forward', rank: 6,
    options: ['Сл-56', 'Сл-57'], variants: ['С-19'] },
  { id: 'ceiling', name: 'Потолок', sign: 'not_forward', rank: 7,
    options: ['Сл-58', 'Сл-59'], variants: ['С-20'] },
];

// Special cases, layer 3: a full advice that replaces the assembly.
// `emotion` lists emotion groups that trigger it, `motivation` the motivation group.
// `bag`: whose part-3 heading and final line it uses.
export const SPECIAL_CASES = [
  { id: 'С-21', emotion: ['tired', 'empty'], motivation: 'duty', bag: 'paddling' },
  { id: 'С-22', emotion: ['empty'], motivation: 'quit', bag: 'wiped_out' },
  { id: 'С-23', emotion: ['fear'], motivation: 'goal', bag: 'paddling' },
  { id: 'С-24', emotion: ['anger'], motivation: 'quit', bag: 'wiped_out' },
  { id: 'С-25', emotion: ['selfcrit'], motivation: 'duty', bag: 'paddling' },
  { id: 'С-26', emotion: ['pride'], motivation: 'ceiling', bag: 'sunbathing' },
  { id: 'С-28', emotion: ['calm'], motivation: 'boredom', bag: 'sunbathing' },
  { id: 'С-29', emotion: ['fear'], motivation: 'quit', bag: 'wiped_out' },
];

// С-27: good training + something hard in "Было и другое". Its bag follows motivation.
export const GOOD_WITH_HARD_ID = 'С-27';

// Part-3 heading + final line, per bag and sport group (column M of the base advice).
// One ending per pair for now; extra variants of final lines go after the base id.
export const ENDING_VARIANTS = {
  catch_wave: ['С-1'],
  sunbathing: ['С-3'],
  paddling: ['С-2'],
  wiped_out: ['С-4'],
};

// "Приём дня" (I-47): one shared circle, not tied to emotions. Empty until Yana writes them.
export const TIP_IDS = [];
