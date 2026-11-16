// Applies migrations/*.sql in name order, each once. A file and its mark in
// schema_migrations are sent as one multi-statement query, which PostgreSQL
// runs as one transaction: a broken migration leaves no half-made tables.
// Run: npm run migrate (uses DATABASE_URL). The server also runs it at start.

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

export async function migrate(db, log = console.log) {
  await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const done = new Set((await db.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
  const files = (await readdir(DIR)).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    if (done.has(file)) continue;
    const sql = await readFile(path.join(DIR, file), 'utf8');
    if (!/^[\w.-]+$/.test(file)) throw new Error(`bad migration file name: ${file}`);
    try {
      await db.exec(`${sql}\n;INSERT INTO schema_migrations (name) VALUES ('${file}');`);
      log(`migration applied: ${file}`);
    } catch (error) {
      throw new Error(`migration ${file} failed: ${error.message}`);
    }
  }
}

// `npm run migrate`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { createDb } = await import('./db.js');
  const db = createDb();
  try {
    await migrate(db);
  } finally {
    await db.close();
  }
}
