// Stores diaries and entries in a simple key-value store:
// Telegram CloudStorage inside Telegram, browser localStorage outside it.
//
// Layout (keys are limited to A-Z a-z 0-9 _ -, values to 4096 chars):
//   diaries         -> JSON list of all diaries (short: one per sport)
//   e_<entry id>    -> JSON of one entry (notes are capped at 300 chars each)
//
// One key per entry keeps every value small and makes editing one training
// cheap. The cost: about 1000 trainings per user (CloudStorage allows 1024
// keys). That is years of diary; the server in release 2 removes the limit.

const DIARIES_KEY = 'diaries';
const ENTRY_PREFIX = 'e_';
const VALUE_LIMIT = 4096;
const BATCH = 100; // read entries in portions to keep each request small

const entryKey = (id) => `${ENTRY_PREFIX}${id}`;

function toValue(data) {
  const value = JSON.stringify(data);
  if (value.length > VALUE_LIMIT) {
    throw new Error(`Value is ${value.length} chars, the limit is ${VALUE_LIMIT}`);
  }
  return value;
}

// A broken value should not stop the whole diary from opening.
function parse(value, key) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    console.error(`Skipped unreadable value at ${key}`);
    return null;
  }
}

export function createKeyValueAdapter(store) {
  return {
    async load() {
      const keys = await store.getKeys();
      const entryKeys = keys.filter((k) => k.startsWith(ENTRY_PREFIX));

      const diariesRaw = await store.getItems([DIARIES_KEY]);
      const diaries = parse(diariesRaw[DIARIES_KEY], DIARIES_KEY) ?? [];

      const entries = [];
      for (let i = 0; i < entryKeys.length; i += BATCH) {
        const portion = entryKeys.slice(i, i + BATCH);
        const values = await store.getItems(portion);
        for (const key of portion) {
          const entry = parse(values[key], key);
          if (entry) entries.push(entry);
        }
      }
      return { diaries, entries };
    },

    async saveDiaries(list) {
      await store.setItem(DIARIES_KEY, toValue(list));
    },

    async saveEntry(entry) {
      await store.setItem(entryKey(entry.id), toValue(entry));
    },

    async deleteEntry(id) {
      await store.removeItem(entryKey(id));
    },
  };
}
