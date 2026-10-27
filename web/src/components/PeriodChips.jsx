import { useState } from 'react';
import PeriodSheet from './PeriodSheet.jsx';
import { shiftIso } from '../lib/period.js';
import { todayIso } from '../lib/format.js';

// "Неделя / Месяц / Свой период" chips with the custom period sheet.
export default function PeriodChips({ period, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="chips">
        {[
          ['week', 'Неделя'],
          ['month', 'Месяц'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`chip chip-sm ${period.type === value ? 'chip-on' : ''}`}
            onClick={() => onChange({ type: value })}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={`chip chip-sm ${period.type === 'custom' ? 'chip-on' : ''}`}
          onClick={() => setOpen(true)}
        >
          Свой период
        </button>
      </div>

      {open && (
        <PeriodSheet
          from={period.from ?? shiftIso(todayIso(), -13)}
          to={period.to ?? todayIso()}
          onClose={() => setOpen(false)}
          onDone={(from, to) => {
            onChange({ type: 'custom', from, to });
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
