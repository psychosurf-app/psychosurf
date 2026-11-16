import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createApp } from '../src/app.js';
import { signInitData } from '../src/telegramAuth.js';
import { testDb, serve } from './helpers.js';

const TOKEN = '123456:TEST-token-not-real';
const NOW = Date.UTC(2026, 10, 16, 12);
const login = (id) =>
  `tma ${signInitData({ auth_date: String(Math.floor(NOW / 1000)), user: JSON.stringify({ id }) }, TOKEN)}`;

async function start() {
  const db = await testDb();
  const srv = await serve(createApp({ db, botToken: TOKEN, now: () => NOW }));
  const call = (who) => async (method, path, body) => {
    const res = await fetch(`${srv.url}${path}`, {
      method,
      headers: { authorization: login(who), 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, body: await res.json() };
  };
  return { db, as: call, stop: async () => { srv.close(); await db.close(); } };
}

const SURF = { key: 'surf', code: 'surf', name: 'Сёрфинг', color: '#076a65', version: 1 };
const PADEL = { key: 'padel', code: 'padel', name: 'Падел', color: '#e0602b', version: 1 };
const entry = (over = {}) => ({
  id: randomUUID(),
  diaryKey: 'surf',
  trainingDate: '2026-11-15',
  createdAt: Date.UTC(2026, 10, 15, 18),
  tone: 'good',
  emotions: ['Сл-1', 'Сл-3'],
  emotionNote: 'летала',
  motivation: 'forward',
  motivationOptions: ['Сл-43'],
  motivationNote: '',
  version: 1,
  ...over,
});

test('a new person has an empty diary', async () => {
  const s = await start();
  const r = await s.as(1)('GET', '/api/data');
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.diaries, []);
  assert.deepEqual(r.body.entries, []);
  await s.stop();
});

test('save and load: same shapes as the app', async () => {
  const s = await start();
  const me = s.as(1);
  await me('PUT', '/api/profile', { displayName: 'Лиза', dailyStart: '2026-11-16', dailyOpened: null, settings: {} });
  await me('PUT', '/api/diaries', [SURF, PADEL]);
  const e = entry({ advicePick: { version: 1, slots: ['emo:lift'] } });
  assert.equal((await me('PUT', `/api/entries/${e.id}`, e)).status, 200);
  const { body } = await me('GET', '/api/data');
  assert.deepEqual(body.profile, { displayName: 'Лиза', dailyStart: '2026-11-16', dailyOpened: null, settings: {} });
  assert.deepEqual(body.diaries, [
    { key: 'surf', code: 'surf', name: 'Сёрфинг', color: '#076a65' },
    { key: 'padel', code: 'padel', name: 'Падел', color: '#e0602b' },
  ]);
  assert.deepEqual(body.entries, [{ ...e }]);
  await s.stop();
});

test('editing a training replaces it, deleting removes it', async () => {
  const s = await start();
  const me = s.as(1);
  await me('PUT', '/api/diaries', [SURF]);
  const e = entry();
  await me('PUT', `/api/entries/${e.id}`, e);
  await me('PUT', `/api/entries/${e.id}`, { ...e, tone: 'hard', emotions: ['Сл-18'] });
  let { body } = await me('GET', '/api/data');
  assert.equal(body.entries.length, 1);
  assert.equal(body.entries[0].tone, 'hard');
  await me('DELETE', `/api/entries/${e.id}`);
  ({ body } = await me('GET', '/api/data'));
  assert.equal(body.entries.length, 0);
  await s.stop();
});

test('an unticked sport is hidden, its trainings are kept and come back', async () => {
  const s = await start();
  const me = s.as(1);
  await me('PUT', '/api/diaries', [SURF, PADEL]);
  const e = entry({ diaryKey: 'padel' });
  await me('PUT', `/api/entries/${e.id}`, e);
  await me('PUT', '/api/diaries', [SURF]);
  let { body } = await me('GET', '/api/data');
  assert.deepEqual(body.diaries.map((d) => d.key), ['surf']);
  assert.equal(body.entries.length, 1);
  await me('PUT', '/api/diaries', [SURF, PADEL]);
  ({ body } = await me('GET', '/api/data'));
  assert.deepEqual(body.diaries.map((d) => d.key), ['surf', 'padel']);
  await s.stop();
});

test('nobody can see or change someone else\'s diary', async () => {
  const s = await start();
  const liza = s.as(1);
  const stranger = s.as(2);
  await liza('PUT', '/api/diaries', [SURF]);
  const e = entry();
  await liza('PUT', `/api/entries/${e.id}`, e);
  await stranger('PUT', '/api/diaries', [SURF]);
  // same id from another person: refused, Liza's training untouched
  const hijack = await stranger('PUT', `/api/entries/${e.id}`, { ...e, tone: 'numb' });
  assert.equal(hijack.status, 409);
  await stranger('DELETE', `/api/entries/${e.id}`);
  assert.deepEqual((await stranger('GET', '/api/data')).body.entries, []);
  const mine = (await liza('GET', '/api/data')).body.entries;
  assert.equal(mine.length, 1);
  assert.equal(mine[0].tone, 'good');
  await s.stop();
});

test('bad input gets 400, not a server error', async () => {
  const s = await start();
  const me = s.as(1);
  await me('PUT', '/api/diaries', [SURF]);
  const e = entry();
  for (const bad of [
    { ...e, tone: 'meh' },
    { ...e, trainingDate: '16.11.2026' },
    { ...e, emotions: ['DROP TABLE'] },
    { ...e, emotionNote: 'x'.repeat(1001) },
  ]) {
    assert.equal((await me('PUT', `/api/entries/${e.id}`, bad)).status, 400);
  }
  assert.equal((await me('PUT', '/api/entries/not-a-uuid', e)).status, 400);
  assert.equal((await me('DELETE', '/api/entries/not-a-uuid')).status, 400);
  assert.equal((await me('PUT', '/api/diaries', [{ ...SURF, color: 'red' }])).status, 400);
  assert.equal((await me('PUT', '/api/profile', { dailyStart: 'tomorrow' })).status, 400);
  // a training for a sport the person doesn't have
  assert.equal((await me('PUT', `/api/entries/${e.id}`, { ...e, diaryKey: 'golf' })).status, 409);
  await s.stop();
});
