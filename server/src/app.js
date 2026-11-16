// The HTTP part of the server. createApp() gets its database from outside,
// so tests can give it an in-memory one and production a real PostgreSQL.

import express from 'express';
import { requireTelegramUser } from './auth.js';
import { getProfile } from './users.js';
import * as data from './data.js';
import { BadRequest, profileInput, diariesInput, entryInput, entryId, todayInput, adviceIdsInput } from './validate.js';
import { accessFor, daysBetween } from './access.js';
import { advicePieces, dailyCard } from './pool.js';

// botToken: token of @psychosurf_bot, from .env (never in the code).
// allowedOrigins: addresses of the app allowed to call the server from a
//   browser (CORS), e.g. https://psychosurf-app.github.io
// pool: Yana's texts (pool.js), null if not loaded yet.
// testersFree: closed test, everything open for everyone (R-23).
// now: clock, replaced in tests.
export function createApp({ db, botToken, allowedOrigins = [], pool = null, testersFree = false, now }) {
  const app = express();
  app.disable('x-powered-by');

  // The app lives at another address than the server, so the browser asks
  // first whether it may call. Only our own app addresses get a yes.
  app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
      res.set({
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE',
        'Access-Control-Allow-Headers': 'authorization, content-type',
        'Access-Control-Max-Age': '600',
        Vary: 'Origin',
      });
    }
    if (req.method === 'OPTIONS') return res.sendStatus(origin && allowedOrigins.includes(origin) ? 204 : 403);
    next();
  });
  app.use(express.json({ limit: '100kb' }));

  // Is the server alive and can it reach the database? Used by the hosting
  // and by us after every deploy.
  app.get('/api/health', async (req, res) => {
    try {
      await db.query('SELECT 1');
      res.json({ ok: true, db: true });
    } catch {
      res.status(503).json({ ok: false, db: false });
    }
  });

  // Everything below needs a person logged in through Telegram.
  app.use('/api', requireTelegramUser({ db, botToken, now }));

  // Who am I: our user id is never sent, only what the screens need.
  app.get('/api/me', async (req, res) => {
    res.json({ isNew: req.isNewUser, profile: await getProfile(db, req.userId) });
  });

  // Diary data, same shapes as the app's storage adapter (R-33).
  app.get('/api/data', async (req, res) => {
    res.json(await data.loadAll(db, req.userId));
  });

  app.put('/api/profile', async (req, res) => {
    await data.saveProfile(db, req.userId, profileInput(req.body));
    res.json({ ok: true });
  });

  app.put('/api/diaries', async (req, res) => {
    await data.saveDiaries(db, req.userId, diariesInput(req.body));
    res.json({ ok: true });
  });

  app.put('/api/entries/:id', async (req, res) => {
    const ok = await data.saveEntry(db, req.userId, entryInput(req.params.id, req.body));
    if (!ok) return res.status(409).json({ error: 'unknown_diary_or_id' });
    res.json({ ok: true });
  });

  app.delete('/api/entries/:id', async (req, res) => {
    await data.deleteEntry(db, req.userId, entryId(req.params.id));
    res.json({ ok: true });
  });

  // Texts of one advice. The app picks the pieces itself (ids only, R-38) and
  // asks for them here; the server sends only what is open for this person.
  // today: the person's own date (their midnight decides, R-40).
  app.get('/api/advice', async (req, res) => {
    if (!pool) return res.status(503).json({ error: 'no_pool' });
    const today = todayInput(req.query.today, now?.() ?? Date.now());
    const ids = adviceIdsInput(req.query.ids);
    const ending = req.query.ending ? adviceIdsInput(req.query.ending)[0] : null;
    const access = await accessFor(db, req.userId, today, { testersFree });
    res.json(advicePieces(pool, ids, ending, access.full));
  });

  // Today's "Приём дня" card, or locked (R-40, V-47).
  app.get('/api/daily', async (req, res) => {
    if (!pool) return res.status(503).json({ error: 'no_pool' });
    const today = todayInput(req.query.today, now?.() ?? Date.now());
    const access = await accessFor(db, req.userId, today, { testersFree });
    if (!access.full) return res.json({ locked: true });
    const profile = await getProfile(db, req.userId);
    const { id, card } = dailyCard(pool, profile.dailyStart, today, daysBetween);
    res.json({ locked: false, id, card, opened: profile.dailyOpened === today });
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));

  // Never show error details to the user; they go to the server log.
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (error instanceof BadRequest) return res.status(400).json({ error: 'bad_request', why: error.message });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'bad_json' });
    console.error(error);
    res.status(500).json({ error: 'server_error' });
  });

  return app;
}
