// Remembers the last save that failed, so the app can say so and offer a retry.
//
// Saving runs in the background after the screen has already changed (App.jsx),
// so without this a lost save would go unnoticed (it used to only reach the console).
// Only the latest failed save is kept: retrying it is enough for the person,
// and the next successful save of the same thing replaces it anyway.

import { useSyncExternalStore } from 'react';

let failed = null; // function that repeats the failed save, or null
const listeners = new Set();

const notify = () => listeners.forEach((l) => l());
const set = (value) => {
  failed = value;
  notify();
};

// Runs a save in the background. `run` returns a promise (e.g. () => saveEntry(entry)).
export function trackSave(run) {
  Promise.resolve()
    .then(run)
    .then(() => {
      if (failed === run) set(null);
    })
    .catch((error) => {
      console.error('Save failed', error);
      set(run);
    });
}

export function retryFailedSave() {
  const run = failed;
  if (!run) return;
  set(null);
  trackSave(run);
}

export function dismissSaveError() {
  set(null);
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// true while there is a failed save to show.
export const useSaveFailed = () => useSyncExternalStore(subscribe, () => failed !== null);
