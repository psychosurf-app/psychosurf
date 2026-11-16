import { useState } from 'react';

// "Приём дня" card on the main screen and the sheet it opens (G-30 v2, G-31 v2, R-40).
// `daily`: result of dailyCard() — { locked } or { card, opened }.

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#f2c94c" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="#f2c94c" strokeWidth="2.2" />
    </svg>
  );
}

function DailySheet({ card, onClose }) {
  const quote = card.kind === 'quote';
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet daily-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <span className="sheet-handle" />
        <span className="daily-pill">{quote ? 'Сегодня цитата' : 'Приём дня'}</span>
        {quote ? (
          <>
            <p className="daily-quote-mark" aria-hidden="true">“</p>
            <p className="daily-quote">{card.text}</p>
            <p className="daily-author">{card.author}</p>
            {card.role && <p className="daily-role">{card.role}</p>}
          </>
        ) : (
          <>
            <h2 className="sheet-title">{card.title}</h2>
            {card.text.split(/\n\s*\n/).map((p) => (
              <p key={p} className="daily-text">{p}</p>
            ))}
          </>
        )}
        <button type="button" className="btn-primary" onClick={onClose}>
          {quote ? 'Вдохновляет! Беру с собой' : 'Попробую!'}
        </button>
        <p className="daily-next">{quote ? 'Завтра — новый приём' : 'Новый приём — завтра'}</p>
      </div>
    </div>
  );
}

export default function DailyCard({ daily, onOpen }) {
  const [open, setOpen] = useState(false);

  // Still loading from the server (or it can't be reached): no card for now.
  if (!daily) return null;

  if (daily.locked) {
    return (
      <div className="daily-card daily-locked">
        <span className="daily-head">
          <span className="daily-name">Приём дня</span>
          <LockIcon />
        </span>
        <span className="daily-hint">Каждый день — новый приём от спортивного психолога</span>
        <span className="daily-badge">Откроется с подпиской</span>
      </div>
    );
  }

  const { card, opened } = daily;
  const quote = card.kind === 'quote';
  return (
    <>
      <button
        type="button"
        className="daily-card"
        onClick={() => {
          setOpen(true);
          onOpen();
        }}
      >
        <span className="daily-head">
          <span className="daily-name">{quote ? 'Сегодня цитата' : 'Приём дня'}</span>
          {!opened && <span className="daily-dot" aria-label="Ещё не открыт" />}
        </span>
        <span className="daily-sub">{card.title}</span>
      </button>
      {open && <DailySheet card={card} onClose={() => setOpen(false)} />}
    </>
  );
}
