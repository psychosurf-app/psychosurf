// Checks what the app sends before it goes into the database.
// Throws BadRequest with a short reason; the route answers 400.

export class BadRequest extends Error {}

const fail = (why) => {
  throw new BadRequest(why);
};

export const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE = /^Сл-\d{1,3}$/;

const text = (v, max, name) => {
  if (v === undefined || v === null) return '';
  if (typeof v !== 'string' || v.length > max) fail(`${name}: text up to ${max} chars`);
  return v;
};

const codes = (v, name) => {
  if (v === undefined) return [];
  if (!Array.isArray(v) || v.length > 60 || !v.every((c) => typeof c === 'string' && CODE.test(c))) {
    fail(`${name}: list of dictionary codes`);
  }
  return [...new Set(v)];
};

export function profileInput(body) {
  if (!body || typeof body !== 'object') fail('profile: object');
  const date = (v, name) => {
    if (v === undefined || v === null || v === '') return null;
    if (!isDate(v)) fail(`${name}: YYYY-MM-DD`);
    return v;
  };
  const settings = body.settings ?? {};
  if (typeof settings !== 'object' || Array.isArray(settings) || JSON.stringify(settings).length > 2000) {
    fail('settings: small object');
  }
  return {
    displayName: text(body.displayName, 40, 'displayName').trim() || null,
    dailyStart: date(body.dailyStart, 'dailyStart'),
    dailyOpened: date(body.dailyOpened, 'dailyOpened'),
    settings,
  };
}

export function diariesInput(body) {
  if (!Array.isArray(body) || body.length > 60) fail('diaries: list');
  const keys = new Set();
  return body.map((d) => {
    if (!d || typeof d.key !== 'string' || !d.key || d.key.length > 80) fail('diary.key');
    if (keys.has(d.key)) fail('diary.key: twice');
    keys.add(d.key);
    if (typeof d.name !== 'string' || !d.name.trim() || d.name.length > 60) fail('diary.name');
    if (typeof d.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(d.color)) fail('diary.color');
    if (d.code !== null && d.code !== undefined && (typeof d.code !== 'string' || d.code.length > 40)) {
      fail('diary.code');
    }
    return { key: d.key, code: d.code ?? null, name: d.name.trim(), color: d.color };
  });
}

export function entryId(id) {
  if (!UUID.test(id)) fail('entry id: uuid');
  return id;
}

export function entryInput(id, body) {
  if (!UUID.test(id)) fail('entry id: uuid');
  if (!body || typeof body !== 'object') fail('entry: object');
  if (body.id !== undefined && body.id !== id) fail('entry id differs from the address');
  if (typeof body.diaryKey !== 'string' || !body.diaryKey) fail('entry.diaryKey');
  if (!isDate(body.trainingDate)) fail('entry.trainingDate: YYYY-MM-DD');
  if (!Number.isFinite(body.createdAt) || body.createdAt < Date.UTC(2026, 0, 1)) fail('entry.createdAt: ms');
  if (!['good', 'hard', 'numb'].includes(body.tone)) fail('entry.tone');
  if (body.motivation != null && !['forward', 'not_forward'].includes(body.motivation)) fail('entry.motivation');
  if (body.advicePick != null && (typeof body.advicePick !== 'object' || JSON.stringify(body.advicePick).length > 4000)) {
    fail('entry.advicePick');
  }
  return {
    id,
    diaryKey: body.diaryKey,
    trainingDate: body.trainingDate,
    createdAt: new Date(body.createdAt),
    tone: body.tone,
    emotions: codes(body.emotions, 'emotions'),
    emotionNote: text(body.emotionNote, 1000, 'emotionNote'),
    motivation: body.motivation ?? null,
    motivationOptions: codes(body.motivationOptions, 'motivationOptions'),
    motivationNote: text(body.motivationNote, 1000, 'motivationNote'),
    advicePick: body.advicePick ?? null,
    version: Number.isInteger(body.version) ? body.version : 1,
  };
}
