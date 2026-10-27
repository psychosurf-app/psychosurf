// Decorative waves for the welcome screen (mockup G-2). Not real data.

// Build a smooth sine-like path across the given width.
function wavePath({ width, mid, amplitude, period, phase }) {
  const points = [];
  for (let x = -20; x <= width + 20; x += 8) {
    const y = mid + amplitude * Math.sin(((x + phase) / period) * Math.PI * 2);
    points.push(`${x === -20 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(' ');
}

const WIDTH = 400;
const HEIGHT = 140;

const WAVES = [
  { color: 'var(--purple)', amplitude: 30, period: 260, phase: 20, dot: 210 },
  { color: 'var(--orange)', amplitude: 32, period: 240, phase: 150, dot: 230 },
  { color: 'var(--teal)', amplitude: 52, period: 270, phase: 40, dot: 130 },
];

export default function WaveDecor() {
  const mid = HEIGHT / 2;
  return (
    <svg
      className="wave-decor"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {[22, mid, HEIGHT - 22].map((y) => (
        <line key={y} x1="24" x2={WIDTH - 24} y1={y} y2={y} className="wave-grid" />
      ))}
      {WAVES.map((w) => {
        const dotY = mid + w.amplitude * Math.sin(((w.dot + w.phase) / w.period) * Math.PI * 2);
        return (
          <g key={w.color}>
            <path
              d={wavePath({ width: WIDTH, mid, ...w })}
              fill="none"
              stroke={w.color}
              strokeWidth="4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={w.dot} cy={dotY} r="5" fill={w.color} />
          </g>
        );
      })}
    </svg>
  );
}
