import { useCallback, useEffect, useState } from 'react';
import Welcome from './screens/Welcome.jsx';
import HowItWorks from './screens/HowItWorks.jsx';
import SportChoice from './screens/SportChoice.jsx';
import Profile from './screens/Profile.jsx';
import EntryFlow from './screens/EntryFlow.jsx';
import Training from './screens/Training.jsx';
import Diary from './screens/Diary.jsx';
import Compare from './screens/Compare.jsx';
import TopBar from './components/TopBar.jsx';
import { loadUserData, saveDiaries, saveEntry } from './storage/index.js';

// Logs a failed save. A visible "could not save" message comes later.
const reportSaveError = (error) => console.error('Save failed', error);

// Simple screen switcher. A real router comes when there are more screens.
// Data is loaded and saved only through the storage module (R-33).
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState('welcome');
  const [diaries, setDiaries] = useState([]);
  const [entries, setEntries] = useState([]);
  const [currentDiary, setCurrentDiary] = useState(null);
  const [currentEntryId, setCurrentEntryId] = useState(null);
  const [editing, setEditing] = useState(false);
  // Screen to return to from an entry or a training: 'profile' or 'diary'.
  const [returnTo, setReturnTo] = useState('profile');
  // Where "back" and "next" lead from the sport choice: onboarding or the profile.
  const [sportsFrom, setSportsFrom] = useState('welcome');
  const [placeholder, setPlaceholder] = useState('');

  // Load saved data once at start. Someone with diaries goes straight to the profile.
  useEffect(() => {
    let cancelled = false;
    loadUserData()
      .then((data) => {
        if (cancelled) return;
        setDiaries(data.diaries);
        setEntries(data.entries);
        if (data.diaries.length > 0) setScreen('profile');
      })
      .catch((error) => console.error('Load failed', error))
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The screen updates at once; saving happens in the background.
  const updateDiaries = useCallback((list) => {
    setDiaries(list);
    saveDiaries(list).catch(reportSaveError);
  }, []);

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

  // Empty page for the moment while data loads.
  if (!loaded) return null;

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
        onChange={updateDiaries}
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
          setEditing(false);
          setReturnTo('profile');
          setScreen('entry');
        }}
        onOpenDiary={(d) => {
          setCurrentDiary(d);
          setScreen('diary');
        }}
        onAddSport={() => {
          setSportsFrom('profile');
          setScreen('sports');
        }}
        onCompare={() => setScreen('compare')}
        onSettings={() => showPlaceholder('Настройки')}
      />
    );
  }

  if (screen === 'entry') {
    return (
      <EntryFlow
        diary={currentDiary}
        diaryEntries={entries.filter((e) => e.diaryKey === currentDiary.key)}
        initial={editing ? entries.find((e) => e.id === currentEntryId) : null}
        onCancel={() => setScreen(editing ? 'training' : returnTo)}
        onNothing={() => showPlaceholder('Точно ничего?')}
        onSave={(entry) => {
          // New entry is added; an edited one replaces the old version.
          setEntries((list) => [...list.filter((e) => e.id !== entry.id), entry]);
          saveEntry(entry).catch(reportSaveError);
          setCurrentEntryId(entry.id);
          setScreen('training');
        }}
      />
    );
  }

  if (screen === 'training') {
    return (
      <Training
        diary={currentDiary}
        entry={entries.find((e) => e.id === currentEntryId)}
        onBack={() => setScreen(returnTo)}
        onEdit={() => {
          setEditing(true);
          setScreen('entry');
        }}
        onAdvice={() => showPlaceholder('Совет психолога — в релизе 2')}
      />
    );
  }

  if (screen === 'diary') {
    return (
      <Diary
        diary={currentDiary}
        entries={entries.filter((e) => e.diaryKey === currentDiary.key)}
        onBack={goProfile}
        onAddEntry={() => {
          setEditing(false);
          setReturnTo('diary');
          setScreen('entry');
        }}
        onOpenEntry={(e) => {
          setCurrentEntryId(e.id);
          setReturnTo('diary');
          setScreen('training');
        }}
      />
    );
  }

  if (screen === 'compare') {
    return <Compare diaries={diaries} entries={entries} onBack={goProfile} />;
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
