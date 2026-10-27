// The only place in the app that talks to Telegram (decision R-29).
// Screens import these helpers instead of touching window.Telegram directly,
// so a plain-website fallback only needs changes in this file.

const webApp = window.Telegram?.WebApp;

// True when the app is opened inside Telegram, false in a normal browser.
export const isInTelegram = Boolean(webApp?.initData);

// Tell Telegram the app is ready and let it use the full screen height.
export function initTelegram() {
  if (!isInTelegram) return;
  webApp.ready();
  webApp.expand();
}

// Raw signed launch data. The server will verify it to know who the user is.
export function getInitData() {
  return isInTelegram ? webApp.initData : '';
}
