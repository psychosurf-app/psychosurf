// The only entry point for saving and loading user data (decision R-33).
//
// Screens and App.jsx never touch memory, Telegram CloudStorage or a server
// directly. They call the functions below. To change where data lives,
// swap the adapter in this file; nothing else in the app changes.
//
// Every function is async on purpose: Telegram CloudStorage and a server
// are both async, so screens are written for that from day one.

import { createMemoryAdapter } from './memoryAdapter.js';
import { createKeyValueAdapter } from './keyValueAdapter.js';
import { browserStore } from './browserStore.js';
import { cloudStorage } from '../telegram.js';
import { isDemo, DEMO_DIARIES, DEMO_ENTRIES } from '../lib/demo.js';

// Format version stamped on every saved record (decision R-33, rule 3).
// Bump it when the shape of a diary or an entry changes, and teach
// `upgrade` below how to turn the old shape into the new one.
export const SCHEMA_VERSION = 1;

// Where data lives now (test build, no server):
// - inside Telegram: Telegram CloudStorage, synced across the user's devices;
// - in a normal browser (development): localStorage of that browser;
// - demo mode (?demo in the address): memory only, so demo data never
//   mixes with a real user's diary.
// Release 2: a server adapter replaces the Telegram one here.
function pickAdapter() {
  if (isDemo) return createMemoryAdapter({ diaries: DEMO_DIARIES, entries: DEMO_ENTRIES });
  return createKeyValueAdapter(cloudStorage ?? browserStore);
}

const adapter = pickAdapter();

const stamp = (record) => ({ ...record, version: SCHEMA_VERSION });

// Brings a record saved by an older app version up to the current format.
// Version 1 is the first format, so there is nothing to upgrade yet.
function upgrade(record) {
  return record;
}

// Everything the app needs at start: { diaries: [...], entries: [...] }.
export async function loadUserData() {
  const { diaries, entries } = await adapter.load();
  return {
    diaries: diaries.map(upgrade),
    entries: entries.map(upgrade),
  };
}

// Saves the full list of diaries (it is short: one per sport).
export async function saveDiaries(diaries) {
  await adapter.saveDiaries(diaries.map(stamp));
}

// Saves one entry. A new entry is added, an existing id is replaced.
export async function saveEntry(entry) {
  await adapter.saveEntry(stamp(entry));
}

// Removes one entry by id.
export async function deleteEntry(id) {
  await adapter.deleteEntry(id);
}
