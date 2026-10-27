import { useState } from 'react';
import raccoonPeek from '../assets/raccoon-peek.png';
import StepHeader from '../components/StepHeader.jsx';
import { OptionChips, OtherOptions, NoteField } from '../components/OptionPicker.jsx';
import { DateChip, DateSheet } from '../components/DatePicker.jsx';
import { optionsOfKind } from '../data/options.js';
import { todayIso } from '../lib/format.js';

// Training entry in 3 steps (decision R-27, mockups G-5, G-6, G-7, G-10 to G-12, G-14).
// Date choice on step 1 (I-29, G-17). Not yet here: "nothing" flow (G-13), waits for V-21.

const EMOTION_GROUPS = {
  good: { main: 'E+', other: 'E-', mainTitle: 'Приятное', otherTitle: 'Непростое' },
  hard: { main: 'E-', other: 'E+', mainTitle: 'Непростое', otherTitle: 'Приятное' },
};

const MOTIVATION_GROUPS = {
  forward: { main: 'M+', other: 'M-', otherTitle: 'Не тянет' },
  not_forward: { main: 'M-', other: 'M+', otherTitle: 'Тянет вперёд' },
};

const toggleIn = (list, code) =>
  list.includes(code) ? list.filter((c) => c !== code) : [...list, code];

export default function EntryFlow({ diary, diaryEntries, onCancel, onNothing, onSave }) {
  const [step, setStep] = useState(1);
  const [trainingDate, setTrainingDate] = useState(todayIso());
  const [dateOpen, setDateOpen] = useState(false);
  const [tone, setTone] = useState(null);
  const [emotions, setEmotions] = useState([]);
  const [emotionNote, setEmotionNote] = useState('');
  const [motivation, setMotivation] = useState(null);
  const [motivationOptions, setMotivationOptions] = useState([]);
  const [motivationNote, setMotivationNote] = useState('');

  function pickTone(value) {
    setTone(value);
    setStep(2);
  }

  function save() {
    onSave({
      id: crypto.randomUUID(),
      diaryKey: diary.key,
      trainingDate,
      createdAt: Date.now(),
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
          <button type="button" className="btn-link" onClick={onNothing}>
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
          <button type="button" className="btn-primary" onClick={() => setStep(3)}>
            {count > 0 ? `Дальше · выбрано ${count}` : 'Дальше'}
          </button>
        </div>
      </main>
    );
  }

  // Step 3 — motivation, required choice (G-7, G-12).
  const m = motivation ? MOTIVATION_GROUPS[motivation] : null;
  return (
    <main className="screen entry">
      <StepHeader sportName={diary.name} step={3} onBack={() => setStep(2)} />
      <h1 className="page-title">А что с мотивацией?</h1>
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
        <button type="button" className="btn-primary" disabled={!motivation} onClick={save}>
          Сохранить запись
        </button>
      </div>
    </main>
  );
}
