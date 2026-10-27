// Russian text helpers.

// plural(5, ['тренировка', 'тренировки', 'тренировок']) -> 'тренировок'
export function plural(n, [one, few, many]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

// Non-breaking space keeps "21 тренировка" on one line.
export const countText = (n, forms) => `${n}\u00a0${plural(n, forms)}`;

// Today's date as 'YYYY-MM-DD' in the user's local time zone.
export function todayIso() {
  const d = new Date();
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 'сегодня', 'вчера', '3 дня назад' for a 'YYYY-MM-DD' date.
export function daysAgoText(isoDate) {
  const days = Math.round((Date.parse(todayIso()) - Date.parse(isoDate)) / 86400000);
  if (days <= 0) return 'сегодня';
  if (days === 1) return 'вчера';
  return `${countText(days, ['день', 'дня', 'дней'])} назад`;
}
