// The only place in the app that talks to Telegram (decision R-29).
// Screens import these helpers instead of touching window.Telegram directly,
// so a plain-website fallback only needs changes in this file.

import { useEffect } from 'react';

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

// Telegram CloudStorage: a small key-value store per user, kept by Telegram
// and synced across the user's devices. Limits: up to 1024 keys, key up to
// 128 chars (A-Z a-z 0-9 _ -), value up to 4096 chars. Needs Telegram 6.9+.
// Null outside Telegram or in old Telegram versions.
const rawCloud =
  isInTelegram && webApp.isVersionAtLeast?.('6.9') ? webApp.CloudStorage : null;

// Turns Telegram's callback style (error, result) into a promise.
const call = (method, ...args) =>
  new Promise((resolve, reject) => {
    rawCloud[method](...args, (error, result) => {
      if (error) reject(new Error(`CloudStorage.${method}: ${error}`));
      else resolve(result);
    });
  });

// Same four functions as the browser store in storage/browserStore.js.
export const cloudStorage = rawCloud && {
  getKeys: () => call('getKeys'),
  getItems: (keys) => call('getItems', keys),
  setItem: (key, value) => call('setItem', key, value),
  removeItem: (key) => call('removeItem', key),
};

// Show Telegram's native back button while a screen is open.
// Returns true if Telegram handles "back", so the screen can hide its own arrow.
export function useTelegramBackButton(onBack) {
  useEffect(() => {
    if (!isInTelegram || !onBack) return undefined;
    const button = webApp.BackButton;
    button.onClick(onBack);
    button.show();
    return () => {
      button.offClick(onBack);
      button.hide();
    };
  }, [onBack]);
  return isInTelegram;
}
