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
import { dailyCard } from './daily/index.js';
import { todayIso } from './lib/format.js';
import { ADVICE_ENABLED, POOL, withAdvicePick } from './advice/index.js';
import Advice from './screens/Advice.jsx';
import { trackSave } from './lib/saveStatus.js';


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

  // Load failed: show "try again" instead of the welcome screen. Otherwise a
  // person with a diary would start from zero, and the first save would
  // overwrite their real diary with an empty one.
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  // Load saved data at start (and on "try again"). Someone with diaries goes straight to the profile.
  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    loadUserData()
      .then((data) => {
        if (cancelled) return;
        // "Приём дня" counts days from the first time the app was opened (R-40).
        if (data.profile.dailyStart) {
          setProfile(data.profile);
        } else {
          const next = { ...data.profile, dailyStart: todayIso() };
          setProfile(next);
          trackSave(() => saveProfile(next));
        }
        setDiaries(data.diaries);
        setEntries(data.entries);
        if (data.diaries.length > 0) setScreen('profile');
      })
      .catch((error) => {
        console.error('Load failed', error);
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  // The screen updates at once; saving happens in the background.
  const updateDiaries = useCallback((list) => {
    setDiaries(list);
    trackSave(() => saveDiaries(list));
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

  // Texts are drafts until Yana approves them (V-52).
  if (loadError) {
    return (
      <main className="screen load-error">
        <h1 className="page-title">Не получилось открыть дневник</h1>
        <p className="section-hint">Проверь интернет и попробуй ещё раз. Твои записи никуда не делись.</p>
        <button type="button" className="btn-primary" onClick={() => setLoadAttempt((n) => n + 1)}>
          Попробовать ещё раз
        </button>
      </main>
    );
  }

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
        daily={dailyCard(profile, todayIso())}
        onDailyOpen={() => {
          const today = todayIso();
          if (profile.dailyOpened === today) return;
          const next = { ...profile, dailyOpened: today };
          setProfile(next);
          trackSave(() => saveProfile(next));
        }}
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
          trackSave(() => saveEntry(entry));
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
            trackSave(() => saveEntry(withPick));
          }
          setScreen('advice');
        }}
        onDelete={() => {
          setEntries(entries.filter((e) => e.id !== currentEntryId));
          trackSave(() => deleteEntry(currentEntryId));
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
          trackSave(() => saveProfile(next));
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
