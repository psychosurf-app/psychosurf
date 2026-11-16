// Trial period and what is open after it (decision R-37, 2026-11-07).
//
// Pure function: no storage, no screens, no payment.
// Trial: 2 weeks or 4 trainings, whichever comes later, but not longer than 30 days.
// Counted from the first day in the app (profile.dailyStart, set at the first start).
// After the trial, without a subscription:
// - part 1 of every advice stays open, parts 2-3 are locked (text I-46);
// - the orange block about a specialist stays open (I-45);
// - "Приём дня" is locked (V-47).

import { daysBetween } from '../daily/days.js';

export const TRIAL = { days: 14, trainings: 4, maxDays: 30 };

/**
 * @param firstDay    'YYYY-MM-DD', the first day in the app
 * @param today       'YYYY-MM-DD'
 * @param trainings   how many trainings the person has recorded (all sports)
 * @param subscribed  paid subscription is active (release 2, always false for now)
 * @returns { full, trial, subscribed }  full = everything is open
 */
export function accessState({ firstDay, today, trainings, subscribed = false }) {
  const days = Math.max(0, daysBetween(firstDay ?? today, today));
  const trial = days < TRIAL.maxDays && (days < TRIAL.days || trainings < TRIAL.trainings);
  return { full: subscribed || trial, trial, subscribed };
}
