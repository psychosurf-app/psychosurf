import TopBar from '../components/TopBar.jsx';
import { ARTICLES } from '../data/articles.js';

// One free article by Yana (G-22 for burnout). The same screen will show other articles (I-39).

function ListItem({ text, plain }) {
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
                <ListItem key={t} text={t} plain={b.plain} />
              ))}
            </ul>
          );
        }
        return <p key={i} className="article-p">{b.text}</p>;
      })}

      <button type="button" className="btn-primary" onClick={onBack}>
        Вернуться
      </button>
    </main>
  );
}
