// Middleware: every /api request except /api/health must carry valid Telegram initData.
// On success req.userId is our own user id (not the Telegram id, R-29).

import { verifyInitData } from './telegramAuth.js';
import { findOrCreateTelegramUser } from './users.js';

export function requireTelegramUser({ db, botToken, now }) {
  return async (req, res, next) => {
    const header = req.get('authorization') ?? '';
    const [scheme, initData] = [header.slice(0, 4), header.slice(4)];
    const auth = scheme === 'tma ' ? verifyInitData(initData, botToken, { now: now?.() }) : null;
    if (!auth) return res.status(401).json({ error: 'unauthorized' });
    try {
      const user = await findOrCreateTelegramUser(db, auth.telegramId);
      req.userId = user.id;
      req.isNewUser = user.created;
      next();
    } catch (error) {
      next(error);
    }
  };
}
