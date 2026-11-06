import logo from '../assets/logo.png';
import raccoonPeek from '../assets/raccoon-peek.png';
import WaveDecor from '../components/WaveDecor.jsx';

// Welcome screen, mockup G-2 v2 (idea I-10).
export default function Welcome({ onStart, onHowItWorks }) {
  return (
    <main className="screen welcome">
      <img className="welcome-logo" src={logo} alt="Психосёрф" />

      <WaveDecor />

      <ul className="legend">
        <li><span className="dot" style={{ background: 'var(--teal)' }} />Сёрфинг</li>
        <li><span className="dot" style={{ background: 'var(--orange)' }} />Бег</li>
        <li><span className="dot" style={{ background: 'var(--purple)' }} />Йога</li>
        <li className="legend-any">+ любой твой спорт</li>
      </ul>

      <h1 className="welcome-title">
        Твоя <span className="accent">волна</span> эмоций<br />и мотивации
      </h1>
      <p className="welcome-subtitle">Дневник в графиках для тех, кто живёт в движении</p>

      <div className="welcome-actions">
        <img className="raccoon-peek" src={raccoonPeek} alt="" />
        <button type="button" className="btn-primary" onClick={onStart}>
          Начать дневник
        </button>
        <button type="button" className="btn-link" onClick={onHowItWorks}>
          Как это работает
        </button>
        {/* One-line disclaimer, text by Yana (V-34, 2026-11-03). */}
        <p className="welcome-disclaimer">
          Психосёрф не ставит диагнозов и не заменяет консультацию специалиста.
        </p>
      </div>
    </main>
  );
}
