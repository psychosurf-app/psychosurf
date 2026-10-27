import { useState } from 'react';
import raccoonPeek from '../assets/raccoon-peek.png';
import WaveChart from '../components/WaveChart.jsx';
import PeriodChips from '../components/PeriodChips.jsx';
import { useTelegramBackButton } from '../telegram.js';
import { emotionPoint, motivationPoint, sortEntries } from '../lib/points.js';
import { daysBetween, describePeriod, inRange, shortDate } from '../lib/period.js';

// Sport comparison, mockup G-18 v1.
// Not yet here: "Коротко" card — its texts come from Yana's phrases (V-16).

// Below this many trainings in the period a sport is marked "мало записей".
const FEW_ENTRIES = 4;

function Bar({ label, value, total, color }) {
  return (
    <div className="cmp-bar-row">
      <span className="cmp-bar-label">{label}</span>
      <span className="cmp-bar-track">
        <span
          className="cmp-bar-fill"
          style={{ width: `${total ? (value / total) * 100 : 0}%`, background: color }}
        />
      </span>
      <span className="cmp-bar-value">
        {value} из {total}
      </span>
    </div>
  );
}

export default function Compare({ diaries, entries, onBack }) {
  const telegramHandlesBack = useTelegramBackButton(onBack);
  const [period, setPeriod] = useState({ type: 'month' });
  const [mode, setMode] = useState('emotions');

  const range = describePeriod(period);
  const span = Math.max(1, daysBetween(range.from, range.to));

  const rows = diaries.map((diary) => {
    const list = sortEntries(inRange(entries.filter((e) => e.diaryKey === diary.key), range));
    // Place points by calendar date; trainings on the same day get a small shift (R-26).
    const perDay = {};
    const xs = list.map((e) => {
      perDay[e.trainingDate] = (perDay[e.trainingDate] ?? 0) + 1;
      return Math.min(1, (daysBetween(range.from, e.trainingDate) + (perDay[e.trainingDate] - 1) * 0.25) / span);
    });
    return {
      diary,
      list,
      xs,
      emotionsPlus: list.filter((e) => e.tone === 'good').length,
      pullsForward: list.filter((e) => e.motivation === 'forward').length,
    };
  });

  const series = rows
    .filter((r) => r.list.length > 0)
    .map((r) => ({
      name: r.diary.name,
      color: r.diary.color,
      xs: r.xs,
      values: r.list.map(mode === 'emotions' ? emotionPoint : motivationPoint),
    }));

  const midIso = new Date((Date.parse(range.from) + Date.parse(range.to)) / 2).toISOString().slice(0, 10);

  return (
    <main className="screen compare">
      <div className="top-bar">
        {!telegramHandlesBack ? (
          <button type="button" className="back-btn" onClick={onBack} aria-label="Назад">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <span />
        )}
      </div>

      <h1 className="page-title">Сравнение</h1>
      <p className="page-text cmp-sub">Какой спорт заряжает, а какой забирает силы</p>

      <PeriodChips period={period} onChange={setPeriod} />

      <section className="chart-card">
        <h2 className="cmp-card-title">{range.title} · сколько тренировок в плюс</h2>
        {rows.map((r) => (
          <div key={r.diary.key} className="cmp-sport">
            <div className="cmp-sport-head">
              <span className="dot dot-big" style={{ background: r.diary.color }} />
              <strong>{r.diary.name}</strong>
              {r.list.length > 0 && r.list.length < FEW_ENTRIES && <span className="cmp-few">мало записей</span>}
            </div>
            {r.list.length === 0 ? (
              <p className="chart-empty">За этот период тренировок нет.</p>
            ) : (
              <>
                <Bar label="Эмоции в плюс" value={r.emotionsPlus} total={r.list.length} color={r.diary.color} />
                <Bar label="Тянет вперёд" value={r.pullsForward} total={r.list.length} color={r.diary.color} />
              </>
            )}
          </div>
        ))}
      </section>

      {series.length > 0 && (
        <section className="chart-card">
          <h2>Линии {range.phrase}</h2>
          <div className="segmented segmented-sm">
            {[
              ['emotions', 'Эмоции'],
              ['motivation', 'Мотивация'],
            ].map(([value, label]) => (
              <button key={value} type="button" className={mode === value ? 'on' : ''} onClick={() => setMode(value)}>
                {label}
              </button>
            ))}
          </div>
          <p className="axis-plus">↑ хорошо</p>
          <WaveChart series={series} />
          <p className="axis-minus">↓ непросто</p>
          <div className="x-labels">
            <span style={{ left: '0%', transform: 'none' }}>{shortDate(range.from)}</span>
            <span style={{ left: '50%' }}>{shortDate(midIso)}</span>
            <span style={{ left: 'auto', right: 0, transform: 'none' }}>{shortDate(range.to)}</span>
          </div>
          <div className="chart-legend cmp-legend">
            {series.map((s) => (
              <span key={s.name}>
                <span className="legend-line" style={{ background: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <img className="raccoon-peek cmp-raccoon" src={raccoonPeek} alt="" />
    </main>
  );
}
