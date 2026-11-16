// End to end: the app's real storage code against the real server code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { signInitData } from '../src/telegramAuth.js';
import { testDb, serve } from './helpers.js';
import { createServerAdapter } from '../../web/src/storage/serverAdapter.js';
import { createKeyValueAdapter } from '../../web/src/storage/keyValueAdapter.js';
import { loadWithMove, MOVED_KEY } from '../../web/src/storage/moveToServer.js';

const TOKEN = '123456:TEST-token-not-real';
const NOW = Date.now();
const initData = (id) =>
  signInitData({ auth_date: String(Math.floor(NOW / 1000)), user: JSON.stringify({ id }) }, TOKEN);

// Telegram CloudStorage stand-in: same four functions.
function fakeCloud() {
  const items = new Map();
  return {
    items,
    getKeys: async () => [...items.keys()],
    getItems: async (keys) => Object.fromEntries(keys.map((k) => [k, items.get(k) ?? ''])),
    setItem: async (k, v) => void items.set(k, v),
    removeItem: async (k) => void items.delete(k),
  };
}

const entry = (id, diaryKey, day) => ({
  id,
  diaryKey,
  trainingDate: `2026-11-${day}`,
  createdAt: Date.UTC(2026, 10, Number(day), 18),
  tone: 'good',
  emotions: ['Сл-1'],
  emotionNote: '',
  motivation: 'forward',
  motivationOptions: ['Сл-43'],
  motivationNote: '',
  version: 1,
});

async function withSetup(fn) {
  const t = await setup();
  try {
    await fn(t);
  } finally {
    t.srv.close();
    await t.db.close();
  }
}

async function setup() {
  const db = await testDb();
  const srv = await serve(createApp({ db, botToken: TOKEN }));
  const store = fakeCloud();
  const cloud = createKeyValueAdapter(store);
  // a tester's diary from the Telegram test build, incl. a training of an unticked sport
  await cloud.saveProfile({ displayName: 'Яна', dailyStart: '2026-11-10', version: 1 });
  await cloud.saveDiaries([{ key: 'surf', code: 'surf', name: 'Сёрфинг', color: '#076a65', version: 1 }]);
  await cloud.saveEntry(entry('11111111-1111-4111-8111-111111111111', 'surf', '14'));
  await cloud.saveEntry(entry('22222222-2222-4222-8222-222222222222', 'custom:Йога', '15'));
  const server = createServerAdapter({ apiUrl: srv.url, initData: initData(77) });
  return { db, srv, store, cloud, server };
}

test('first start with the server moves the whole diary, once', () =>
  withSetup(async (t) => {
  const data = await loadWithMove({ server: t.server, cloud: t.cloud, store: t.store });
  assert.equal(data.profile.displayName, 'Яна');
  assert.equal(data.profile.dailyStart, '2026-11-10');
  assert.deepEqual(data.diaries.map((d) => d.key), ['surf']); // Йога stays hidden, as before
  assert.equal(data.entries.length, 2); // ...but its training is kept
  assert.ok(t.store.items.get(MOVED_KEY));
  assert.equal((await t.cloud.load()).entries.length, 2); // nothing deleted from CloudStorage

  // second start: nothing is copied again
  await t.store.setItem('e_33333333-3333-4333-8333-333333333333', JSON.stringify(entry('33333333-3333-4333-8333-333333333333', 'surf', '16')));
  const again = await loadWithMove({ server: t.server, cloud: t.cloud, store: t.store });
  assert.equal(again.entries.length, 2);
  }));

test('if the move breaks halfway, the next start finishes it without copies', () =>
  withSetup(async (t) => {
  let calls = 0;
  const flaky = { ...t.server, saveEntry: async (e) => { if (++calls === 2) throw new Error('network'); return t.server.saveEntry(e); } };
  await assert.rejects(loadWithMove({ server: flaky, cloud: t.cloud, store: t.store }));
  assert.equal(t.store.items.get(MOVED_KEY), undefined);
  // the server now has a diary, so a plain retry would skip the move: the mark decides, not emptiness
  const data = await loadWithMove({ server: t.server, cloud: t.cloud, store: t.store });
  assert.equal(data.entries.length, 2);
  }));

test('normal saving through the server adapter', () =>
  withSetup(async (t) => {
  await loadWithMove({ server: t.server, cloud: t.cloud, store: t.store });
  await t.server.deleteEntry('11111111-1111-4111-8111-111111111111');
  assert.equal((await t.server.load()).entries.length, 1);
  }));

test('CORS: only our app address may call from a browser', async () => {
  const db = await testDb();
  const srv = await serve(createApp({ db, botToken: TOKEN, allowedOrigins: ['https://psychosurf-app.github.io'] }));
  const ask = (origin) => fetch(`${srv.url}/api/data`, { method: 'OPTIONS', headers: { origin } });
  const ours = await ask('https://psychosurf-app.github.io');
  assert.equal(ours.status, 204);
  assert.equal(ours.headers.get('access-control-allow-origin'), 'https://psychosurf-app.github.io');
  assert.equal((await ask('https://evil.example')).status, 403);
  srv.close();
  await db.close();
});
