import { useState } from 'react';
import Welcome from './screens/Welcome.jsx';

// Simple screen switcher. A real router comes when there are more screens.
export default function App() {
  const [screen, setScreen] = useState('welcome');

  if (screen === 'welcome') {
    return (
      <Welcome
        onStart={() => setScreen('start')}
        onHowItWorks={() => setScreen('how')}
      />
    );
  }

  // Placeholders until the next screens are built.
  const titles = { start: 'Выбор спорта', how: 'Как это работает' };
  return (
    <main className="screen">
      <h1>{titles[screen]}</h1>
      <p className="hint">Этот экран появится следующим шагом.</p>
      <button type="button" className="btn-link" onClick={() => setScreen('welcome')}>
        ← Назад
      </button>
    </main>
  );
}
