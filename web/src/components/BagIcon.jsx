// Small bag drawing filled with the bag color (simplified from mockup G-4).
export default function BagIcon({ color, size = 44 }) {
  return (
    <svg viewBox="0 0 40 48" width={size * (40 / 48)} height={size} aria-hidden="true">
      <path d="M12 12c-2-6 4-9 8-6 4-3 10 0 8 6" fill="#f2f2f2" stroke="#111" strokeWidth="2" />
      <path
        d="M11 13h18c6 4 9 12 9 20 0 9-7 13-18 13S2 42 2 33c0-8 3-16 9-20Z"
        fill="#f2f2f2"
        stroke="#111"
        strokeWidth="2"
      />
      <path d="M3 30h34c1 1 1 2 1 3 0 9-7 13-18 13S2 42 2 33c0-1 0-2 1-3Z" fill={color} />
      <path
        d="M11 13h18c6 4 9 12 9 20 0 9-7 13-18 13S2 42 2 33c0-8 3-16 9-20Z"
        fill="none"
        stroke="#111"
        strokeWidth="2"
      />
      <path d="M12 13c3 2 13 2 16 0" fill="none" stroke="#8a5a2b" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
