import { useState } from 'react';
import raccoonPeek from '../assets/raccoon-peek.png';
import StepHeader from '../components/StepHeader.jsx';
import { OptionChips, OtherOptions, NoteField } from '../components/OptionPicker.jsx';
import { DateChip, DateSheet } from '../components/DatePicker.jsx';
import { NOTHING_GROUPS, OPTION_BY_CODE, optionsOfKind } from '../data/options.js';
import { todayIso } from '../lib/format.js';
import Article from './Article.jsx';

// Training entry in 3 steps (decision R-27, mockups G-5, G-6, G-7, G-10 to G-12, G-14).
// Date choice on step 1 (I-29, G-17).
// "Ничего не чувствую" opens "Точно ничего?" (I-20, G-13 v3); motivation is asked after it anyway (V-21).
// Step 2 needs at least one emotion, step 3 at least one motivation option (V-23).

const EMOTION_GROUPS = {
  good: { main: 'E+', other: 'E-', mainTitle: 'Приятное', otherTitle: 'Непростое' },
  hard: { main: 'E-', other: 'E+', mainTitle: 'Непростое', otherTitle: 'Приятное' },
};

const MOTIVATION_GROUPS = {
  forward: { main: 'M+', other: 'M-', otherTitle: 'Не тянет' },
  not_forward: { main: 'M-', other: 'M+', otherTitle: 'Тянет вперёд' },
};

const isNothingOnly = (code) => Boolean(OPTION_BY_CODE[code]?.nothingOnly);

// Tone after "Точно ничего?" (proposal in V-32, waits for Yana):
// only "quiet calm" options chosen → "Скорее хорошо", anything else → "Скорее непросто".
const toneFromNearEmotions = (codes) =>
  codes.every((c) => OPTION_BY_CODE[c]?.kind === 'E+') ? 'good' : 'hard';

const toggleIn = (list, code) =>
  list.includes(code) ? list.filter((c) => c !== code) : [...list, code];

