// Emotion and motivation options from Yana's dictionary (sheet "Словарь", status "Готово", 2026-10-27).
// Source of truth is the sheet; code = row number there. Сл-40 "Ничего не чувствую" is a tone, not an option.
export const OPTIONS = [
  { code: 'Сл-1', label: 'Отличное настроение', kind: 'E+' },
  { code: 'Сл-2', label: 'Эйфория', kind: 'E+' },
  { code: 'Сл-3', label: 'Гордость за себя', kind: 'E+' },
  { code: 'Сл-4', label: 'Благодарность себе и своему телу', kind: 'E+' },
  { code: 'Сл-5', label: 'Воодушевление', kind: 'E+' },
  { code: 'Сл-6', label: 'Азарт', kind: 'E+' },
  { code: 'Сл-7', label: 'Заряженность', kind: 'E+' },
  { code: 'Сл-8', label: 'Лёгкость', kind: 'E+' },
  { code: 'Сл-9', label: 'Удовлетворённость', kind: 'E+' },
  { code: 'Сл-10', label: 'Уверенность в своих силах', kind: 'E+' },
  { code: 'Сл-11', label: 'Чувство победы', kind: 'E+' },
  { code: 'Сл-12', label: 'Умиротворение', kind: 'E+' },
  { code: 'Сл-13', label: 'Расслабленность', kind: 'E+' },
  { code: 'Сл-14', label: 'Ясность в голове', kind: 'E+' },
  { code: 'Сл-15', label: 'Внутренний баланс', kind: 'E+' },
  { code: 'Сл-16', label: 'Чувство свободы', kind: 'E+' },
  { code: 'Сл-17', label: 'Чувство собственной значимости', kind: 'E+' },
  { code: 'Сл-18', label: 'Усталость', kind: 'E-' },
  { code: 'Сл-19', label: 'Тяжесть', kind: 'E-' },
  { code: 'Сл-20', label: 'Разбитость', kind: 'E-' },
  { code: 'Сл-21', label: 'Вялость', kind: 'E-' },
  { code: 'Сл-22', label: 'Бессилие', kind: 'E-' },
  { code: 'Сл-23', label: 'Сонливость', kind: 'E-' },
  { code: 'Сл-24', label: 'Апатия', kind: 'E-' },
  { code: 'Сл-25', label: 'Опустошённость', kind: 'E-' },
  { code: 'Сл-26', label: 'Разочарование', kind: 'E-' },
  { code: 'Сл-27', label: 'Досада', kind: 'E-' },
  { code: 'Сл-28', label: 'Стыд', kind: 'E-' },
  { code: 'Сл-29', label: 'Неуверенность', kind: 'E-' },
  { code: 'Сл-30', label: 'Страх', kind: 'E-' },
  { code: 'Сл-31', label: 'Самокритика', kind: 'E-' },
  { code: 'Сл-32', label: 'Сравнение с другими', kind: 'E-' },
  { code: 'Сл-33', label: 'Тревога', kind: 'E-' },
  { code: 'Сл-34', label: 'Нервозность', kind: 'E-' },
  { code: 'Сл-35', label: 'Агрессия', kind: 'E-' },
  { code: 'Сл-36', label: 'Недооценённость', kind: 'E-' },
  { code: 'Сл-37', label: 'Неудовлетворённость', kind: 'E-' },
  { code: 'Сл-38', label: 'Протест', kind: 'E-' },
  { code: 'Сл-39', label: 'Злость', kind: 'E-' },
  { code: 'Сл-41', label: 'Вдохновение', kind: 'M+' },
  { code: 'Сл-42', label: 'Жажда новых целей', kind: 'M+' },
  { code: 'Сл-43', label: 'Интерес', kind: 'M+' },
  { code: 'Сл-44', label: 'Любопытство', kind: 'M+' },
  { code: 'Сл-45', label: 'Предвкушение', kind: 'M+' },
  { code: 'Сл-46', label: 'Решимость', kind: 'M+' },
  { code: 'Сл-47', label: 'Желание прогресса', kind: 'M+' },
  { code: 'Сл-48', label: 'Целеустремлённость', kind: 'M+' },
  { code: 'Сл-49', label: 'Обязан продолжать ради цели', kind: 'M+' },
  { code: 'Сл-50', label: 'Скука', kind: 'M-' },
  { code: 'Сл-51', label: 'Безразличие', kind: 'M-' },
  { code: 'Сл-52', label: 'Лень', kind: 'M-' },
  { code: 'Сл-53', label: 'Сопротивление', kind: 'M-' },
  { code: 'Сл-54', label: 'Через силу', kind: 'M-' },
  { code: 'Сл-55', label: 'Отсутствие интереса', kind: 'M-' },
  { code: 'Сл-56', label: 'Желание бросить', kind: 'M-' },
  { code: 'Сл-57', label: 'Не моё', kind: 'M-' },
  { code: 'Сл-58', label: 'Расти некуда', kind: 'M-' },
  { code: 'Сл-59', label: 'Достиг своего потолка', kind: 'M-' },
];

// Close emotions on the "Точно ничего?" screen (I-20, mockup G-13 v3), groups and signs by Yana.
// "Усталость" (Сл-18) and "Опустошённость" (Сл-25) are dictionary options; the rest are proposed as Сл-60 — Сл-68 (question V-32).
// `nothingOnly`: shown only on that screen, not in the usual emotion lists of step 2.
export const NOTHING_GROUPS = [
  {
    title: 'Усталость',
    options: [
      { code: 'Сл-18', label: 'Усталость', kind: 'E-' },
      { code: 'Сл-60', label: 'Как выжатый лимон', kind: 'E-', nothingOnly: true },
      { code: 'Сл-61', label: 'Вялость, хочется спать', kind: 'E-', nothingOnly: true },
    ],
  },
  {
    title: 'Пустота',
    options: [
      { code: 'Сл-25', label: 'Опустошённость', kind: 'E-' },
      { code: 'Сл-62', label: 'Всё равно', kind: 'E-', nothingOnly: true },
      { code: 'Сл-63', label: 'Скучно', kind: 'E-', nothingOnly: true },
      { code: 'Сл-64', label: 'На автопилоте', kind: 'E-', nothingOnly: true },
    ],
  },
  {
    title: 'Мысли не здесь',
    options: [
      { code: 'Сл-65', label: 'Голова была занята другим', kind: 'E-', nothingOnly: true },
      { code: 'Сл-66', label: 'Как будто не со мной', kind: 'E-', nothingOnly: true },
    ],
  },
  {
    title: 'Тихое спокойствие',
    options: [
      { code: 'Сл-67', label: 'Спокойно, ровно', kind: 'E+', nothingOnly: true },
      { code: 'Сл-68', label: 'Нормально, без всплесков', kind: 'E+', nothingOnly: true },
    ],
  },
];

const NOTHING_OPTIONS = NOTHING_GROUPS.flatMap((g) => g.options).filter((o) => o.nothingOnly);

// All codes, so charts and the training screen understand entries made on either screen.
export const OPTION_BY_CODE = Object.fromEntries(
  [...OPTIONS, ...NOTHING_OPTIONS].map((o) => [o.code, o]),
);

// Options for the usual lists of steps 2 and 3.
export const optionsOfKind = (kind) => OPTIONS.filter((o) => o.kind === kind);
