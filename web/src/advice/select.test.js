// Run: npm test (inside web/). Uses Node's built-in test runner, no extra packages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectAdvice } from './select.js';
import { EMOTION_GROUPS, MOTIVATION_GROUPS } from './catalog.js';

const entry = (over) => ({
  tone: 'good',
  emotions: [],
  motivation: 'forward',
  motivationOptions: ['Сл-43'], // Интерес
  ...over,
});

// Plays N trainings in a row, each seeing the picks of the earlier ones.
function play(entries, sportGroup = 'water') {
  const history = [];
  for (const e of entries) history.push(selectAdvice(e, sportGroup, history));
  return history;
}

test('every dictionary emotion and motivation belongs to exactly one group', () => {
  const emo = EMOTION_GROUPS.flatMap((g) => g.options);
  const mot = MOTIVATION_GROUPS.flatMap((g) => g.options);
  assert.equal(new Set(emo).size, emo.length);
  assert.equal(new Set(mot).size, mot.length);
  assert.equal(emo.length, 39); // Сл-1 … Сл-39
  assert.equal(mot.length, 19); // Сл-41 … Сл-59
});

test('one good group: base variant first, then extras, then again from base', () => {
  const lift = entry({ emotions: ['Сл-1'] }); // Отличное настроение -> Подъём
  const picks = play(Array(6).fill(lift)).map((p) => p.advices[0].part12);
  assert.deepEqual(picks, ['С-11', 'С-11.2', 'С-11.3', 'С-11.4', 'С-11.5', 'С-11']);
});

test('part 3 rotates on its own circle', () => {
  const picks = play(Array(3).fill(entry({ emotions: ['Сл-1'] }))).map((p) => p.part3);
  assert.deepEqual(picks, ['С-14', 'С-14.2', 'С-14.3']);
});

test('group with more marked emotions wins over importance order', () => {
  // Гордость (rank 7) x1, Покой (rank 9) x2 -> Покой
  const p = selectAdvice(entry({ emotions: ['Сл-3', 'Сл-12', 'Сл-13'] }), 'water');
  assert.equal(p.advices[0].group, 'calm');
});

test('tie inside a tone: importance first, then alternate', () => {
  // Гордость x1 + Подъём x1 -> Гордость, next time Подъём
  const e = entry({ emotions: ['Сл-3', 'Сл-1'] });
  const groups = play([e, e, e]).map((p) => p.advices[0].group);
  assert.deepEqual(groups, ['pride', 'lift', 'pride']);
});

test('equal good and hard: two advices, hard first', () => {
  const p = selectAdvice(entry({ tone: 'hard', emotions: ['Сл-1', 'Сл-18'] }), 'water');
  assert.deepEqual(p.advices.map((a) => a.tone), ['hard', 'good']);
  assert.equal(p.lineType, 'tie');
  assert.ok(p.part3); // shared part 3
});

test('more hard than good: one advice about hard, line "mixed"', () => {
  const p = selectAdvice(
    entry({ tone: 'hard', emotions: ['Сл-18', 'Сл-19', 'Сл-1'], motivation: 'forward' }),
    'water',
  );
  assert.equal(p.advices.length, 1);
  assert.equal(p.advices[0].group, 'tired');
  assert.equal(p.lineType, 'mixed');
  assert.equal(p.bag, 'paddling');
});

test('С-27: good wins with something hard, but never twice in a row', () => {
  const e = entry({ emotions: ['Сл-1', 'Сл-2', 'Сл-18'] });
  const specials = play([e, e, e]).map((p) => p.advices[0].special);
  assert.deepEqual(specials, ['С-27', null, 'С-27']);
});

test('special case replaces assembly and fixes its bag', () => {
  // Страх + Цель -> С-23, bag "Гребу к волне", no separate part 3
  const p = selectAdvice(
    entry({ tone: 'hard', emotions: ['Сл-30'], motivationOptions: ['Сл-47'] }),
    'gym',
  );
  assert.equal(p.advices[0].special, 'С-23');
  assert.equal(p.part3, null);
  assert.equal(p.bag, 'paddling');
  assert.equal(p.ending, 'С-2');
});

test('note words add +1 inside the winning tone but do not flip it', () => {
  const base = entry({ emotions: ['Сл-3', 'Сл-1'] }); // tie pride/lift -> pride
  assert.equal(selectAdvice(base, 'water', [], ['Сл-2']).advices[0].group, 'lift');
  // a hard note word alone does not turn good into two advices
  const p = selectAdvice(entry({ emotions: ['Сл-1'] }), 'water', [], ['Сл-18', 'Сл-19']);
  assert.equal(p.advices.length, 1);
  assert.equal(p.advices[0].tone, 'good');
});

test('"really nothing" gives no advice', () => {
  assert.equal(selectAdvice(entry({ tone: 'numb', emotions: [] }), 'water'), null);
});
