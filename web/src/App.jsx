import { useCallback, useState } from 'react';
import Welcome from './screens/Welcome.jsx';
import HowItWorks from './screens/HowItWorks.jsx';
import SportChoice from './screens/SportChoice.jsx';
import Profile from './screens/Profile.jsx';
import EntryFlow from './screens/EntryFlow.jsx';
import TopBar from './components/TopBar.jsx';
import { isDemo, DEMO_DIARIES, DEMO_ENTRIES } from './lib/demo.js';

// Simple screen switcher. A real router comes when there are more screens.
// Data lives only in memory for now; saving to the server comes later.
export default function App() {
  const [screen, setScreen] = useState(isDemo ? 'profile' : 'welcome');
  const [diaries, setDiaries] = useState(isDemo ? DEMO_DIARIES : []);
  const [entries, setEntries] = useState(isDemo ? DEMO_ENTRIES : []);
  const [currentDiary, setCurrentDiary] = useState(null);
  // Where "back" and "next" lead from the sport choice: onboarding or the profile.
  const [sportsFrom, setSportsFrom] = useState('welcome');
  const [placeholder, setPlaceholder] = useState('');

  const goWelcome = useCallback(() => setScreen('welcome'), []);
  const goProfile = useCallback(() => setScreen('profile'), []);
  const goSports = useCallback(() => {
    setSportsFrom('welcome');
    setScreen('sports');
  }, []);
  const goSportsBack = useCallback(() => setScreen(sportsFrom), [sportsFrom]);

  const showPlaceholder = (title) => {
    setPlaceholder(title);
    setScreen('placeholder');
  };

  if (screen === 'welcome') {
    return <Welcome onStart={goSports} onHowItWorks={() => setScreen('how')} />;
  }

  if (screen === 'how') {
    return <HowItWorks onBack={goWelcome} onStart={goSports} />;
  }

  if (screen === 'sports') {
    return (
      <SportChoice
        selected={diaries}
        onChange={setDiaries}
        onBack={goSportsBack}
        onNext={goProfile}
      />
    );
  }

  if (screen === 'profile') {
    return (
      <Profile
        diaries={diaries}
        entries={entries}
        onAddEntry={(d) => {
          setCurrentDiary(d);
          setScreen('entry');
        }}
        onOpenDiary={(d) => showPlaceholder(`Дневник: ${d.name}`)}
        onAddSport={() => {
          setSportsFrom('profile');
          setScreen('sports');
        }}
        onCompare={() => showPlaceholder('Сравнение видов спорта')}
        onSettings={() => showPlaceholder('Настройки')}
      />
    );
  }

  if (screen === 'entry') {
    return (
      <EntryFlow
        diary={currentDiary}
        diaryEntries={entries.filter((e) => e.diaryKey === currentDiary.key)}
        onCancel={goProfile}
        onNothing={() => showPlaceholder('Точно ничего?')}
        onSave={(entry) => {
          setEntries((list) => [...list, entry]);
          setScreen('profile');
        }}
      />
    );
  }

  // Placeholder for screens that are not built yet.
  return (
    <main className="screen">
      <TopBar onBack={goProfile} />
      <h1>{placeholder}</h1>
      <p className="hint">Этот экран появится следующими шагами.</p>
    </main>
  );
}
