// Tiny smooth line of the last emotion points (values -1..1) for a diary card.
export default function Sparkline({ values, color, width = 64, height = 24 }) {
  if (values.length < 2) return null;
  const step = width / (values.length - 1);
  const y = (v) => height / 2 - v * (height / 2 - 3);
  const pts = values.map((v, i) => [i * step, y(v)]);

  // Smooth curve through the points (midpoint quadratic smoothing).
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i += 1) {
    const [px, py] = pts[i - 1];
    const [x, yy] = pts[i];
    const mx = (px + x) / 2;
    d += ` Q${px},${py} ${mx},${(py + yy) / 2}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  d += ` T${lx},${ly}`;

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
