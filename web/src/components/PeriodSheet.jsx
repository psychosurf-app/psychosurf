import { useState } from 'react';
import { todayIso } from '../lib/format.js';

// "Свой период": pick start and end dates (question V-15). Uses the phone's own date picker.
export default function PeriodSheet({ from, to, onDone, onClose }) {
  const today = todayIso();
  const [start, setStart] = useState(from);
  const [end, setEnd] = useState(to);
  const valid = start && end && start <= end;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <span className="sheet-handle" />
        <h2 className="sheet-title">Свой период</h2>
        <p className="sheet-text">Выбери, с какого и по какое число смотреть тренировки.</p>

        <div className="period-fields">
          <label>
            С
            <input type="date" value={start} max={today} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label>
            По
            <input type="date" value={end} max={today} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>
        {!valid && start && end && <p className="period-error">Начало должно быть раньше конца.</p>}

        <button type="button" className="btn-primary" disabled={!valid} onClick={() => onDone(start, end)}>
          Показать
        </button>
      </div>
    </div>
  );
}
