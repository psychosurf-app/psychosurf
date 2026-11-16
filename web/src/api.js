// The app's link to our server (release 2).
//
// The server address is set when building: VITE_API_URL=https://… npm run build.
// Without it (today's builds) the app works without a server, as before.
// The server is used only inside Telegram: it knows the person by Telegram's
// signed initData (server/src/telegramAuth.js).

import { isInTelegram, getInitData } from './telegram.js';

export const API_URL = (import.meta.env?.VITE_API_URL ?? '').replace(/\/$/, '');
export const SERVER_MODE = Boolean(API_URL) && isInTelegram;

export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`, { headers: { authorization: `tma ${getInitData()}` } });
  if (!res.ok) throw new Error(`GET ${path}: ${res.status}`);
  return res.json();
}
