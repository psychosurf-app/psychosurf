import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyInitData, signInitData } from '../src/telegramAuth.js';

const TOKEN = '123456:TEST-token-not-real';
// Signed by an independent Python script (hmac + hashlib), not by our own code.
const PYTHON_VECTOR = 'auth_date=1763300000&query_id=AAH&user=%7B%22id%22%3A424242%2C%22first_name%22%3A%22%D0%A2%D0%B5%D1%81%D1%82%22%7D&signature=abc&hash=82fd326761eacae4207ba597531a5d6019e2060c4c359bb878c030e0b9c801b1';
const AT = 1763300000 * 1000;

test('accepts data signed the Telegram way (independent reference)', () => {
  assert.deepEqual(verifyInitData(PYTHON_VECTOR, TOKEN, { now: AT }), {
    telegramId: '424242',
    authDate: 1763300000,
  });
});

test('refuses a changed field', () => {
  const tampered = PYTHON_VECTOR.replace('424242', '424243');
  assert.equal(verifyInitData(tampered, TOKEN, { now: AT }), null);
});

test('refuses another bot token', () => {
  assert.equal(verifyInitData(PYTHON_VECTOR, '999:other', { now: AT }), null);
});

test('refuses data older than a day', () => {
  assert.equal(verifyInitData(PYTHON_VECTOR, TOKEN, { now: AT + 25 * 3600 * 1000 }), null);
});

test('refuses empty or broken input', () => {
  assert.equal(verifyInitData('', TOKEN), null);
  assert.equal(verifyInitData('user=1&hash=zz', TOKEN), null);
  assert.equal(verifyInitData(PYTHON_VECTOR, '', { now: AT }), null);
});

test('signInitData round trip (used by tests)', () => {
  const data = signInitData({ auth_date: '1763300000', user: JSON.stringify({ id: 7 }) }, TOKEN);
  assert.equal(verifyInitData(data, TOKEN, { now: AT }).telegramId, '7');
});
