import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { migrate } from '../src/migrate.js';
import { signInitData } from '../src/telegramAuth.js';
import { testDb, serve } from './helpers.js';

const TOKEN = '123456:TEST-token-not-real';
const NOW = Date.UTC(2026, 10, 16, 12);

const login = (telegramId) =>
  `tma ${signInitData(
    { auth_date: String(Math.floor(NOW / 1000)), user: JSON.stringify({ id: telegramId }) },
    TOKEN,
  )}`;

async function start() {
  const db = await testDb();
  const srv = await serve(createApp({ db, botToken: TOKEN, now: () => NOW }));
  return {
    db,
    get: (path, auth) => fetch(`${srv.url}${path}`, { headers: auth ? { authorization: auth } : {} }),
    stop: async () => {
      srv.close();
      await db.close();
    },
  };
}

test('health: server and database are alive, no login needed', async () => {
  const s = await start();
  const res = await s.get('/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, db: true });
  await s.stop();
});

test('without Telegram login every other path is 401', async () => {
  const s = await start();
  assert.equal((await s.get('/api/me')).status, 401);
  assert.equal((await s.get('/api/me', 'tma user=1&hash=00')).status, 401);
  assert.equal((await s.get('/api/me', 'Bearer x')).status, 401);
  await s.stop();
});

test('first visit creates the person, the next one finds them', async () => {
  const s = await start();
  const first = await (await s.get('/api/me', login(111))).json();
  assert.equal(first.isNew, true);
  assert.deepEqual(first.profile, { displayName: '', dailyStart: null, dailyOpened: null, settings: {} });
  const again = await (await s.get('/api/me', login(111))).json();
  assert.equal(again.isNew, false);
  await s.get('/api/me', login(222));
  const { rows } = await s.db.query('SELECT count(*)::int AS n FROM users');
  assert.equal(rows[0].n, 2);
  await s.stop();
});

test('no Telegram data is stored except the id', async () => {
  const s = await start();
  await s.get('/api/me', login(333));
  const { rows } = await s.db.query('SELECT provider_user_id FROM auth_identities');
  assert.deepEqual(rows, [{ provider_user_id: '333' }]);
  await s.stop();
});

test('unknown api path for a logged-in person gives 404', async () => {
  const s = await start();
  const res = await s.get('/api/nope', login(111));
  assert.equal(res.status, 404);
  await s.stop();
});

test('migrations run once', async () => {
  const db = await testDb();
  const logs = [];
  await migrate(db, (m) => logs.push(m));
  assert.deepEqual(logs, []);
  await db.close();
});
