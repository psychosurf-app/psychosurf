// Helpers shared by all analysis cards ("Коротко" in comparison and in the sport diary).

// Small stable string hash, so the same situation shows the same variant
// until the data changes (no flicker on every screen open).
function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Yana writes 2-4 variants per situation; the app rotates them.
export function pickVariant(variants, seed) {
  return variants[hash(seed) % variants.length];
}

// Lowercase a sport name inside a sentence ("заряжает сёрфинг"),
// but keep names like "MMA" or "SUP" as typed.
function nameInSentence(name) {
  if (name.length > 1 && name[1] === name[1].toUpperCase()) return name;
  return name[0].toLowerCase() + name.slice(1);
}

// Fill {Спорт} and {k из n}. The sport name keeps its capital letter
// at the start of a sentence and is lowercased elsewhere.
export function fillPhrase(template, { sport, k, n } = {}) {
  let text = template.replace('{k из n}', `${k} из ${n}`);
  if (sport) {
    text = text.replace(/\{Спорт\}/g, (match, offset) =>
      /^$|[.!?]\s+$/.test(text.slice(0, offset)) ? sport : nameInSentence(sport),
    );
  }
  return text;
}
