// Users: find a person by their Telegram id, create them on the first visit (R-29).

export async function findOrCreateTelegramUser(db, telegramId) {
  const found = await db.query(
    "SELECT user_id FROM auth_identities WHERE provider = 'telegram' AND provider_user_id = $1",
    [telegramId],
  );
  if (found.rows[0]) return { id: found.rows[0].user_id, created: false };

  // New person: user + identity in one statement. If two first requests race,
  // the second insert of the identity does nothing and we read the winner.
  const created = await db.query(
    `WITH new_user AS (INSERT INTO users DEFAULT VALUES RETURNING id)
     INSERT INTO auth_identities (provider, provider_user_id, user_id)
     SELECT 'telegram', $1, id FROM new_user
     ON CONFLICT (provider, provider_user_id) DO NOTHING
     RETURNING user_id`,
    [telegramId],
  );
  if (created.rows[0]) return { id: created.rows[0].user_id, created: true };
  // Lost the race: our new user row got no identity. Remove such empty rows so
  // statistics count only real people (R-36). A real user always gets its
  // identity in the same statement, so this never touches anyone real.
  await db.query(
    'DELETE FROM users u WHERE NOT EXISTS (SELECT 1 FROM auth_identities a WHERE a.user_id = u.id)',
  );
  const again = await db.query(
    "SELECT user_id FROM auth_identities WHERE provider = 'telegram' AND provider_user_id = $1",
    [telegramId],
  );
  return { id: again.rows[0].user_id, created: false };
}

// What the app needs to know about the person (no Telegram data).
export async function getProfile(db, userId) {
  const { rows } = await db.query(
    `SELECT display_name, to_char(daily_start, 'YYYY-MM-DD') AS daily_start,
            to_char(daily_opened, 'YYYY-MM-DD') AS daily_opened, settings
     FROM users WHERE id = $1`,
    [userId],
  );
  const u = rows[0];
  return {
    displayName: u.display_name ?? '',
    dailyStart: u.daily_start,
    dailyOpened: u.daily_opened,
    settings: u.settings,
  };
}
