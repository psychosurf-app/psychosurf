// The only place that talks to PostgreSQL. Everything else calls db.query().
// Connection comes from DATABASE_URL (never written in the code, R-34).

import pg from 'pg';

export function createDb(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const pool = new pg.Pool({ connectionString, max: 10 });
  return {
    query: (text, params) => pool.query(text, params),
    // Several statements at once, no parameters (migrations).
    exec: (sql) => pool.query(sql),
    close: () => pool.end(),
  };
}
