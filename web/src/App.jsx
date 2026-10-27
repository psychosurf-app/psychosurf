import { useCallback, useState } from 'react';
import Welcome from './screens/Welcome.jsx';
import HowItWorks from './screens/HowItWorks.jsx';
import SportChoice from './screens/SportChoice.jsx';
import TopBar from './components/TopBar.jsx';

// Simple screen switcher. A real router comes when there are more screens.
// Data lives only in memory for now; saving to the server comes later.
export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [sports, setSports] = useState([]);

  const goWelcome = useCallback(() => setScreen('welcome'), []);
  const goSports = useCallback(() => setScreen('sports'), []);

  if (screen === 'welcome') {
    return <Welcome onStart={goSports} onHowItWorks={() => setScreen('how')} />;
  }

  if (screen === 'how') {
    return <HowItWorks onBack={goWelcome} onStart={goSports} />;
  }

  if (screen === 'sports') {
    return (
      <SportChoice
        selected={sports}
        onChange={setSports}
        onBack={goWelcome}
        onNext={() => setScreen('next')}
      />
    );
  }

  // Placeholder until the profile screen (G-9, idea I-26) is built.
  return (
    <main className="screen">
      <TopBar onBack={goSports} />
      <h1>Профиль</h1>
      <p className="hint">Этот экран появится следующим шагом. Выбрано:</p>
      <ul>
        {sports.map((s) => (
          <li key={s.key} style={{ color: s.color, fontWeight: 700 }}>{s.name}</li>
        ))}
      </ul>
    </main>
  );
}
