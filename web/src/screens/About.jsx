import TopBar from '../components/TopBar.jsx';

// "О приложении", text by Yana (V-8, 2026-10-27). The disclaimer wording is to be checked
// by the lawyer before release 1 (V-20). Idea I-35 (analysis = plain math) may add a line here.
export default function About({ onBack }) {
  return (
    <main className="screen about">
      <TopBar onBack={onBack} />
      <h1 className="page-title">О приложении</h1>
      <p className="article-p">
        <strong>Психосёрф</strong> — дневник эмоций и мотивации в спорте.
      </p>
      <p className="article-p">Создано спортсменами для спортсменов.</p>
      <p className="article-p">Содержание основано на знаниях и практике спортивной психологии.</p>
      <p className="article-p">
        Автор методики и текстов: Яна Блеер, спортивный психолог.
        <br />
        Разработка: Елизавета Рыбак.
      </p>
      <p className="about-disclaimer">
        Приложение помогает отслеживать своё состояние и не является медицинской или
        психологической помощью. Оно не ставит диагнозов и не заменяет консультацию специалиста.
      </p>
    </main>
  );
}
