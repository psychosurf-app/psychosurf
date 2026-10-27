import { useState } from 'react';
import { todayIso } from '../lib/format.js';

// Training date choice (idea I-29, mockup G-17): a chip on step 1 that opens a bottom sheet.

const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const pad = (n) => String(n).padStart(2, '0');
const isoOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

// Shift a 'YYYY-MM-DD' date by whole days.
function shiftIso(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return isoOf(date.getFullYear(), date.getMonth(), date.getDate());
}

// 'Сегодня, 27 октября', 'Вчера, 26 октября' or '20 октября'.
export function dateLabel(iso) {
  const [, m, d] = iso.split('-').map(Number);
  const day = `${d} ${MONTHS_GEN[m - 1]}`;
  const today = todayIso();
  if (iso === today) return `Сегодня, ${day}`;
  if (iso === shiftIso(today, -1)) return `Вчера, ${day}`;
  return day;
}

export function DateChip({ value, onClick }) {
  return (
    <button type="button" className="date-chip" onClick={onClick}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {dateLabel(value)}
      <span aria-hidden="true">⌄</span>
    </button>
  );
}

// Bottom sheet with quick choices and a month calendar.
// `markedDates` — dates that already have an entry in this diary (shown with a dot).
export function DateSheet({ value, markedDates, onDone, onClose }) {
  const today = todayIso();
  const [picked, setPicked] = useState(value);
  const [ty, tm] = today.split('-').map(Number);
  const [py, pm] = value.split('-').map(Number);
  const [view, setView] = useState({ y: py, m: pm - 1 });

  const quick = [
    ['Сегодня', today],
    ['Вчера', shiftIso(today, -1)],
    ['Позавчера', shiftIso(today, -2)],
  ];

  // Monday-first grid for the viewed month.
  const firstWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const isCurrentMonth = view.y === ty && view.m === tm - 1;

  const moveMonth = (delta) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <span className="sheet-handle" />
        <h2 className="sheet-title">Когда была тренировка?</h2>
        <p className="sheet-text">
          Записываешь позже? Выбери день — и вспомни, что было сразу после тренировки.
        </p>

        <div className="chips">
          {quick.map(([label, iso]) => (
            <button
              key={label}
              type="button"
              className={`chip ${picked === iso ? 'chip-on' : ''}`}
              onClick={() => {
                setPicked(iso);
                const [y, m] = iso.split('-').map(Number);
                setView({ y, m: m - 1 });
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="cal-head">
          <button type="button" onClick={() => moveMonth(-1)} aria-label="Предыдущий месяц">‹</button>
          <span>
            {MONTHS[view.m][0].toUpperCase() + MONTHS[view.m].slice(1)} {view.y}
          </span>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            disabled={isCurrentMonth}
            aria-label="Следующий месяц"
          >
            ›
          </button>
        </div>

        <div className="cal-grid">
          {WEEKDAYS.map((w) => (
            <span key={w} className="cal-weekday">{w}</span>
          ))}
          {cells.map((day, i) => {
            if (!day) return <span key={`e${i}`} />;
            const iso = isoOf(view.y, view.m, day);
            const future = iso > today;
            return (
              <button
                key={iso}
                type="button"
                className={`cal-day ${iso === picked ? 'on' : ''}`}
                disabled={future}
                onClick={() => setPicked(iso)}
              >
                {day}
                {markedDates.has(iso) && <span className="cal-dot" />}
              </button>
            );
          })}
        </div>
        <p className="cal-legend">
          <span className="cal-dot" /> уже есть запись
        </p>

        <button type="button" className="btn-primary" onClick={() => onDone(picked)}>
          Готово
        </button>
      </div>
    </div>
  );
}
