import raccoonPeek from '../assets/raccoon-peek.png';
import TopBar from '../components/TopBar.jsx';

// "How it works" screen, mockup G-3 v3 (idea I-11).
const STEPS = [
  'После тренировки отмечаешь эмоцию и мотивацию. Это меньше минуты.',
  'Приложение собирает всё в\u00a0графики, отдельно для каждого твоего спорта.',
  'Через пару недель видишь, какой спорт тебя заряжает, а какой забирает силы.',
];

export default function HowItWorks({ name, onBack, onStart }) {
  return (
    <main className="screen how">
      <TopBar onBack={onBack} />

      <h1 className="how-title">
        Салют, <span className="nowrap">{name || 'психосёрфик'}! 🤙</span>
      </h1>
      <p className="how-lead">
        Знаешь, почему после одной тренировки летаешь, а после другой хочется на диван?
      </p>
      <p className="how-text">
        Мозг запоминает плохое ярче хорошего: одна неудачная тренировка легко перечёркивает
        пять классных. Поэтому полагаться только на ощущения не выйдет.
      </p>

      <section className="how-card">
        <img className="how-card-raccoon" src={raccoonPeek} alt="" />
        <h2>Как это работает</h2>
        <ol className="how-steps">
          {STEPS.map((text, i) => (
            <li key={text}>
              <span className="step-num">{i + 1}</span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="how-tip">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path
            d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>
          А если захочешь копнуть глубже, на&nbsp;каждую эмоцию можно получить совет: откуда она
          взялась и что с ней делать.
        </span>
      </p>

      <div className="how-actions">
        <p className="how-cta">Ну что, погнали? 🌊</p>
        <button type="button" className="btn-primary" onClick={onStart}>
          Погнали!
        </button>
      </div>
    </main>
  );
}
