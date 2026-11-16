import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar.jsx';
import { ArticleCard } from '../components/ArticleCards.jsx';
import { BAGS } from '../lib/bags.js';
import { adviceView, PART_TITLES, ARTICLE_TITLES } from '../advice/view.js';

// Advice of one training, mockup G-23 v1 (I-36), test build with advice only (R-39).
// Header "Тренировка [дата]" + "Спорт · «мешочек»", the line from I-50,
// three parts, final line. Two advices: switch "Совет 1 / Совет 2" for parts 1-2 (R-38).

const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

const shortDate = (iso) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_GEN[m - 1]}`;
};

function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    if (b.t === 'callout') return <div key={i} className="flag-callout">{b.text}</div>;
    if (b.t === 'list') {
      return (
        <div key={i}>
          {b.title && <p className="article-p">{b.title}</p>}
          <ul className="article-list">
            {b.items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      );
    }
    return <p key={i} className="article-p">{b.text}</p>;
  });
}

function Part({ title, blocks }) {
  if (!blocks) return null;
  return (
    <section className="advice-part">
      <h2 className="article-h">{title}</h2>
      <Blocks blocks={blocks} />
    </section>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// A locked part: its title with a lock and grey lines instead of the text (G-29 v1).
function LockedPart({ title }) {
  return (
    <section className="advice-part advice-locked">
      <h2 className="article-h">
        <span>{title}</span>
        <LockIcon />
      </h2>
      <span className="skeleton-line" />
      <span className="skeleton-line" />
      <span className="skeleton-line short" />
    </section>
  );
}

// Invitation under the locked parts, text approved by Yana (I-46, 2026-11-07).
function Paywall() {
  const [note, setNote] = useState(false);
  return (
    <div className="paywall">
      <h2 className="paywall-title">Волну ты уже увидел. Осталось её поймать</h2>
      <p className="paywall-text">
        Первая часть подсказала, что происходит. Во второй и третьей — как с этим работать и куда грести дальше.
        Совет подобран спортивным психологом под твои эмоции, мотивацию и твой спорт.
      </p>
      <button type="button" className="paywall-btn" onClick={() => setNote(true)}>
        Читать совет полностью
      </button>
      {/* Payment comes in release 2 (Z-1). Until then the button only says so. */}
      {note && <p className="paywall-note">Оплата появится к запуску приложения.</p>}
      <p className="paywall-free">Дневник и графики остаются бесплатными</p>
    </div>
  );
}

// `locked`: after the trial without a subscription (R-37): part 1 and the
// orange block stay open, parts 2-3 are locked with Yana's invitation (I-46).
export default function Advice({ diary, entry, pool, locked = false, onBack, onArticle }) {
  const [tab, setTab] = useState(0);
  const view = adviceView(entry, entry.advicePick, pool);
  const current = view.tabs[tab] ?? view.tabs[0];
  const bag = BAGS[entry.advicePick.bag];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [entry.id]);

  return (
    <main className="screen article advice-screen">
      <TopBar onBack={onBack} />
      <p className="article-label">Совет психолога</p>
      <h1 className="page-title">Тренировка {shortDate(entry.trainingDate)}</h1>
      <p className="article-subtitle">
        {diary.name} · «{bag?.name}»
      </p>

      {view.intro && <p className="advice-intro">{view.intro}</p>}

      {view.tabs.length > 1 && (
        <div className="segmented">
          {view.tabs.map((t, i) => (
            <button key={t.key} type="button" className={i === tab ? 'on' : ''} onClick={() => setTab(i)}>
              Совет {i + 1}
            </button>
          ))}
        </div>
      )}

      <Part title={PART_TITLES.part1} blocks={current.part1} />
      {/* Orange block about a specialist: free, above the lock (I-45, V-46, column N). */}
      {current.flag && <div className="flag-callout">{current.flag}</div>}
      {locked ? (
        <>
          <LockedPart title={PART_TITLES.part2} />
          <LockedPart title={view.part3Title} />
          <Paywall />
        </>
      ) : (
        <>
          <Part title={PART_TITLES.part2} blocks={current.part2} />
          {view.part3 && view.motivationLine && <p className="advice-intro">{view.motivationLine}</p>}
          <Part title={view.part3Title} blocks={view.part3} />

          {view.finalLine && <p className="advice-final">{view.finalLine}</p>}

          {view.articles.map((key) => (
            <ArticleCard key={key} title={ARTICLE_TITLES[key]} onClick={() => onArticle(key)} />
          ))}
        </>
      )}

      <button type="button" className="btn-primary" onClick={onBack}>
        Вернуться
      </button>
    </main>
  );
}
