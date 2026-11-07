// Sport list from Yana's mockup G-8 v3 (idea I-25). Codes match the `sports` table in docs/data-model.md.
// `group` picks the sport-specific heading of advice part 3 and the final line
// (idea I-37, column M of the advice pool). Groups were approved by Yana on 2026-10-29.
export const SPORTS = [
  { code: 'surfing', group: 'water', name: 'Сёрфинг' },
  { code: 'wakesurfing', group: 'water', name: 'Вейксёрфинг' },
  { code: 'wakeboarding', group: 'water', name: 'Вейкбординг' },
  { code: 'running', group: 'endurance', name: 'Бег' },
  { code: 'yoga', group: 'body', name: 'Йога' },
  { code: 'swimming', group: 'water', name: 'Плавание' },
  { code: 'rowing', group: 'water', name: 'Гребля' },
  { code: 'cycling', group: 'endurance', name: 'Велоспорт' },
  { code: 'gym', group: 'gym', name: 'Тренажёрный зал' },
  { code: 'snowboarding', group: 'mountain', name: 'Сноуборд' },
  { code: 'alpine_skiing', group: 'mountain', name: 'Горные лыжи' },
  { code: 'tennis', group: 'ball', name: 'Теннис' },
  { code: 'padel', group: 'ball', name: 'Падел' },
  { code: 'football', group: 'ball', name: 'Футбол' },
  { code: 'martial_arts', group: 'combat', name: 'Единоборства' },
  { code: 'climbing', group: 'mountain', name: 'Скалолазание' },
  { code: 'crossfit', group: 'gym', name: 'Кроссфит' },
  { code: 'dancing', group: 'body', name: 'Танцы' },
  { code: 'hobby_horsing', group: 'neutral', name: 'Хобби-хорсинг' },
];

// The 8 sport groups of idea I-37, in Yana's order.
export const SPORT_GROUPS = {
  water: 'Вода',
  mountain: 'Горы и склон',
  gym: 'Зал и сила',
  endurance: 'Бег и выносливость',
  ball: 'Игры с мячом и ракеткой',
  combat: 'Единоборства',
  body: 'Тело и движение',
  neutral: 'Нейтральная версия',
};

// Group of a diary's sport. A custom sport ("Добавить свой", code null) and
// anything unknown always get the neutral group (I-37).
export function sportGroup(code) {
  return SPORTS.find((s) => s.code === code)?.group ?? 'neutral';
}

// Diary colors, assigned in the order sports are picked.
// First three are from the mockups; the rest are placeholders until Yana sets a palette.
export const DIARY_COLORS = [
  '#076a65', // teal
  '#e0602b', // orange
  '#6a5ae0', // purple
  '#d39b1c', // mustard
  '#2f7fd8', // blue
  '#c2407a', // raspberry
  '#4f8a3a', // green
  '#8a5a44', // brown
];
