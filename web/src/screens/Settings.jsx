import { useState } from 'react';
import TopBar from '../components/TopBar.jsx';
import { DEFAULT_NAME, NAME_LIMIT, cleanName } from '../lib/name.js';

// Settings: the name to greet by (V-18, I-26) and "О приложении" (V-8).
export default function Settings({ displayName, onSaveName, onAbout, onBack }) {
  const [value, setValue] = useState(displayName ?? '');
  const changed = cleanName(value) !== (displayName ?? '');

  return (
    <main className="screen settings">
      <TopBar onBack={onBack} />
      <h1 className="page-title">Настройки</h1>

      <section className="chart-card">
        <label className="settings-label" htmlFor="display-name">
          Как тебя называть
        </label>
        <input
          id="display-name"
          className="settings-input"
          type="text"
          value={value}
          maxLength={NAME_LIMIT}
          placeholder={DEFAULT_NAME}
          autoComplete="given-name"
          enterKeyHint="done"
          onChange={(e) => setValue(e.target.value)}
        />
        <p className="settings-hint">Можно не заполнять: тогда будем звать тебя {DEFAULT_NAME}ом.</p>
        <button
          type="button"
          className="btn-primary"
          disabled={!changed}
          onClick={() => onSaveName(cleanName(value))}
        >
          Сохранить
        </button>
      </section>

      <button type="button" className="article-card settings-row" onClick={onAbout}>
        <span className="article-card-title">О приложении</span>
        <span className="row-arrow" aria-hidden="true">
          ›
        </span>
      </button>
    </main>
  );
}
