import raccoonPeek from '../assets/raccoon-peek.png';
import TopBar from '../components/TopBar.jsx';
import { BurnoutArticleButton, RedFlagText } from '../components/RedFlagCard.jsx';

// Red flag screen, mockup G-19 v1 (I-33). Shown right after saving the second "nothing" in a row.
export default function RedFlag({ onArticle, onContinue }) {
  return (
    <main className="screen red-flag">
      <TopBar onBack={onContinue} />
      <h1 className="page-title">Давай остановимся на минутку</h1>
      <RedFlagText />

      <div className="entry-bottom">
        <img className="raccoon-peek" src={raccoonPeek} alt="" />
        <BurnoutArticleButton onClick={onArticle} />
        <button type="button" className="btn-primary" onClick={onContinue}>
          Понятно, продолжить
        </button>
      </div>
    </main>
  );
}
