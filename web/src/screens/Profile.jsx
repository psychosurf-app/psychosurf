import raccoonPeek from '../assets/raccoon-peek.png';
import Sparkline from '../components/Sparkline.jsx';
import { countText, daysAgoText } from '../lib/format.js';
import { emotionPoint, sortEntries } from '../lib/points.js';

const TRAININGS = ['тренировка', 'тренировки', 'тренировок'];

// Profile / home screen with the list of diaries, mockup G-9 v2 (idea I-26).
export default function Profile({
  name,
  diaries,
  entries,
  onAddEntry,
  onOpenDiary,
  onAddSport,
  onCompare,
  onSettings,
}) {
  const total = entries.length;

  return (
    <main className="screen profile">
      <header className="profile-head">
        <div className="avatar">
          <img src={raccoonPeek} alt="" />
        </div>
        <div className="profile-hello">
          <h1>Салют, {name || 'психосёрфик'}!</h1>
          <p>
            {countText(diaries.length, ['вид спорта', 'вида спорта', 'видов спорта'])} ·{' '}
            {countText(total, TRAININGS)}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={onSettings} aria-label="Настройки">
          <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
            <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 2.8l1.6 2.3 2.7-.6.8 2.7 2.6 1-.6 2.7 1.9 2.1-1.9 2.1.6 2.7-2.6 1-.8 2.7-2.7-.6L12 21.2l-1.6-2.3-2.7.6-.8-2.7-2.6-1 .6-2.7L3 12l1.9-2.1-.6-2.7 2.6-1 .8-2.7 2.7.6z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <h2 className="section-title">Твои дневники</h2>
      <p className="section-hint">Нажми&nbsp;+, чтобы записать тренировку</p>

      <div className="diary-list">
        {diaries.map((diary) => {
          const own = sortEntries(entries.filter((e) => e.diaryKey === diary.key));
          const last = own[own.length - 1];
          const meta = last
            ? `${countText(own.length, TRAININGS)} · ${daysAgoText(last.trainingDate)}`
            : 'Ещё нет записей';
          return (
            <div key={diary.key} className="diary-card">
              <button type="button" className="diary-open" onClick={() => onOpenDiary(diary)}>
                <span className="diary-bar" style={{ background: diary.color }} />
                <span className="diary-text">
                  <span className="diary-name">{diary.name}</span>
                  <span className="diary-meta">{meta}</span>
                </span>
                <Sparkline values={own.slice(-6).map(emotionPoint)} color={diary.color} />
              </button>
              <button
                type="button"
                className="diary-add"
                style={{ background: diary.color }}
                onClick={() => onAddEntry(diary)}
                aria-label={`Записать тренировку: ${diary.name}`}
              >
                +
              </button>
            </div>
          );
        })}
      </div>

      <button type="button" className="add-sport" onClick={onAddSport}>
        + Добавить спорт
      </button>

      <div className="compare-wrap">
        <img className="raccoon-peek" src={raccoonPeek} alt="" />
        <button type="button" className="compare-card" onClick={onCompare}>
          <svg viewBox="0 0 56 28" width="56" height="28" aria-hidden="true">
            <path d="M2 14c9-14 17 14 26 0s17-14 26 0" fill="none" stroke="#9c8cf0" strokeWidth="3" strokeLinecap="round" />
            <path d="M2 18c9-14 17 10 26-2s17-8 26 2" fill="none" stroke="#3cc4b4" strokeWidth="3" strokeLinecap="round" />
            <path d="M2 10c9 14 17-10 26 2s17 10 26-2" fill="none" stroke="#f08a5d" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="compare-text">
            <span className="compare-title">Сравнить виды спорта</span>
            <span className="compare-sub">Какой заряжает, а какой забирает силы</span>
          </span>
          <span className="compare-arrow" aria-hidden="true">›</span>
        </button>
      </div>
    </main>
  );
}
