import logo from '../assets/logo.png';
import { useTelegramBackButton } from '../telegram.js';

// Top row of inner screens: back arrow on the left, small logo on the right.
// Inside Telegram the native back button is used instead of our arrow.
export default function TopBar({ onBack }) {
  const telegramHandlesBack = useTelegramBackButton(onBack);

  return (
    <div className="top-bar">
      {onBack && !telegramHandlesBack ? (
        <button type="button" className="back-btn" onClick={onBack} aria-label="Назад">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <span />
      )}
      <img className="top-logo" src={logo} alt="Психосёрф" />
    </div>
  );
}
