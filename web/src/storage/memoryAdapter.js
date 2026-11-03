// Keeps data in memory only. Everything is lost when the app is reloaded.
// Used for local development and as the simplest working adapter.
//
// Every adapter has the same four functions:
//   load()            -> { profile, diaries, entries }
//   saveProfile(profile)
//   saveDiaries(list)
//   saveEntry(entry)
//   deleteEntry(id)

export function createMemoryAdapter(initial = { diaries: [], entries: [] }) {
  let profile = { ...(initial.profile ?? {}) };
  let diaries = [...initial.diaries];
  let entries = [...initial.entries];

  return {
    async load() {
      return { profile: { ...profile }, diaries: [...diaries], entries: [...entries] };
    },
    async saveProfile(next) {
      profile = { ...next };
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
