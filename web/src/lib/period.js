import { todayIso } from './format.js';

// Periods shared by the diary (G-16, G-4) and the comparison (G-18): week, month or custom (V-15).
// A period is { type: 'week' | 'month' } or { type: 'custom', from, to } with 'YYYY-MM-DD' dates.

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const pad = (x) => String(x).padStart(2, '0');

export const shortDate = (iso) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
};

export function shiftIso(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Whole days between two dates.
export const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

// First and last day of a period, title ("Октябрь") and phrase ("за месяц").
export function describePeriod(period) {
  const today = todayIso();
  if (period.type === 'week') {
    return { from: shiftIso(today, -6), to: today, title: 'Неделя', phrase: 'за неделю' };
  }
  if (period.type === 'custom') {
    return {
      from: period.from,
      to: period.to,
      title: `${shortDate(period.from)} — ${shortDate(period.to)}`,
      phrase: `с ${shortDate(period.from)} по ${shortDate(period.to)}`,
    };
  }
  const [y, m] = today.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return {
    from: `${y}-${pad(m)}-01`,
    to: `${y}-${pad(m)}-${pad(lastDay)}`,
    title: MONTHS[m - 1],
    phrase: 'за месяц',
  };
}

export const inRange = (entries, { from, to }) =>
  entries.filter((e) => e.trainingDate >= from && e.trainingDate <= to);
