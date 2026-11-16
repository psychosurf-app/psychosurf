import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createApp } from '../src/app.js';
import { signInitData } from '../src/telegramAuth.js';
import { accessState } from '../src/access.js';
import { accessState as webAccessState } from '../../web/src/access/trial.js';
import { testDb, serve } from './helpers.js';

const TOKEN = '123456:TEST-token-not-real';
const NOW = Date.UTC(2026, 10, 16, 12);
const TODAY = '2026-11-16';
const login = (id) =>
  `tma ${signInitData({ auth_date: String(Math.floor(NOW / 1000)), user: JSON.stringify({ id }) }, TOKEN)}`;

const SECRET_PART2 = 'Часть 2: секретный текст';
const POOL = {
  pieces: {
    'С-22': {
      part1: [{ t: 'p', text: 'Часть 1' }],
      part2: [{ t: 'p', text: SECRET_PART2 }],
      part3: [{ t: 'p', text: 'Часть 3' }],
      flag: 'Оранжевый блок',
      articles: ['burnout'],
    },
  },
  endings: { 'С-4': { water: { heading: 'Как вернуться на доску', line: 'Финальная фраза' } } },
  daily: {
    order: ['П-1', 'П-2', 'П-3'],
    cards: {
      'П-1': { kind: 'tip', title: 'Правило 91-й секунды', text: '…' },
      'П-2': { kind: 'tip', title: 'Дыхание квадратом', text: '…' },
      'П-3': { kind: 'quote', title: 'Роджер Федерер', text: '…', author: 'Роджер Федерер', role: 'теннисист' },
    },
  },
};

async function start(opts = {}) {
  const db = await testDb();
  const srv = await serve(createApp({ db, botToken: TOKEN, pool: POOL, now: () => NOW, ...opts }));
  const as = (who) => async (method, path, body) => {
    const res = await fetch(`${srv.url}${path}`, {
      method,
      headers: { authorization: login(who), 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, text: await res.text() };
  };
  return { db, as, stop: async () => { srv.close(); await db.close(); } };
}

// A person who started on `firstDay` and recorded `n` trainings.
async function person(me, firstDay, n) {
  await me('PUT', '/api/profile', { dailyStart: firstDay });
  await me('PUT', '/api/diaries', [{ key: 'surf', code: 'surf', name: 'Сёрфинг', color: '#076a65' }]);
  for (let i = 0; i < n; i++) {
    await me('PUT', `/api/entries/${randomUUID()}`, {
      diaryKey: 'surf', trainingDate: '2026-11-01', createdAt: Date.UTC(2026, 10, 1) + i,
      tone: 'hard', emotions: ['Сл-24'], motivation: 'not_forward', motivationOptions: ['Сл-56'],
    });
  }
}

const ADVICE = `/api/advice?ids=С-22&ending=С-4&today=${TODAY}`;

test('in the trial: the whole advice', async () => {
  const s = await start();
  const me = s.as(1);
  await person(me, '2026-11-10', 2);
  const r = JSON.parse((await me('GET', ADVICE)).text);
  assert.equal(r.locked, false);
  assert.equal(r.pieces['С-22'].part2[0].text, SECRET_PART2);
  assert.equal(r.endings['С-4'].water.line, 'Финальная фраза');
  await s.stop();
});

test('after the trial: only part 1 and the orange block leave the server', async () => {
  const s = await start();
  const me = s.as(1);
  await person(me, '2026-10-20', 5); // 27 days, 5 trainings -> trial is over
  const { text } = await me('GET', ADVICE);
  const r = JSON.parse(text);
  assert.equal(r.locked, true);
  assert.deepEqual(r.pieces['С-22'], { part1: [{ t: 'p', text: 'Часть 1' }], flag: 'Оранжевый блок' });
  assert.deepEqual(r.endings['С-4'].water, { heading: 'Как вернуться на доску' });
  assert.ok(!text.includes(SECRET_PART2) && !text.includes('Финальная фраза') && !text.includes('Часть 3'));
  await s.stop();
});

test('closed test: everything open for everyone (R-23)', async () => {
  const s = await start({ testersFree: true });
  const me = s.as(1);
  await person(me, '2026-10-01', 9);
  assert.equal(JSON.parse((await me('GET', ADVICE)).text).locked, false);
  await s.stop();
});

test('"Приём дня": card by day, locked after the trial', async () => {
  const s = await start();
  const fresh = s.as(1);
  await person(fresh, '2026-11-15', 0); // day 2
  const r = JSON.parse((await fresh('GET', `/api/daily?today=${TODAY}`)).text);
  assert.equal(r.id, 'П-2');
  assert.equal(r.opened, false);
  const old = s.as(2);
  await person(old, '2026-10-01', 4);
  assert.deepEqual(JSON.parse((await old('GET', `/api/daily?today=${TODAY}`)).text), { locked: true });
  await s.stop();
});

test('bad requests: far dates, bad ids, no pool', async () => {
  const s = await start();
  const me = s.as(1);
  assert.equal((await me('GET', '/api/daily?today=2027-01-01')).status, 400); // no peeking ahead
  assert.equal((await me('GET', `/api/advice?ids=П-1&today=${TODAY}`)).status, 400);
  assert.equal((await me('GET', `/api/advice?ids=С-1,С-2,С-3,С-4,С-5,С-6,С-7&today=${TODAY}`)).status, 400);
  await s.stop();
  const none = await start({ pool: null });
  assert.equal((await none.as(1)('GET', `/api/daily?today=${TODAY}`)).status, 503);
  await none.stop();
});

test('server and app give the same trial answers', () => {
  for (const firstDay of ['2026-10-01', '2026-10-17', '2026-11-01', '2026-11-03', '2026-11-16', null]) {
    for (const trainings of [0, 3, 4, 10]) {
      const args = { firstDay, today: TODAY, trainings };
      assert.deepEqual(accessState(args), webAccessState(args), JSON.stringify(args));
    }
  }
});
