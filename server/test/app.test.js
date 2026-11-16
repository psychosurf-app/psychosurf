import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { migrate } from '../src/migrate.js';
import { testDb, serve } from './helpers.js';

test('health: server and database are alive', async () => {
  const db = await testDb();
  const srv = await serve(createApp({ db }));
  const res = await fetch(`${srv.url}/api/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, db: true });
  srv.close();
  await db.close();
});

test('unknown api path gives 404 json', async () => {
  const db = await testDb();
  const srv = await serve(createApp({ db }));
  const res = await fetch(`${srv.url}/api/nope`);
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'not_found' });
  srv.close();
  await db.close();
});

test('migrations run once', async () => {
  const db = await testDb();
  const logs = [];
  await migrate(db, (m) => logs.push(m));
  assert.deepEqual(logs, []); // already applied by testDb()
  await db.close();
});
