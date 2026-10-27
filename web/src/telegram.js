// The only place in the app that talks to Telegram (decision R-29).
// Screens import these helpers instead of touching window.Telegram directly,
// so a plain-website fallback only needs changes in this file.

const webApp = window.Telegram?.WebApp;

// True when the app is opened inside Telegram, false in a normal browser.
export const isInTelegram = Boolean(webApp?.initData);

// Brand background from Yana's mockups. Telegram's header and page match it.
const BRAND_BG = '#c4c7ca';

// Tell Telegram the app is ready, use the full screen height and match our colors.
export function initTelegram() {
  if (!isInTelegram) return;
  webApp.ready();
  webApp.expand();
  webApp.setHeaderColor?.(BRAND_BG);
  webApp.setBackgroundColor?.(BRAND_BG);
}

// Raw signed launch data. The server will verify it to know who the user is.
export function getInitData() {
  return isInTelegram ? webApp.initData : '';
}
