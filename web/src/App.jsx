import { isInTelegram } from './telegram.js';

// Placeholder welcome screen. Final texts and the raccoon come from Yana's screens (I-10).
export default function App() {
  return (
    <main className="screen">
      <h1>Салют, психосёрфик!</h1>
      <p>Дневник состояния после тренировок.</p>
      <p className="hint">
        {isInTelegram ? 'Открыто в Telegram' : 'Открыто в браузере'}
      </p>
    </main>
  );
}
