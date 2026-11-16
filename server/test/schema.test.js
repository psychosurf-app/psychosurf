import { test } from 'node:test';
import assert from 'node:assert/strict';
import { testDb } from './helpers.js';

async function userWithTraining(db) {
  const { rows: [u] } = await db.query('INSERT INTO users DEFAULT VALUES RETURNING id');
  await db.query(
    "INSERT INTO auth_identities (provider, provider_user_id, user_id) VALUES ('telegram', '12345', $1)",
    [u.id],
  );
  const { rows: [d] } = await db.query(
    "INSERT INTO diaries (user_id, key, sport_code, name, color) VALUES ($1, 'surf', 'surf', 'Сёрфинг', '#076a65') RETURNING id",
    [u.id],
  );
  await db.query(
    `INSERT INTO entries (id, user_id, diary_id, training_date, created_at, tone, emotions, motivation, motivation_options)
     VALUES (gen_random_uuid(), $1, $2, '2026-11-16', now(), 'good', '{Сл-1,Сл-3}', 'forward', '{Сл-43}')`,
    [u.id, d.id],
  );
  return u.id;
}

test('one Telegram account = one user', async () => {
  const db = await testDb();
  await userWithTraining(db);
  const { rows: [other] } = await db.query('INSERT INTO users DEFAULT VALUES RETURNING id');
  await assert.rejects(
    db.query(
      "INSERT INTO auth_identities (provider, provider_user_id, user_id) VALUES ('telegram', '12345', $1)",
      [other.id],
    ),
  );
  await db.close();
});

test('deleting a user deletes everything of theirs (R-35)', async () => {
  const db = await testDb();
  const id = await userWithTraining(db);
  await db.query('DELETE FROM users WHERE id = $1', [id]);
  for (const table of ['auth_identities', 'diaries', 'entries']) {
    const { rows } = await db.query(`SELECT count(*)::int AS n FROM ${table}`);
    assert.equal(rows[0].n, 0, table);
  }
  await db.close();
});

test('tone must be one of the three', async () => {
  const db = await testDb();
  await userWithTraining(db);
  await assert.rejects(db.query("UPDATE entries SET tone = 'meh'"));
  await db.close();
});
