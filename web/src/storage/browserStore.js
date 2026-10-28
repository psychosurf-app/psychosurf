// Browser localStorage with the same four functions as Telegram CloudStorage
// (see cloudStorage in telegram.js). Used when the app is opened in a normal
// browser during development, so saving can be checked without Telegram.
// All keys get a prefix so they never clash with anything else on localhost.

const PREFIX = 'psychosurf:';

export const browserStore = {
  async getKeys() {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .map((k) => k.slice(PREFIX.length));
  },
  async getItems(keys) {
    return Object.fromEntries(keys.map((k) => [k, localStorage.getItem(PREFIX + k) ?? '']));
  },
  async setItem(key, value) {
    localStorage.setItem(PREFIX + key, value);
  },
  async removeItem(key) {
    localStorage.removeItem(PREFIX + key);
  },
};
