import { useCallback, useEffect, useState } from 'react';
import Welcome from './screens/Welcome.jsx';
import HowItWorks from './screens/HowItWorks.jsx';
import SportChoice from './screens/SportChoice.jsx';
import Profile from './screens/Profile.jsx';
import EntryFlow from './screens/EntryFlow.jsx';
import Training from './screens/Training.jsx';
import Diary from './screens/Diary.jsx';
import Compare from './screens/Compare.jsx';
import RedFlag from './screens/RedFlag.jsx';
import Article from './screens/Article.jsx';
import { isRedFlag } from './lib/redFlag.js';
import { showFearCard } from './lib/fearCard.js';
import TopBar from './components/TopBar.jsx';
import Settings from './screens/Settings.jsx';
import About from './screens/About.jsx';
import { deleteEntry, loadUserData, saveDiaries, saveEntry, saveProfile } from './storage/index.js';
import { ADVICE_ENABLED, POOL, withAdvicePick } from './advice/index.js';
import Advice from './screens/Advice.jsx';

// Logs a failed save. A visible "could not save" message comes later.
const reportSaveError = (error) => console.error('Save failed', error);

// Simple screen switcher. A real router comes when there are more screens.
// Data is loaded and saved only through the storage module (R-33).
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState('welcome');
  const [profile, setProfile] = useState({});
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
  // Which article is open and where to return: 'redflag', 'diary', 'profile', 'training' or 'advice'.
  const [article, setArticle] = useState('burnout');
  const [articleFrom, setArticleFrom] = useState('diary');

  // Load saved data once at start. Someone with diaries goes straight to the profile.
  useEffect(() => {
    let cancelled = false;
    loadUserData()
      .then((data) => {
        if (cancelled) return;
        setProfile(data.profile);
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
    return <HowItWorks name={profile.displayName} onBack={goWelcome} onStart={goSports} />;
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
        name={profile.displayName}
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
        onArticle={(key) => {
          setArticle(key);
          setArticleFrom('profile');
          setScreen('article');
        }}
        onSettings={() => setScreen('settings')}
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
        onSave={(saved) => {
          // Which advice pieces this training gets (R-38); only in the build with advice.
          const entry = withAdvicePick(saved, currentDiary, entries);
          // New entry is added; an edited one replaces the old version.
          const next = [...entries.filter((e) => e.id !== entry.id), entry];
          setEntries(next);
          saveEntry(entry).catch(reportSaveError);
          setCurrentEntryId(entry.id);
          // The second "nothing" in a row shows the red flag before the training (R-22).
          setScreen(entry.tone === 'numb' && isRedFlag(next) ? 'redflag' : 'training');
        }}
      />
    );
  }

  if (screen === 'training') {
    return (
      <Training
        diary={currentDiary}
        entry={entries.find((e) => e.id === currentEntryId)}
        fearCard={showFearCard(entries, entries.find((e) => e.id === currentEntryId))}
        onArticle={() => {
          setArticle('trauma');
          setArticleFrom('training');
          setScreen('article');
        }}
        onBack={() => setScreen(returnTo)}
        onEdit={() => {
          setEditing(true);
          setScreen('entry');
        }}
        adviceOpen={ADVICE_ENABLED}
        onAdvice={() => {
          if (!ADVICE_ENABLED) {
            showPlaceholder('Совет психолога — в релизе 2');
            return;
          }
          // Trainings saved before advice was on get their pick now, once (R-38).
          const entry = entries.find((e) => e.id === currentEntryId);
          const withPick = entry.advicePick ? entry : withAdvicePick(entry, currentDiary, entries);
          if (!withPick.advicePick) {
            // "Really nothing": no emotions to advise on (test build note, not Yana's text).
            showPlaceholder('Для тренировки без эмоций совета нет');
            return;
          }
          if (withPick !== entry) {
            setEntries(entries.map((e) => (e.id === entry.id ? withPick : e)));
            saveEntry(withPick).catch(reportSaveError);
          }
          setScreen('advice');
        }}
        onDelete={() => {
          setEntries(entries.filter((e) => e.id !== currentEntryId));
          deleteEntry(currentEntryId).catch(reportSaveError);
          setCurrentEntryId(null);
          // Always back to this sport's diary, even if the training was opened from the profile.
          setScreen('diary');
        }}
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
        redFlag={isRedFlag(entries)}
        onOpenArticle={() => {
          setArticle('burnout');
          setArticleFrom('diary');
          setScreen('article');
        }}
      />
    );
  }

  if (screen === 'settings') {
    return (
      <Settings
        displayName={profile.displayName}
        onSaveName={(displayName) => {
          const next = { ...profile, displayName };
          setProfile(next);
          saveProfile(next).catch(reportSaveError);
          setScreen('profile');
        }}
        onAbout={() => setScreen('about')}
        onBack={goProfile}
      />
    );
  }

  if (screen === 'about') {
    return <About onBack={() => setScreen('settings')} />;
  }

  if (screen === 'redflag') {
    return (
      <RedFlag
        onArticle={() => {
          setArticle('burnout');
          setArticleFrom('redflag');
          setScreen('article');
        }}
        onContinue={() => setScreen('training')}
      />
    );
  }

  if (screen === 'advice') {
    const entry = entries.find((e) => e.id === currentEntryId);
    if (entry?.advicePick) {
      return (
        <Advice
          diary={currentDiary}
          entry={entry}
          pool={POOL}
          onBack={() => setScreen('training')}
          onArticle={(key) => {
            setArticle(key);
            setArticleFrom('advice');
            setScreen('article');
          }}
        />
      );
    }
  }

  if (screen === 'article') {
    return <Article articleKey={article} onBack={() => setScreen(articleFrom)} />;
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
