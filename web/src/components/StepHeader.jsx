import { useTelegramBackButton } from '../telegram.js';

// Header of the entry flow: back arrow, "Sport · step N of 3" and progress bars (mockups G-5 to G-7).
export default function StepHeader({ sportName, step, total = 3, onBack }) {
  const telegramHandlesBack = useTelegramBackButton(onBack);

  return (
    <div className="step-header">
      <div className="step-header-row">
        {!telegramHandlesBack ? (
          <button type="button" className="back-btn" onClick={onBack} aria-label="Назад">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <span />
        )}
        <span className="step-label">
          {sportName} · шаг {step} из {total}
        </span>
      </div>
      <div className="step-bars">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < step ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}
