// Red flag text, approved by Yana (I-33, mockup G-19 v1). No contacts, only a pointer
// to a specialist and the free article on burnout (R-22, V-25).
// Used on the red flag screen and instead of "Коротко" in the diary.

export function RedFlagText() {
  return (
    <>
      <p className="flag-text">
        Уже второй раз подряд после тренировки ты ничего не чувствуешь. Так бывает, когда
        нагрузки стало больше, чем сил: тело работает, а эмоции будто выключились. Это не слабость
        и не лень. Это сигнал, к которому стоит прислушаться.
      </p>
      <div className="flag-callout">
        Если это состояние длится дольше пары недель или появляется не только на тренировках,
        лучше обсудить его со специалистом: психологом или спортивным психологом. Это такой же
        нормальный шаг, как пойти к врачу с больным коленом.
      </div>
    </>
  );
}

// Card that opens one of Yana's articles, labelled "bonus" instead of "free" (I-39).
export function ArticleCard({ title, onClick }) {
  return (
    <button type="button" className="article-card" onClick={onClick}>
      <span>
        <span className="article-card-title">{title}</span>
        <span className="article-card-label">Бонус · статья психолога</span>
      </span>
      <span className="row-arrow" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

export const BurnoutArticleButton = ({ onClick }) => (
  <ArticleCard title="Почитать про выгорание" onClick={onClick} />
);
