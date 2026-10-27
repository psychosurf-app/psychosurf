import { useCallback, useState } from 'react';
import Welcome from './screens/Welcome.jsx';
import HowItWorks from './screens/HowItWorks.jsx';
import TopBar from './components/TopBar.jsx';

// Simple screen switcher. A real router comes when there are more screens.
export default function App() {
  const [screen, setScreen] = useState('welcome');
  const goWelcome = useCallback(() => setScreen('welcome'), []);
  const goStart = useCallback(() => setScreen('start'), []);

  if (screen === 'welcome') {
    return <Welcome onStart={goStart} onHowItWorks={() => setScreen('how')} />;
  }

  if (screen === 'how') {
    return <HowItWorks onBack={goWelcome} onStart={goStart} />;
  }

  // Placeholder until the sport choice screen (G-?, idea I-25) is built.
  return (
    <main className="screen">
      <TopBar onBack={goWelcome} />
      <h1>Выбор спорта</h1>
      <p className="hint">Этот экран появится следующим шагом.</p>
    </main>
  );
}
