import { useState } from 'react';
import WaveChart from '../components/WaveChart.jsx';
import CatchView from '../components/CatchView.jsx';
import PeriodChips from '../components/PeriodChips.jsx';
import { useTelegramBackButton } from '../telegram.js';
import { OPTION_BY_CODE } from '../data/options.js';
import { BAGS, bagOf } from '../lib/bags.js';
import { countText } from '../lib/format.js';
import { describePeriod, inRange, shortDate } from '../lib/period.js';
import { emotionPoint, motivationPoint, sortEntries } from '../lib/points.js';

// Diary of one sport with charts, mockup G-16 v1 (ideas I-14, I-17, I-27).
// Tabs "Графики" and "Улов" (G-4) share one period: week, month or custom (V-15).
// Not yet here: analysis card (waits for Yana's phrases, V-16).

const TRAININGS = ['тренировка', 'тренировки', 'тренировок'];
const LIST_PREVIEW = 5;

const CHART_MODES = [
  ['emotions', 'Эмоции'],
  ['motivation', 'Мотивация'],
  ['both', 'Вместе'],
];

export default function Diary({ diary, entries, onBack, onAddEntry, onOpenEntry }) {
  const telegramHandlesBack = useTelegramBackButton(onBack);
  const [tab, setTab] = useState('charts');
  const [period, setPeriod] = useState({ type: 'month' });
  const [mode, setMode] = useState('both');
  const [showAll, setShowAll] = useState(false);

  const sorted = sortEntries(entries);
  const range = describePeriod(period);
  const { title, phrase } = range;
  const list = inRange(sorted, range);
  // "Nothing" entries sit at 0 on the emotion chart (R-25).
  const series = [];
  if (mode !== 'motivation')
    series.push({ name: 'Эмоции', color: 'var(--teal)', values: list.map(emotionPoint) });
  if (mode !== 'emotions')
    series.push({ name: 'Мотивация', color: 'var(--orange)', values: list.map(motivationPoint) });

  // X axis: first, last and up to two dates in between.
  const labelIdx =
    list.length <= 4
      ? list.map((_, i) => i)
      : [
          0,
          Math.round((list.length - 1) / 3),
          Math.round(((list.length - 1) * 2) / 3),
          list.length - 1,
        ];

  const newestFirst = [...sorted].reverse();
  const shown = showAll ? newestFirst : newestFirst.slice(0, LIST_PREVIEW);

  return (
    <main className="screen diary">
      <div className="top-bar">
        {!telegramHandlesBack ? (
          <button type="button" className="back-btn" onClick={onBack} aria-label="Назад">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path
                d="M15 4 7 12l8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="diary-add"
          style={{ background: diary.color }}
          onClick={onAddEntry}
          aria-label="Записать тренировку"
        >
          +
        </button>
      </div>

      <h1 className="diary-title">
        <span className="dot dot-big" style={{ background: diary.color }} />
        {diary.name}
      </h1>

      <div className="segmented">
        {[
          ['charts', 'Графики'],
          ['catch', 'Улов'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={tab === value ? 'on' : ''}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'catch' && (
        <>
          <h2 className="catch-title">Твой улов</h2>
          <p className="page-text catch-sub">Смотри, что наловил {phrase}</p>
        </>
      )}

      <PeriodChips period={period} onChange={setPeriod} />

      {tab === 'catch' && <CatchView entries={list} />}

      {tab === 'charts' && (
        <>
          <section className="chart-card">
            <h2>
              {title} · {countText(list.length, TRAININGS)}
            </h2>

            {list.length === 0 ? (
              <p className="chart-empty">
                За этот период записей нет. Нажми&nbsp;+, чтобы добавить тренировку.
              </p>
            ) : (
              <>
                <div className="segmented segmented-sm">
                  {CHART_MODES.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={mode === value ? 'on' : ''}
                      onClick={() => setMode(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <p className="axis-plus">↑ в плюс</p>
                <WaveChart series={series} />
                <p className="axis-minus">↓ в минус</p>

                <div className="x-labels">
                  {labelIdx.map((i) => (
                    <span
                      key={i}
                      style={{ left: `${list.length === 1 ? 50 : (i / (list.length - 1)) * 100}%` }}
                    >
                      {shortDate(list[i].trainingDate)}
                    </span>
                  ))}
                </div>
                <p className="x-caption">даты тренировок</p>

                <div className="chart-legend">
                  {series.map((s) => (
                    <span key={s.name}>
                      <span className="legend-line" style={{ background: s.color }} />
                      {s.name}
                    </span>
                  ))}
                </div>
                <p className="chart-note">
                  Точка на краю — чувства были цельными. Ближе к середине — к ним примешалось «и
                  другое».
                </p>
              </>
            )}
          </section>

          <div className="list-head">
            <h2 className="section-title">Тренировки</h2>
            {sorted.length > LIST_PREVIEW && (
              <button type="button" className="link-sm" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Свернуть' : `Все ${sorted.length}`}
              </button>
            )}
          </div>

          <div className="training-list">
            {shown.map((e) => {
              const bagKey = bagOf(e);
              const bag = bagKey ? BAGS[bagKey] : null;
              const labels = e.emotions
                .map((c) => OPTION_BY_CODE[c]?.label)
                .filter(Boolean)
                .join(', ');
              return (
                <button
                  key={e.id}
                  type="button"
                  className="training-row"
                  onClick={() => onOpenEntry(e)}
                >
                  <span className="dot" style={{ background: bag?.color ?? 'var(--hint)' }} />
                  <span className="row-date">{shortDate(e.trainingDate)}</span>
                  <span className="row-text">
                    <span className="row-bag">{bag?.name ?? 'Ничего не чувствую'}</span>
                    {labels && <span className="row-emotions">{labels}</span>}
                  </span>
                  <span className="row-arrow" aria-hidden="true">
                    ›
                  </span>
                </button>
              );
            })}
            {sorted.length === 0 && <p className="hint">Пока ни одной тренировки.</p>}
          </div>
        </>
      )}
    </main>
  );
}
