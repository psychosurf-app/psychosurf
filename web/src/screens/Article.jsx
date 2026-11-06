import { useEffect } from 'react';
import TopBar from '../components/TopBar.jsx';
import { ARTICLES } from '../data/articles.js';

// One free article by Yana: burnout (G-22), motivation (G-24, I-39), emotions (G-27, I-41), trauma (G-25, I-40).

// Paragraph with **bold** parts.
function Rich({ text }) {
  return text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}

function ListItem({ text, plain, rich }) {
  if (rich) {
    return (
      <li>
        <Rich text={text} />
      </li>
    );
  }
  const split = plain ? -1 : text.indexOf(' — ');
  if (split === -1) return <li>{text}</li>;
  return (
    <li>
      <strong>{text.slice(0, split)}</strong>
      {text.slice(split)}
    </li>
  );
}

export default function Article({ articleKey, onBack }) {
  const article = ARTICLES[articleKey];

  // Articles are long: always start reading from the top.
  // Braces matter: newer Chromium returns a Promise from scrollTo, and React would
  // treat it as a cleanup function and crash when the article closes.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [articleKey]);

  return (
    <main className="screen article">
      <TopBar onBack={onBack} />
      <p className="article-label">Бонус · статья психолога</p>
      <h1 className="page-title">{article.title}</h1>
      <p className="article-subtitle">{article.subtitle}</p>

      {article.blocks.map((b, i) => {
        if (b.type === 'h') return <h2 key={i} className="article-h">{b.text}</h2>;
        if (b.type === 'sub') return <h3 key={i} className="article-sub">{b.text}</h3>;
        if (b.type === 'list') {
          return (
            <ul key={i} className="article-list">
              {b.items.map((t) => (
                <ListItem key={t} text={t} plain={b.plain} rich={b.rich} />
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="article-p">
            <Rich text={b.text} />
          </p>
        );
      })}

      <button type="button" className="btn-primary" onClick={onBack}>
        Вернуться
      </button>
    </main>
  );
}
