import { useState } from 'react';
import raccoonPeek from '../assets/raccoon-peek.png';
import TopBar from '../components/TopBar.jsx';
import { SPORTS, DIARY_COLORS } from '../data/sports.js';

// Sport choice screen, mockup G-8 v3 (idea I-25).
// `selected` is a list of { key, code, name, color }. Custom sports have code null.
export default function SportChoice({ selected, onChange, onBack, onNext }) {
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [customName, setCustomName] = useState('');

  const customSports = selected.filter((s) => s.code === null);
  const options = [
    ...SPORTS.map((s) => ({ key: s.code, code: s.code, name: s.name })),
    ...customSports.map(({ key, code, name }) => ({ key, code, name })),
  ];
  const q = query.trim().toLowerCase();
  const visible = q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;

  const colorFor = (key) => selected.find((s) => s.key === key)?.color;

  // Pick the first palette color not used by another selected sport.
  const nextColor = () =>
    DIARY_COLORS.find((c) => !selected.some((s) => s.color === c)) ??
    DIARY_COLORS[selected.length % DIARY_COLORS.length];

  function toggle(option) {
    if (colorFor(option.key)) {
      onChange(selected.filter((s) => s.key !== option.key));
    } else {
      onChange([...selected, { ...option, color: nextColor() }]);
    }
  }

  function addCustom(event) {
    event.preventDefault();
    const name = customName.trim();
    if (!name) return;
    const existing = options.find((o) => o.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!colorFor(existing.key)) toggle(existing);
    } else {
      onChange([...selected, { key: `custom:${name}`, code: null, name, color: nextColor() }]);
    }
    setCustomName('');
    setAdding(false);
  }

  return (
    <main className="screen sports">
      <TopBar onBack={onBack} />

      <h1 className="page-title">Где ты ловишь свою волну?</h1>
      <p className="page-text">
        Выбери всё, чем занимаешься. Для каждого спорта будет свой дневник и свой цвет
        на&nbsp;графике.
      </p>

      <label className="search">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Найти спорт"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <div className="chips">
        {visible.map((option) => {
          const color = colorFor(option.key);
          return (
            <button
              key={option.key}
              type="button"
              className={`chip ${color ? 'chip-on' : ''}`}
              onClick={() => toggle(option)}
              aria-pressed={Boolean(color)}
            >
              {color && <span className="dot" style={{ background: color }} />}
              {option.name}
            </button>
          );
        })}

        {adding ? (
          <form className="chip-add-form" onSubmit={addCustom}>
            <input
              autoFocus
              value={customName}
              maxLength={40}
              placeholder="Твой спорт"
              onChange={(e) => setCustomName(e.target.value)}
            />
            <button type="submit" disabled={!customName.trim()}>
              Добавить
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="chip chip-add"
            onClick={() => {
              setCustomName(query.trim());
              setAdding(true);
            }}
          >
            + Добавить свой
          </button>
        )}
      </div>

      <div className="sports-actions">
        <img className="raccoon-peek raccoon-left" src={raccoonPeek} alt="" />
        <button
          type="button"
          className="btn-primary"
          disabled={selected.length === 0}
          onClick={onNext}
        >
          {selected.length === 0 ? 'Выбери хотя бы один' : `Дальше · выбрано ${selected.length}`}
        </button>
      </div>
    </main>
  );
}
