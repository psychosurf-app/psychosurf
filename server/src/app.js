// The HTTP part of the server. createApp() gets its database from outside,
// so tests can give it an in-memory one and production a real PostgreSQL.

import express from 'express';
import { requireTelegramUser } from './auth.js';
import { getProfile } from './users.js';
import * as data from './data.js';
import { BadRequest, profileInput, diariesInput, entryInput, entryId } from './validate.js';

// botToken: token of @psychosurf_bot, from .env (never in the code).
// allowedOrigins: addresses of the app allowed to call the server from a
//   browser (CORS), e.g. https://psychosurf-app.github.io
// now: clock, replaced in tests.
export function createApp({ db, botToken, allowedOrigins = [], now }) {
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
