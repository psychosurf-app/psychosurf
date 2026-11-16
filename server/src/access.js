// What is open for a person (R-37). Same rules as web/src/access/trial.js;
// the server is the one that decides in release 2, the app only shows it.
// A test (access.test.js) checks both give the same answers.
//
// Trial: 2 weeks or 4 trainings, whichever is later, not longer than 30 days,
// counted from the first day in the app (users.daily_start).

export const TRIAL = { days: 14, trainings: 4, maxDays: 30 };

const DAY_MS = 86400000;
export const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);

export function accessState({ firstDay, today, trainings, subscribed = false }) {
  const days = Math.max(0, daysBetween(firstDay ?? today, today));
  const trial = days < TRIAL.maxDays && (days < TRIAL.days || trainings < TRIAL.trainings);
  return { full: subscribed || trial, trial, subscribed };
}

// Reads what is needed from the database. `testersFree`: closed test before
// the public launch, everything open for everyone (R-23, R-39).
export async function accessFor(db, userId, today, { testersFree = false } = {}) {
  if (testersFree) return { full: true, trial: false, subscribed: false };
  const { rows } = await db.query(
    `SELECT to_char(u.daily_start, 'YYYY-MM-DD') AS first_day,
            (SELECT count(*)::int FROM entries e WHERE e.user_id = u.id) AS trainings
     FROM users u WHERE u.id = $1`,
    [userId],
  );
  // Subscriptions come with payments (Z-1); until then nobody is subscribed.
  return accessState({ firstDay: rows[0].first_day, today, trainings: rows[0].trainings });
}
