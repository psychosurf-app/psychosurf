// Emotion / motivation chart of a diary (decision R-25, mockup G-16).
// By default points are evenly spaced by training; a series may pass `xs` (0..1) to place
// points by calendar date instead (comparison G-18). Values are -1..1.

const W = 340;
const H = 220;
const PAD_X = 8;
const PAD_Y = 14;

// Smooth curve that never overshoots the points (monotone cubic, Fritsch–Carlson).
function monotonePath(pts) {
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
  const n = pts.length;
  const dx = [];
  const slope = [];
  for (let i = 0; i < n - 1; i += 1) {
    dx.push(Math.max(pts[i + 1][0] - pts[i][0], 0.01)); // guard against two points at one x
    slope.push((pts[i + 1][1] - pts[i][1]) / dx[i]);
  }
  const tangent = [slope[0]];
  for (let i = 1; i < n - 1; i += 1) {
    tangent.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  }
  tangent.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i += 1) {
    if (slope[i] === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
    }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i += 1) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = dx[i] / 3;
    d += ` C${x0 + h},${y0 + tangent[i] * h} ${x1 - h},${y1 - tangent[i + 1] * h} ${x1},${y1}`;
  }
  return d;
}

const xOf = (i, count) => (count === 1 ? W / 2 : PAD_X + (i * (W - 2 * PAD_X)) / (count - 1));
const yOf = (v) => H / 2 - v * (H / 2 - PAD_Y);

export default function WaveChart({ series }) {
  const count = series[0]?.values.length ?? 0;

  return (
    <svg className="wave-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="График по тренировкам">
      <rect x="0" y="0" width={W} height={H / 2} className="band-plus" />
      <rect x="0" y={H / 2} width={W} height={H / 2} className="band-minus" />
      <line x1="0" x2={W} y1={H / 2} y2={H / 2} className="chart-zero" />
      {series.map((s) => {
        const pts = s.values.map((v, i) => [
          s.xs ? PAD_X + s.xs[i] * (W - 2 * PAD_X) : xOf(i, count),
          yOf(v),
        ]);
        if (pts.length === 0) return null;
        return (
          <g key={s.name}>
            <path d={monotonePath(pts)} fill="none" stroke={s.color} strokeWidth="3.5" strokeLinecap="round" />
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="4.5" fill={s.color} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
