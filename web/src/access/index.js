// What is open for this person right now (R-37). Screens ask here, never decide themselves.
//
// Test build with advice (R-39): testers get everything for free until the
// public launch (R-23). Add ?after-trial to the address to see the screens
// as they will look after the trial without a subscription (for checking).
// Release 2: TESTERS_FREE goes away and `subscribed` comes from the server.

import { ADVICE_ENABLED } from '../advice/index.js';
import { accessState } from './trial.js';
import { SERVER_MODE } from '../api.js';

const PREVIEW_AFTER_TRIAL =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('after-trial');

// Only the test build decides here; with the server, the server decides (R-37).
const TESTERS_FREE = ADVICE_ENABLED && !SERVER_MODE;

export function currentAccess(profile, entries, today) {
  if (PREVIEW_AFTER_TRIAL) return { full: false, trial: false, subscribed: false };
  if (TESTERS_FREE) return { full: true, trial: false, subscribed: false };
  return accessState({ firstDay: profile.dailyStart, today, trainings: entries.length });
}