// `initial` — an existing entry to edit (pencil on G-15); empty for a new entry.
export default function EntryFlow({ diary, diaryEntries, initial, onCancel, onSave }) {
  const [step, setStep] = useState(1);
  const [trainingDate, setTrainingDate] = useState(initial?.trainingDate ?? todayIso());
  const [dateOpen, setDateOpen] = useState(false);
  const [tone, setTone] = useState(initial?.tone ?? null);
  const [emotions, setEmotions] = useState(initial?.emotions ?? []);
  const [emotionNote, setEmotionNote] = useState(initial?.emotionNote ?? '');
  const [motivation, setMotivation] = useState(initial?.motivation ?? null);
  const [motivationOptions, setMotivationOptions] = useState(initial?.motivationOptions ?? []);
  const [motivationNote, setMotivationNote] = useState(initial?.motivationNote ?? '');
  // True when step 3 was reached through "Точно ничего?": "back" leads there, not to step 2.
  const [viaNothing, setViaNothing] = useState(false);
  // The motivation article opens over the entry, so nothing typed so far is lost (I-39).
  const [readingArticle, setReadingArticle] = useState(false);

  function pickTone(value) {
    setTone(value);
    setViaNothing(false);
    // Options from "Точно ничего?" don't belong to the usual lists.
    setEmotions((list) => list.filter((c) => !isNothingOnly(c)));
    setStep(2);
  }

  function openNothing() {
    // A fresh choice: emotions of step 2 don't carry over.
    setEmotions((list) => (tone === 'numb' || list.some(isNothingOnly) ? list : []));
    setStep('nothing');
  }

  function nothingNext() {
    setTone(toneFromNearEmotions(emotions));
    setViaNothing(true);
    setStep(3);
  }

  function reallyNothing() {
    setTone('numb');
    setEmotions([]);
    setViaNothing(true);
    setStep(3);
  }

  function save() {
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      diaryKey: diary.key,
      trainingDate,
      createdAt: initial?.createdAt ?? Date.now(),
      tone,
      emotions,
      emotionNote: emotionNote.trim(),
      motivation,
      motivationOptions,
      motivationNote: motivationNote.trim(),
    });
  }

  // Step 1 — overall tone (G-5).
  if (step === 1) {
    return (
      <main className="screen entry">
        <StepHeader sportName={diary.name} step={1} onBack={onCancel} />
        <DateChip value={trainingDate} onClick={() => setDateOpen(true)} />
        <h1 className="page-title">Как ты сейчас, сразу после тренировки?</h1>
        <p className="page-text">
          Прислушайся к себе в первые минуты. Не вспоминай всю тренировку — только то, что
          чувствуешь на выходе.
        </p>

        <div className="entry-bottom">
          <img className="raccoon-peek" src={raccoonPeek} alt="" />
          <button type="button" className="tone-card" onClick={() => pickTone('good')}>
            <span className="tone-icon" style={{ background: 'var(--teal)' }}>⌃</span>
            <span>
              <span className="tone-title">Скорее хорошо</span>
              <span className="tone-sub">На выходе приятное чувство</span>
            </span>
          </button>
          <button type="button" className="tone-card" onClick={() => pickTone('hard')}>
            <span className="tone-icon" style={{ background: '#c2481c' }}>⌄</span>
            <span>
              <span className="tone-title">Скорее непросто</span>
              <span className="tone-sub">На выходе тяжело или неприятно</span>
            </span>
          </button>
          <button type="button" className="btn-link" onClick={openNothing}>
            Ничего не чувствую
          </button>
        </div>

        {dateOpen && (
          <DateSheet
            value={trainingDate}
            markedDates={new Set(diaryEntries.map((e) => e.trainingDate))}
            onClose={() => setDateOpen(false)}
            onDone={(iso) => {
              setTrainingDate(iso);
              setDateOpen(false);
            }}
          />
        )}
      </main>
    );
  }

  // "Точно ничего?" — close emotions, or confirm "really nothing" (G-13 v3, I-20).
  if (step === 'nothing') {
    const count = emotions.length;
    return (
      <main className="screen entry">
        <StepHeader sportName={diary.name} step={2} onBack={() => setStep(1)} />
        <h1 className="page-title">Точно ничего?</h1>
        <p className="page-text">
          Дружок, совсем ничего не чувствовать почти невозможно. Часто так ощущается усталость.
          Прислушайся ещё раз — может, что-то из этого?
        </p>

        {NOTHING_GROUPS.map((g) => (
          <section key={g.title} className="option-group">
            <h3 className="group-title">{g.title}</h3>
            <OptionChips
              options={g.options}
              selected={emotions}
              onToggle={(c) => setEmotions(toggleIn(emotions, c))}
            />
          </section>
        ))}

        <div className="entry-bottom">
          <img className="raccoon-peek" src={raccoonPeek} alt="" />
          <button type="button" className="btn-primary" disabled={count === 0} onClick={nothingNext}>
            {count > 0 ? `Дальше · выбрано ${count}` : 'Дальше'}
          </button>
          <button type="button" className="btn-link" onClick={reallyNothing}>
            Нет, правда ничего не чувствую
          </button>
        </div>
      </main>
    );
  }

  // Step 2 — emotions of the chosen sign, "было и другое", note (G-6, G-10, G-11, G-14).
  if (step === 2) {
    const g = EMOTION_GROUPS[tone];
    const count = emotions.length;
    return (
      <main className="screen entry">
        <StepHeader sportName={diary.name} step={2} onBack={() => setStep(1)} />
        <h1 className="page-title">Что именно чувствуешь?</h1>
        <p className="page-text">Отмечай всё, что откликается. Можно несколько.</p>

        <section className="option-group">
          <h3 className="group-title">{g.mainTitle}</h3>
          <OptionChips
            options={optionsOfKind(g.main)}
            selected={emotions}
            onToggle={(c) => setEmotions(toggleIn(emotions, c))}
          />
        </section>
        <OtherOptions
          key={tone}
          title={g.otherTitle}
          options={optionsOfKind(g.other)}
          selected={emotions}
          onToggle={(c) => setEmotions(toggleIn(emotions, c))}
        />
        <NoteField value={emotionNote} onChange={setEmotionNote} />

        <div className="entry-bottom">
          <img className="raccoon-peek" src={raccoonPeek} alt="" />
          {/* At least one emotion is required (V-23). */}
          <button
            type="button"
            className="btn-primary"
            disabled={count === 0}
            onClick={() => setStep(3)}
          >
            {count > 0 ? `Дальше · выбрано ${count}` : 'Дальше'}
          </button>
        </div>
      </main>
    );
  }

  if (readingArticle) {
    return <Article articleKey="motivation" onBack={() => setReadingArticle(false)} />;
  }

  // Step 3 — motivation, required choice (G-7, G-12).
  const m = motivation ? MOTIVATION_GROUPS[motivation] : null;
  return (
    <main className="screen entry">
      <StepHeader
        sportName={diary.name}
        step={3}
        onBack={() => setStep(viaNothing ? 'nothing' : 2)}
      />
      <h1 className="page-title">А что с мотивацией?</h1>
      <button type="button" className="link-sm article-link" onClick={() => setReadingArticle(true)}>
        Что такое мотивация?
      </button>
      <p className="page-text">Хочется двигаться дальше? Выбери, что ближе.</p>

      <div className="segmented" role="radiogroup">
        {[
          ['forward', 'Тянет вперёд'],
          ['not_forward', 'Не тянет'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={motivation === value}
            className={motivation === value ? 'on' : ''}
            onClick={() => setMotivation(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {m && (
        <>
          <OptionChips
            options={optionsOfKind(m.main)}
            selected={motivationOptions}
            onToggle={(c) => setMotivationOptions(toggleIn(motivationOptions, c))}
          />
          <OtherOptions
            key={motivation}
            title={m.otherTitle}
            options={optionsOfKind(m.other)}
            selected={motivationOptions}
            onToggle={(c) => setMotivationOptions(toggleIn(motivationOptions, c))}
          />
          <NoteField value={motivationNote} onChange={setMotivationNote} />
        </>
      )}

      <div className="entry-bottom">
        <img className="raccoon-peek raccoon-left" src={raccoonPeek} alt="" />
        {/* Motivation side and at least one motivation option are required (V-23). */}
        <button
          type="button"
          className="btn-primary"
          disabled={!motivation || motivationOptions.length === 0}
          onClick={save}
        >
          Сохранить запись
        </button>
      </div>
    </main>
  );
}
