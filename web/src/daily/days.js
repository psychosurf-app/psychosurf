// Pure day counting for "Приём дня" (R-40). No texts, no storage.

const DAY_MS = 86400000;

// Whole days between two local 'YYYY-MM-DD' dates (b - a).
export function daysBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);
}

// Pure: which card a person sees on `today`, given the day they started.
export function cardIndex(startIso, todayIso, total) {
  if (!total) return null;
  const n = Math.max(0, daysBetween(startIso, todayIso));
  return n % total;
}
