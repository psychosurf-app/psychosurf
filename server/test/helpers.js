// A real PostgreSQL in memory (PGlite) for tests: no installation needed.
import { PGlite } from '@electric-sql/pglite';
import { migrate } from '../src/migrate.js';

// With TEST_DATABASE_URL set, the same tests run on a real PostgreSQL:
// each test gets its own empty schema, dropped at the end.
async function realDb(url) {
  const { createDb } = await import('../src/db.js');
  const schema = `t_${Math.random().toString(36).slice(2, 10)}`;
  const admin = createDb(url);
  await admin.query(`CREATE SCHEMA ${schema}`);
  const u = new URL(url);
  u.searchParams.set('options', `-c search_path=${schema}`);
  const db = createDb(u.toString());
  await migrate(db, () => {});
  return {
    ...db,
    close: async () => {
      await db.close();
      await admin.query(`DROP SCHEMA ${schema} CASCADE`);
      await admin.close();
    },
  };
}

export async function testDb() {
  if (process.env.TEST_DATABASE_URL) return realDb(process.env.TEST_DATABASE_URL);
  const pg = new PGlite();
  const db = {
    query: (text, params) => pg.query(text, params),
    exec: (sql) => pg.exec(sql),
    close: () => pg.close(),
  };
  await migrate(db, () => {});
  return db;
}

// Starts the app on a free port and returns its address.
export async function serve(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ url: `http://127.0.0.1:${port}`, close: () => server.close() });
    });
  });
}
