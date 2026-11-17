import { test } from 'node:test';
import assert from 'node:assert/strict';
import { noteCodes, SKIPPED_SHARED } from './noteMatch.js';

test('female and male forms both match', () => {
  assert.deepEqual(noteCodes('Очень устала сегодня'), ['Сл-18']);
  assert.deepEqual(noteCodes('устал как собака'), ['Сл-18']);
  assert.ok(noteCodes('Испугалась на большой волне').includes('Сл-30'));
  assert.ok(noteCodes('злилась на себя').includes('Сл-39'));
});

test('"не" before a word cancels it', () => {
  assert.deepEqual(noteCodes('совсем не устала'), []);
});

test('phrases and the option label itself', () => {
  assert.ok(noteCodes('ноги ватные, как в болоте').includes('Сл-19'));
  assert.ok(noteCodes('было чувство свободы').includes('Сл-16'));
  assert.ok(noteCodes('ВСЁ РАВНО было').includes('Сл-24'));
});

test('no word is shared by two groups after V-51', () => {
  assert.deepEqual(SKIPPED_SHARED, []);
});

test('V-51: "бесит" is Злость, "обидно" is Разочарование', () => {
  assert.deepEqual(noteCodes('бесит'), ['Сл-39']);
  assert.deepEqual(noteCodes('обидно').sort(), ['Сл-26', 'Сл-27']);
});

test('a longer phrase takes its words: "бесит, что не получается" is only Самокритика', () => {
  assert.deepEqual(noteCodes('Бесит, что не получается'), ['Сл-31']);
  assert.deepEqual(noteCodes('бесит, что не получается, и вообще бесит всё').sort(), ['Сл-31', 'Сл-39']);
});

test('empty note', () => {
  assert.deepEqual(noteCodes(''), []);
  assert.deepEqual(noteCodes(undefined), []);
});

test('short stems take only a short ending', () => {
  assert.ok(noteCodes('вялая какая-то').includes('Сл-21'));
  assert.deepEqual(noteCodes('малыш смотрел с берега'), []);
});
