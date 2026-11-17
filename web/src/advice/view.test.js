import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectAdvice } from './select.js';
import { introLine, motivationLine } from './view.js';

const pickFor = (entry, history = []) => selectAdvice(entry, 'water', history);

test('I-50 item 4: two hard groups tied -> line names both, advice about the more important', () => {
  // Усталость (Сл-18) and Страх (Сл-29), one each: Страх и тревога is higher (V-42).
  const entry = { tone: 'hard', emotions: ['Сл-18', 'Сл-29'], motivation: 'forward', motivationOptions: ['Сл-41'] };
  const pick = pickFor(entry);
  assert.equal(pick.advices[0].group, 'fear');
  assert.equal(
    introLine(entry, pick),
    'Сегодня твои чувства поровну разделились между двумя состояниями — «Страх и тревога» и «Усталость». Поговорим про «Страх и тревога»: это состояние сейчас важнее разобрать первым.',
  );
});

test('one group: the usual line', () => {
  const entry = { tone: 'hard', emotions: ['Сл-18'], motivation: 'forward', motivationOptions: ['Сл-41'] };
  assert.match(introLine(entry, pickFor(entry)), /^Ты отметил усталость\. Похожие чувства мы объединяем в состояние «Усталость»/);
});

test('I-51 item 2: two motivation groups tied -> groups and reason, no options', () => {
  // Скука (Сл-50) and Через силу (Сл-53, "Через не хочу"): "Через не хочу" wins (V-48).
  const entry = { tone: 'hard', emotions: ['Сл-18'], motivation: 'not_forward', motivationOptions: ['Сл-50', 'Сл-53'] };
  const pick = pickFor(entry);
  assert.equal(pick.motivationGroup, 'reluctant');
  assert.equal(
    motivationLine(entry, pick),
    'Сегодня твои отметки про мотивацию поровну разделились между двумя настроями — «Через не хочу» и «Скука». Поговорим про «Через не хочу»: этот настрой сильнее всего мешает дойти до следующей тренировки.',
  );
});

test('I-51 item 1: one motivation group names the options', () => {
  const entry = { tone: 'good', emotions: ['Сл-1'], motivation: 'forward', motivationOptions: ['Сл-41', 'Сл-43'] };
  assert.match(motivationLine(entry, pickFor(entry)), /^Про мотивацию ты отметил «.+» и «.+»\. Такой настрой мы называем «Интерес»\.$/);
});

test('I-50 item 5: special case line names emotions and motivation', () => {
  // Страх (Сл-29) + Цель (Сл-42) -> С-23.
  const entry = { tone: 'hard', emotions: ['Сл-29'], motivation: 'forward', motivationOptions: ['Сл-42'] };
  const pick = pickFor(entry);
  assert.equal(pick.advices[0].special, 'С-23');
  const line = introLine(entry, pick);
  assert.match(line, /^Ты отметил \S+ и в мотивации «.+»\. Такие чувства и настрой влияют друг на друга и вместе говорят больше, чем по отдельности\. Поэтому сегодня совет — про это сочетание\.$/);
  assert.equal(motivationLine(entry, pick), null);
});

test('final lines go in a circle: С-1, С-1.2 … С-1.5, then С-1 again', () => {
  const entry = { tone: 'good', emotions: ['Сл-1'], motivation: 'forward', motivationOptions: ['Сл-41'] };
  const history = [];
  const seen = [];
  for (let i = 0; i < 6; i++) {
    const pick = pickFor(entry, history);
    seen.push(pick.ending);
    history.push(pick);
  }
  assert.deepEqual(seen, ['С-1', 'С-1.2', 'С-1.3', 'С-1.4', 'С-1.5', 'С-1']);
});
