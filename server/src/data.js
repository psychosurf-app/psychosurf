// Diaries, trainings and profile of one person. Every query is limited to
// req.userId, so nobody can read or change someone else's diary.
// Shapes are the same as the app's own (web/src/storage), so the app only
// swaps the adapter (R-33).

export async function loadAll(db, userId) {
  const profile = await db.query(
    `SELECT display_name, to_char(daily_start, 'YYYY-MM-DD') AS daily_start,
            to_char(daily_opened, 'YYYY-MM-DD') AS daily_opened, settings
     FROM users WHERE id = $1`,
    [userId],
  );
  const diaries = await db.query(
    'SELECT key, sport_code, name, color FROM diaries WHERE user_id = $1 AND NOT hidden ORDER BY sort_order, created_at',
    [userId],
  );
  const entries = await db.query(
    `SELECT e.id, d.key AS diary_key, to_char(e.training_date, 'YYYY-MM-DD') AS training_date,
            e.created_at, e.tone, e.emotions, e.emotion_note, e.motivation,
            e.motivation_options, e.motivation_note, e.advice_pick, e.version
     FROM entries e JOIN diaries d ON d.id = e.diary_id
     WHERE e.user_id = $1 ORDER BY e.training_date, e.created_at`,
    [userId],
  );
  const p = profile.rows[0];
  return {
    profile: {
      displayName: p.display_name ?? '',
      dailyStart: p.daily_start,
      dailyOpened: p.daily_opened,
      settings: p.settings,
    },
    diaries: diaries.rows.map((d) => ({ key: d.key, code: d.sport_code, name: d.name, color: d.color })),
    entries: entries.rows.map((e) => ({
      id: e.id,
      diaryKey: e.diary_key,
      trainingDate: e.training_date,
      createdAt: new Date(e.created_at).getTime(),
      tone: e.tone,
      emotions: e.emotions,
      emotionNote: e.emotion_note,
      motivation: e.motivation,
      motivationOptions: e.motivation_options,
      motivationNote: e.motivation_note,
      ...(e.advice_pick ? { advicePick: e.advice_pick } : {}),
      version: e.version,
    })),
  };
}

export async function saveProfile(db, userId, p) {
  await db.query(
    'UPDATE users SET display_name = $2, daily_start = $3, daily_opened = $4, settings = $5 WHERE id = $1',
    [userId, p.displayName, p.dailyStart, p.dailyOpened, p.settings],
  );
}

// The app sends the whole list of chosen sports. Listed ones are added or
// updated in that order; unlisted ones are hidden, their trainings are kept.
export async function saveDiaries(db, userId, list) {
  for (const [i, d] of list.entries()) {
    await db.query(
      `INSERT INTO diaries (user_id, key, sport_code, name, color, sort_order, hidden)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       ON CONFLICT (user_id, key) DO UPDATE
       SET sport_code = EXCLUDED.sport_code, name = EXCLUDED.name, color = EXCLUDED.color,
           sort_order = EXCLUDED.sort_order, hidden = false`,
      [userId, d.key, d.code, d.name, d.color, i],
    );
  }
  await db.query('UPDATE diaries SET hidden = true WHERE user_id = $1 AND NOT (key = ANY($2::text[]))', [
    userId,
    list.map((d) => d.key),
  ]);
}

// Returns false if the diary is unknown or the id belongs to someone else.
export async function saveEntry(db, userId, e) {
  const diary = await db.query('SELECT id FROM diaries WHERE user_id = $1 AND key = $2', [userId, e.diaryKey]);
  if (!diary.rows[0]) return false;
  const res = await db.query(
    `INSERT INTO entries (id, user_id, diary_id, training_date, created_at, tone, emotions, emotion_note,
                          motivation, motivation_options, motivation_note, advice_pick, version)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (id) DO UPDATE
     SET diary_id = EXCLUDED.diary_id, training_date = EXCLUDED.training_date, tone = EXCLUDED.tone,
         emotions = EXCLUDED.emotions, emotion_note = EXCLUDED.emotion_note, motivation = EXCLUDED.motivation,
         motivation_options = EXCLUDED.motivation_options, motivation_note = EXCLUDED.motivation_note,
         advice_pick = EXCLUDED.advice_pick, version = EXCLUDED.version, updated_at = now()
     WHERE entries.user_id = EXCLUDED.user_id
     RETURNING id`,
    [e.id, userId, diary.rows[0].id, e.trainingDate, e.createdAt, e.tone, e.emotions, e.emotionNote,
      e.motivation, e.motivationOptions, e.motivationNote, e.advicePick, e.version],
  );
  return res.rows.length === 1;
}

export async function deleteEntry(db, userId, id) {
  await db.query('DELETE FROM entries WHERE id = $1 AND user_id = $2', [id, userId]);
}
