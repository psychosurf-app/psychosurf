// "Как тебя называть" (V-18): optional; empty means the default greeting.
// The Telegram name is not used: it is often a nickname, emoji or Latin letters.
export const DEFAULT_NAME = 'психосёрфик';
export const NAME_LIMIT = 30;

export const cleanName = (value) => value.replace(/\s+/g, ' ').trim().slice(0, NAME_LIMIT);
export const greetingName = (displayName) => displayName || DEFAULT_NAME;
