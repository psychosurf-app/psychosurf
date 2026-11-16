// Starts the server: database -> migrations -> HTTP.
// Settings come from the environment (.env on the server, never in git):
//   DATABASE_URL  postgres://user:password@host:5432/psychosurf
//   BOT_TOKEN     token of @psychosurf_bot (from BotFather, only in .env)
//   ALLOWED_ORIGINS  app addresses, comma-separated, e.g. https://psychosurf-app.github.io
//   POOL_PATH     path to pool.json from the private repo psychosurf-advice
//   TESTERS_FREE  1 = closed test, advice and cards open for everyone (R-23)
//   PORT          default 3000

import { createDb } from './db.js';
import { migrate } from './migrate.js';
import { createApp } from './app.js';
import { loadPool } from './pool.js';

const botToken = process.env.BOT_TOKEN;
if (!botToken) throw new Error('BOT_TOKEN is not set');

const db = createDb();
await migrate(db);

const port = Number(process.env.PORT ?? 3000);
createApp({
  db,
  botToken,
  pool: await loadPool(process.env.POOL_PATH),
  testersFree: process.env.TESTERS_FREE === '1',
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
}).listen(port, () => console.log(`Психосерф server on port ${port}`));
