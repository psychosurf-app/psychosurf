// Yana's texts: advice pieces, part-3 endings and "Приём дня" cards.
//
// The texts live in the private repo psychosurf-advice (pool.json, built from
// the sheet "Пул советов"). They are copied to the server next to the code and
// read at start (POOL_PATH in .env). They are never in the public repo (R-34)
// and never sent whole: only the pieces a person may read right now.

import { readFile } from 'node:fs/promises';

export async function loadPool(path) {
  if (!path) return null;
  const pool = JSON.parse(await readFile(path, 'utf8'));
  if (!pool.pieces || !pool.endings || !pool.daily?.order) throw new Error(`${path}: not a pool.json`);
  return pool;
}

// The pieces of one advice. After the trial without a subscription only
// part 1 and the orange block are sent (R-37, I-45, I-46); parts 2-3,
// the final line and article buttons stay on the server.
export function advicePieces(pool, ids, endingId, open) {
  const pieces = {};
  for (const id of ids) {
    const p = pool.pieces[id];
    if (!p) continue;
    pieces[id] = open
      ? p
      : { ...(p.part1 ? { part1: p.part1 } : {}), ...(p.flag ? { flag: p.flag } : {}) };
  }
  const endings = {};
  const ending = endingId && pool.endings[endingId];
  if (ending) {
    endings[endingId] = Object.fromEntries(
      Object.entries(ending).map(([group, e]) => [group, open ? e : { heading: e.heading }]),
    );
  }
  return { locked: !open, pieces, endings };
}

// Today's "Приём дня" card (R-40): day 1 = first day in the app, one card a
// day, missed days skipped, after the last card the circle starts again.
export function dailyCard(pool, firstDay, today, daysBetween) {
  const { order, cards } = pool.daily;
  const n = Math.max(0, daysBetween(firstDay ?? today, today));
  const id = order[n % order.length];
  return { id, card: cards[id] };
}
