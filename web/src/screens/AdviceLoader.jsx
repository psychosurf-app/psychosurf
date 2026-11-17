import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar.jsx';
import Advice from './Advice.jsx';
import { loadAdviceTexts } from '../advice/index.js';

// Gets the texts of one advice, then shows the advice screen (G-23, G-29).
// Release 2: texts come from the server, which also says if parts 2-3 are
// locked (R-37). Test build: from the bundled pool, right away.
// Texts of the loading and error states are drafts until Yana approves (V-52).
export default function AdviceLoader({ diary, entry, today, access, onBack, onArticle }) {
  const [state, setState] = useState({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadAdviceTexts(entry.advicePick, today, access)
      .then((r) => !cancelled && setState({ status: 'ok', ...r }))
      .catch((error) => {
        console.error('Advice failed', error);
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
    // access is recomputed on every render; its result only matters at start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id, today, attempt]);

  if (state.status === 'ok') {
    return (
      <Advice diary={diary} entry={entry} pool={state.pool} locked={state.locked} onBack={onBack} onArticle={onArticle} />
    );
  }

  return (
    <main className="screen article advice-screen">
      <TopBar onBack={onBack} />
      <p className="article-label">Совет психолога</p>
      {state.status === 'loading' ? (
        <p className="section-hint">Загружаем совет…</p>
      ) : (
        <>
          <h1 className="page-title">Не получилось загрузить совет</h1>
          <p className="section-hint">Проверь интернет-соединение и попробуй ещё раз.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setState({ status: 'loading' });
              setAttempt((n) => n + 1);
            }}
          >
            Попробовать ещё раз
          </button>
        </>
      )}
    </main>
  );
}
