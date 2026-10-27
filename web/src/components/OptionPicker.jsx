import { useState } from 'react';

// Chips for one group of options. `selected` is a list of option codes.
export function OptionChips({ options, selected, onToggle }) {
  return (
    <div className="chips chips-small">
      {options.map((o) => {
        const on = selected.includes(o.code);
        return (
          <button
            key={o.code}
            type="button"
            className={`chip ${on ? 'chip-on' : ''}`}
            aria-pressed={on}
            onClick={() => onToggle(o.code)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// "Было и другое?" — collapsed group of options of the opposite sign (mockups G-10, G-12).
// Opens by itself if something in it is already chosen.
export function OtherOptions({ title, options, selected, onToggle }) {
  const hasChosen = options.some((o) => selected.includes(o.code));
  const [open, setOpen] = useState(hasChosen);

  if (!open) {
    return (
      <button type="button" className="text-action" onClick={() => setOpen(true)}>
        <span aria-hidden="true">⌄</span> Было и другое?
      </button>
    );
  }

  return (
    <section className="option-group">
      <div className="group-head">
        <h3 className="group-title">{title}</h3>
        <button type="button" className="collapse-btn" onClick={() => setOpen(false)}>
          Свернуть <span aria-hidden="true">⌃</span>
        </button>
      </div>
      <OptionChips options={options} selected={selected} onToggle={onToggle} />
    </section>
  );
}

const NOTE_LIMIT = 300;

// "Своими словами" note field (mockup G-14). Hidden behind a link until opened.
export function NoteField({ value, onChange }) {
  const [open, setOpen] = useState(Boolean(value));

  if (!open) {
    return (
      <button type="button" className="text-action" onClick={() => setOpen(true)}>
        <span aria-hidden="true">+</span> Добавить своими словами
      </button>
    );
  }

  return (
    <div className="note">
      <div className="note-head">
        <span>Своими словами</span>
        <span className="note-count">
          {value.length} / {NOTE_LIMIT}
        </span>
      </div>
      <textarea
        autoFocus
        rows={4}
        maxLength={NOTE_LIMIT}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="note-private">🔒 Заметку видишь только ты</p>
    </div>
  );
}
