// Bag on the "Улов" shelf (mockup G-4): fill height shows the share of trainings, number on top.
export default function BigBag({ color, count, fill }) {
  // Bag body spans y 30..118; the fill rises from the bottom.
  const top = 118 - Math.max(0, Math.min(1, fill)) * 80;
  const body = 'M22 30h56c14 10 20 30 20 52 0 26-18 36-48 36S2 108 2 82c0-22 6-42 20-52Z';
  return (
    <svg viewBox="0 0 100 120" className="big-bag" aria-hidden="true">
      <defs>
        <clipPath id={`bag-${color.replace('#', '')}`}>
          <path d={body} />
        </clipPath>
      </defs>
      <path d="M26 30c-8-16 8-26 14-16 4-12 16-12 20 0 6-10 22 0 14 16Z" fill="#f2f2f2" stroke="#111" strokeWidth="3" />
      <path d={body} fill="#f2f2f2" />
      <rect x="0" y={top} width="100" height="120" fill={color} clipPath={`url(#bag-${color.replace('#', '')})`} />
      <path d={body} fill="none" stroke="#111" strokeWidth="3" />
      <path d="M24 31c8 6 44 6 52 0" fill="none" stroke="#8a5a2b" strokeWidth="4" strokeLinecap="round" />
      <text x="50" y="84" textAnchor="middle" className="big-bag-num">
        {count}
      </text>
    </svg>
  );
}
