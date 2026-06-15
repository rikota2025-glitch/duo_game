// Water Sort Puzzle — レベルデータ

const COLORS = {
  pink: '#F2A6B3',
  sky: '#87CEEB',
  mint: '#98E8C1',
  peach: '#FFCBA4',
  lilac: '#C8A2C8',
  lemon: '#FFF44F',
  coral: '#FF7F7F',
};

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function generateLevel(numColors, colorNames, seed) {
  const rng = seededRandom(seed);
  const allColors = [];
  for (let i = 0; i < numColors; i++) {
    for (let j = 0; j < 5; j++) {
      allColors.push(colorNames[i]);
    }
  }
  // Fisher-Yates shuffle
  for (let i = allColors.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [allColors[i], allColors[j]] = [allColors[j], allColors[i]];
  }
  const tubes = [];
  for (let i = 0; i < numColors; i++) {
    tubes.push(allColors.slice(i * 5, (i + 1) * 5));
  }
  tubes.push([]);
  tubes.push([]);
  return tubes;
}

const ALL_COLORS = ['pink', 'sky', 'mint', 'peach', 'lilac', 'lemon', 'coral'];

const LEVELS = [
  // Levels 1-5: 3 colors
  ...Array.from({length: 5}, (_, i) => generateLevel(3, ALL_COLORS.slice(0, 3), 100 + i)),
  // Levels 6-12: 4 colors
  ...Array.from({length: 7}, (_, i) => generateLevel(4, ALL_COLORS.slice(0, 4), 200 + i)),
  // Levels 13-20: 5 colors
  ...Array.from({length: 8}, (_, i) => generateLevel(5, ALL_COLORS.slice(0, 5), 300 + i)),
  // Levels 21-27: 6 colors
  ...Array.from({length: 7}, (_, i) => generateLevel(6, ALL_COLORS.slice(0, 6), 400 + i)),
  // Levels 28-30: 7 colors
  ...Array.from({length: 3}, (_, i) => generateLevel(7, ALL_COLORS, 500 + i)),
];
