// The HTTP part of the server. createApp() gets its database from outside,
// so tests can give it an in-memory one and production a real PostgreSQL.

import express from 'express';

export function createApp({ db }) {
  const app = express();
  app.disable('x-powered-by');
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

  app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));

  // Never show error details to the user; they go to the server log.
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'server_error' });
  });

  return app;
}
