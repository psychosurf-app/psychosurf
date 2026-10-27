// The four "bags" (idea I-23, mockup G-4 v7): overall tone × motivation.
// "Nothing" entries (tone 'numb') don't go into any bag.

export const BAGS = {
  catch_wave: {
    name: 'Ловлю волну',
    color: '#076a65',
    meaning: 'всё в кайф и хочется дальше. Хорошие эмоции + есть мотивация.',
  },
  sunbathing: {
    name: 'Загораю на доске',
    color: '#6a5ae0',
    meaning: 'хорошо, но никуда не движусь. Хорошие эмоции + застой в мотивации.',
  },
  paddling: {
    name: 'Гребу к волне',
    color: '#e0602b',
    meaning: 'тяжело, но цель есть. Плохие эмоции + есть мотивация.',
  },
  wiped_out: {
    name: 'Смыло',
    color: '#5f6266',
    meaning: 'и плохо, и не хочется. Плохие эмоции + застой в мотивации.',
  },
};

export function bagOf(entry) {
  if (entry.tone === 'good') return entry.motivation === 'forward' ? 'catch_wave' : 'sunbathing';
  if (entry.tone === 'hard') return entry.motivation === 'forward' ? 'paddling' : 'wiped_out';
  return null;
}
