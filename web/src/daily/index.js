// "Приём дня": a card on the main screen, a new one every day (I-52, I-53, R-40).
//
// Texts and the order of the 365 cards are Yana's paid content, so they are
// NOT in this public repo (R-34). They come with pool.json in the test build
// with advice (R-39). In the public build the card is always locked.
//
// Rules (R-40):
// - A new day starts at midnight on the person's phone, whatever they did.
// - Day 1 = the day the person first opened the app, card 1 of the order.
//   A missed day is skipped, like a calendar. After the last card: again.
// - Nothing is generated: only Yana's approved texts (R-8).

import { useEffect, useState } from 'react';
import { POOL, ADVICE_ENABLED } from '../advice/index.js';
import { SERVER_MODE, apiGet } from '../api.js';
import { currentAccess } from '../access/index.js';
import { cardIndex } from './days.js';

export { cardIndex, daysBetween } from './days.js';

// Test build with advice: the card is open for everyone (testers, R-39).
// Release 2: open with a subscription or in the trial period (R-40).
export const DAILY_OPEN = ADVICE_ENABLED && Boolean(POOL?.daily?.order?.length);

// Today's card for this person, or { locked: true }.
// `opened`: the person already opened today's card (no white dot).
// `access` from access/index.js: after the trial without a subscription it is locked (V-47).
export function dailyCard(profile, todayIso, access = { full: true }) {
  if (!DAILY_OPEN || !access.full) return { locked: true };
  const { order, cards } = POOL.daily;
  const i = cardIndex(profile.dailyStart ?? todayIso, todayIso, order.length);
  const id = order[i];
  return { locked: false, id, card: cards[id], opened: profile.dailyOpened === todayIso };
}

// Today's card for the main screen, in both kinds of builds.
// Server (release 2): asked from the server, which decides about the lock.
// null while loading or if the server can't be reached: then no card is shown,
// rather than a wrong "locked" card for someone who pays.
// The white dot follows profile.dailyOpened, which the app saves itself.
export function useDaily(profile, entries, today) {
  const [fromServer, setFromServer] = useState(null);
  useEffect(() => {
    if (!SERVER_MODE) return undefined;
    let cancelled = false;
    apiGet(`/api/daily?today=${today}`)
      .then((d) => !cancelled && setFromServer({ ...d, today }))
      .catch((error) => console.error('Daily card failed', error));
    return () => {
      cancelled = true;
    };
  }, [today, profile.dailyStart]);

  if (!SERVER_MODE) return dailyCard(profile, today, currentAccess(profile, entries, today));
  if (!fromServer || fromServer.today !== today) return null;
  if (fromServer.locked) return { locked: true };
  return { locked: false, id: fromServer.id, card: fromServer.card, opened: profile.dailyOpened === today };
}
