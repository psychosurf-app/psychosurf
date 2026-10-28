// Keeps data in memory only. Everything is lost when the app is reloaded.
// Used for local development and as the simplest working adapter.
//
// Every adapter has the same four functions:
//   load()            -> { diaries, entries }
//   saveDiaries(list)
//   saveEntry(entry)
//   deleteEntry(id)

export function createMemoryAdapter(initial = { diaries: [], entries: [] }) {
  let diaries = [...initial.diaries];
  let entries = [...initial.entries];

  return {
    async load() {
      return { diaries: [...diaries], entries: [...entries] };
    },
    async saveDiaries(list) {
      diaries = [...list];
    },
    async saveEntry(entry) {
      entries = [...entries.filter((e) => e.id !== entry.id), entry];
    },
    async deleteEntry(id) {
      entries = entries.filter((e) => e.id !== id);
    },
  };
}
