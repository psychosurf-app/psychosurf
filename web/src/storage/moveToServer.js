// Moving testers' diaries from Telegram CloudStorage to the server (release 2, step 3).
//
// On the first start with the server, if CloudStorage has a diary and no
// "moved" mark yet, everything is copied over. The mark alone decides, not
// whether the server is empty: if a move breaks halfway, the server already has
// part of the diary, and the next start must still finish the move.
// Nothing is deleted from CloudStorage: if anything goes wrong, the old diary
// is still there and the next start simply tries again (all saves are
// "create or replace", so trying twice never makes copies).
// When the copy is done, a mark is left in CloudStorage so it never runs again.

import { SPORTS } from '../data/sports.js';

export const MOVED_KEY = 'moved_to_server';
const HIDDEN_COLOR = '#9a9da1';

const isEmpty = (data) => data.diaries.length === 0 && data.entries.length === 0;

// A training can belong to a sport the person unticked: that diary is not in
// the list any more. The server needs the diary to exist, so it is created
// and then hidden again, the same as it was.
function hiddenDiaries(diaries, entries) {
  const known = new Set(diaries.map((d) => d.key));
  const missing = [...new Set(entries.map((e) => e.diaryKey))].filter((k) => !known.has(k));
  return missing.map((key) => {
    const custom = key.startsWith('custom:');
    const sport = SPORTS.find((s) => s.code === key);
    return {
      key,
      code: custom ? null : key,
      name: custom ? key.slice('custom:'.length) || 'Свой спорт' : (sport?.name ?? key),
      color: HIDDEN_COLOR,
    };
  });
}

/**
 * @param server  server adapter
 * @param cloud   key-value adapter over Telegram CloudStorage
 * @param store   raw CloudStorage (getItems/setItem) for the "moved" mark
 * @returns data loaded from the server after the move (or as it was)
 */
export async function loadWithMove({ server, cloud, store }) {
  if (!cloud || !store) return server.load();

  const mark = await store.getItems([MOVED_KEY]);
  if (mark[MOVED_KEY]) return server.load();

  const old = await cloud.load();
  if (isEmpty(old)) {
    await store.setItem(MOVED_KEY, new Date().toISOString());
    return server.load();
  }

  if (old.profile && Object.keys(old.profile).length) await server.saveProfile(old.profile);
  const hidden = hiddenDiaries(old.diaries, old.entries);
  if (hidden.length) await server.saveDiaries([...old.diaries, ...hidden]);
  await server.saveDiaries(old.diaries);
  for (const entry of old.entries) await server.saveEntry(entry);

  await store.setItem(MOVED_KEY, new Date().toISOString());
  return server.load();
}
