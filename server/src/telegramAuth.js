// Checks that a request really comes from our Mini App in Telegram (step 2 of release 2).
//
// Telegram gives the Mini App a signed string, initData. The app sends it with
// every request in the header "Authorization: tma <initData>". The server checks
// the signature with the bot token: nobody without the token can forge it.
// No passwords, no login screen. We keep only the Telegram user id, nothing
// else from Telegram (no name, no photo: I-26, R-29).
//
// Algorithm (Telegram docs, "Validating data received via the Mini App"):
//   data_check_string = all fields except hash, sorted by key, "key=value" joined by "\n"
//   secret_key        = HMAC_SHA256(key = "WebAppData", message = bot_token)
//   valid if hex(HMAC_SHA256(key = secret_key, message = data_check_string)) == hash
// Since 2024 initData also has a `signature` field (for third-party checks).
// Sources differ on whether it is part of data_check_string, so both variants
// are accepted; both need the bot token, so neither can be forged.

import { createHmac, timingSafeEqual } from 'node:crypto';

// A signed string older than this is refused, so a copied one cannot be reused forever.
export const MAX_AGE_SECONDS = 24 * 60 * 60;

const hmac = (key, message) => createHmac('sha256', key).update(message).digest();

function checkString(params, skip) {
  return [...params.entries()]
    .filter(([key]) => !skip.includes(key))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

function sameHex(a, b) {
  const x = Buffer.from(a, 'hex');
  const y = Buffer.from(b, 'hex');
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

/**
 * @returns { telegramId: string, authDate: number } or null if anything is wrong
 */
export function verifyInitData(initData, botToken, { now = Date.now(), maxAge = MAX_AGE_SECONDS } = {}) {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  const secret = hmac('WebAppData', botToken);
  const variants = [['hash'], ['hash', 'signature']];
  const valid = variants.some((skip) => sameHex(hmac(secret, checkString(params, skip)).toString('hex'), hash));
  if (!valid) return null;

  const authDate = Number(params.get('auth_date'));
  if (!Number.isFinite(authDate) || now / 1000 - authDate > maxAge) return null;

  let user;
  try {
    user = JSON.parse(params.get('user') ?? 'null');
  } catch {
    return null;
  }
  if (!user?.id) return null;
  return { telegramId: String(user.id), authDate };
}

// For tests and local development only: signs initData like Telegram does.
export function signInitData(fields, botToken) {
  const params = new URLSearchParams(fields);
  const secret = hmac('WebAppData', botToken);
  params.set('hash', hmac(secret, checkString(params, ['hash'])).toString('hex'));
  return params.toString();
}
