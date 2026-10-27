import raccoonPeek from '../assets/raccoon-peek.png';
import BagIcon from '../components/BagIcon.jsx';
import { useTelegramBackButton } from '../telegram.js';
import { OPTION_BY_CODE } from '../data/options.js';
import { BAGS, bagOf } from '../lib/bags.js';

// One training, mockup G-15 v2 (idea I-27).

const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

// '27 октября, вторник'
function fullDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_GEN[m - 1]}, ${WEEKDAYS[new Date(y, m - 1, d).getDay()]}`;
}

const DOT_COLORS = { 'E+': 'var(--teal)', 'E-': '#c2481c', 'M+': 'var(--teal)', 'M-': '#c2481c' };

function ChosenChips({ codes }) {
  return (
    <div className="chips chips-small">
      {codes.map((code) => {
        const o = OPTION_BY_CODE[code];
        if (!o) return null;
        return (
          <span key={code} className="chip chip-static">
            <span className="dot" style={{ background: DOT_COLORS[o.kind] }} />
            {o.label}
          </span>
        );
      })}
    </div>
  );
}

export default function Training({ diary, entry, onBack, onEdit, onAdvice }) {
  const telegramHandlesBack = useTelegramBackButton(onBack);
  const bagKey = bagOf(entry);
  const bag = bagKey ? BAGS[bagKey] : null;
  const good = entry.tone === 'good';
  const forward = entry.motivation === 'forward';

  return (
    <main className="screen training">
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
        <button type="button" className="icon-btn icon-btn-flat" onClick={onEdit} aria-label="Изменить запись">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <p className="training-sport">{diary.name}</p>
      <h1 className="training-date">{fullDate(entry.trainingDate)}</h1>

      {bag && (
        <div className="bag-card">
          <BagIcon color={bag.color} />
          <div>
            <p className="bag-caption">Улетела в мешочек</p>
            <p className="bag-name">{bag.name}</p>
          </div>
        </div>
      )}

      <div className="training-section-head">
        <h2>Эмоции</h2>
        <span style={{ color: good ? 'var(--teal)' : '#c2481c' }}>
          {good ? '⌃ Скорее хорошо' : '⌄ Скорее непросто'}
        </span>
      </div>
      {entry.emotions.length > 0 && <ChosenChips codes={entry.emotions} />}
      {entry.emotionNote && <p className="training-note">«{entry.emotionNote}»</p>}

      <div className="training-section-head">
        <h2>Мотивация</h2>
        <span style={{ color: forward ? 'var(--teal)' : '#c2481c' }}>
          {forward ? '→ Тянет вперёд' : '↓ Не тянет'}
        </span>
      </div>
      {entry.motivationOptions.length > 0 && <ChosenChips codes={entry.motivationOptions} />}
      {entry.motivationNote && <p className="training-note">«{entry.motivationNote}»</p>}

      <div className="training-bottom">
        <img className="raccoon-peek" src={raccoonPeek} alt="" />
        <button type="button" className="advice-card" onClick={onAdvice}>
          <span className="advice-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="advice-text">
            <span className="advice-title">Совет психолога</span>
            <span className="advice-sub">По твоим эмоциям и мотивации на этой тренировке</span>
          </span>
          <span aria-label="Платная функция">🔒</span>
        </button>
      </div>
    </main>
  );
}
