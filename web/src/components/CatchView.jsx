import { useState } from 'react';
import catchRaccoon from '../assets/catch-raccoon.png';
import BigBag from './BigBag.jsx';
import { BAGS, bagOf } from '../lib/bags.js';

// "Твой улов" — four bags for the chosen period (idea I-23, mockup G-4 v7, question V-17).

const LEGEND_KEY = 'psychosurf.bagLegendClosed';

// Per-viewer convenience only (remembered collapse); storage may be unavailable.
function readClosed() {
  try {
    return window.localStorage.getItem(LEGEND_KEY) === '1';
  } catch {
    return false;
  }
}

function saveClosed(closed) {
  try {
    window.localStorage.setItem(LEGEND_KEY, closed ? '1' : '0');
  } catch {
    // ignore: the block just opens again next time
  }
}

export default function CatchView({ entries }) {
  const [legendOpen, setLegendOpen] = useState(!readClosed());

  const counts = Object.fromEntries(Object.keys(BAGS).map((k) => [k, 0]));
  entries.forEach((e) => {
    const key = bagOf(e);
    if (key) counts[key] += 1;
  });
  const max = Math.max(1, ...Object.values(counts));

  function toggleLegend() {
    setLegendOpen(!legendOpen);
    saveClosed(legendOpen);
  }

  return (
    <section className="catch">
      <div className="catch-scene">
        <img className="catch-raccoon" src={catchRaccoon} alt="" />
        <div className="catch-bags">
          {Object.entries(BAGS).map(([key, bag]) => (
            <BigBag key={key} color={bag.color} count={counts[key]} fill={counts[key] / max} />
          ))}
        </div>
        <svg className="catch-board" viewBox="0 0 360 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M6 10h330c14 0 20 6 20 9s-6 9-20 9H90l-20 12c-4-6-4-10 0-12H6c-6 0-6-18 0-18Z" fill="#111" />
        </svg>
      </div>

      <div className="catch-labels">
        {Object.entries(BAGS).map(([key, bag]) => (
          <div key={key}>
            <span className="dot" style={{ background: bag.color }} />
            <strong>{bag.name}</strong>
            <span>{counts[key]} трен.</span>
          </div>
        ))}
      </div>

      <div className="bag-legend">
        <button type="button" className="bag-legend-head" onClick={toggleLegend} aria-expanded={legendOpen}>
          Что значат мешочки
          <span aria-hidden="true">{legendOpen ? '⌃' : '⌄'}</span>
        </button>
        {legendOpen && (
          <ul>
            {Object.values(BAGS).map((bag) => (
              <li key={bag.name}>
                <span className="dot" style={{ background: bag.color }} />
                <span>
                  <strong>{bag.name}</strong> — {bag.meaning}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
