// A real PostgreSQL in memory (PGlite) for tests: no installation needed.
import { PGlite } from '@electric-sql/pglite';
import { migrate } from '../src/migrate.js';

export async function testDb() {
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
