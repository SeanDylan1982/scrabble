import { PremiumType } from './types';

export const BOARD_SIZE = 15;

// Scrabble letter distribution and point values
export const LETTER_DISTRIBUTION = {
  A: { count: 9, points: 1 },
  B: { count: 2, points: 3 },
  C: { count: 2, points: 3 },
  D: { count: 4, points: 2 },
  E: { count: 12, points: 1 },
  F: { count: 2, points: 4 },
  G: { count: 3, points: 2 },
  H: { count: 2, points: 4 },
  I: { count: 9, points: 1 },
  J: { count: 1, points: 8 },
  K: { count: 1, points: 5 },
  L: { count: 4, points: 1 },
  M: { count: 2, points: 3 },
  N: { count: 6, points: 1 },
  O: { count: 8, points: 1 },
  P: { count: 2, points: 3 },
  Q: { count: 1, points: 10 },
  R: { count: 6, points: 1 },
  S: { count: 4, points: 1 },
  T: { count: 6, points: 1 },
  U: { count: 4, points: 1 },
  V: { count: 2, points: 4 },
  W: { count: 2, points: 4 },
  X: { count: 1, points: 8 },
  Y: { count: 2, points: 4 },
  Z: { count: 1, points: 10 },
  '?': { count: 2, points: 0 }, // Blank tiles
};

// Premium squares layout for Scrabble board
export const PREMIUM_SQUARES: (PremiumType | undefined)[][] = [
  ['TW', undefined, undefined, 'DL', undefined, undefined, undefined, 'TW', undefined, undefined, undefined, 'DL', undefined, undefined, 'TW'],
  [undefined, 'DW', undefined, undefined, undefined, 'TL', undefined, undefined, undefined, 'TL', undefined, undefined, undefined, 'DW', undefined],
  [undefined, undefined, 'DW', undefined, undefined, undefined, 'DL', undefined, 'DL', undefined, undefined, undefined, 'DW', undefined, undefined],
  ['DL', undefined, undefined, 'DW', undefined, undefined, undefined, 'DL', undefined, undefined, undefined, 'DW', undefined, undefined, 'DL'],
  [undefined, undefined, undefined, undefined, 'DW', undefined, undefined, undefined, undefined, undefined, 'DW', undefined, undefined, undefined, undefined],
  [undefined, 'TL', undefined, undefined, undefined, 'TL', undefined, undefined, undefined, 'TL', undefined, undefined, undefined, 'TL', undefined],
  [undefined, undefined, 'DL', undefined, undefined, undefined, 'DL', undefined, 'DL', undefined, undefined, undefined, 'DL', undefined, undefined],
  ['TW', undefined, undefined, 'DL', undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'DL', undefined, undefined, 'TW'],
  [undefined, undefined, 'DL', undefined, undefined, undefined, 'DL', undefined, 'DL', undefined, undefined, undefined, 'DL', undefined, undefined],
  [undefined, 'TL', undefined, undefined, undefined, 'TL', undefined, undefined, undefined, 'TL', undefined, undefined, undefined, 'TL', undefined],
  [undefined, undefined, undefined, undefined, 'DW', undefined, undefined, undefined, undefined, undefined, 'DW', undefined, undefined, undefined, undefined],
  ['DL', undefined, undefined, 'DW', undefined, undefined, undefined, 'DL', undefined, undefined, undefined, 'DW', undefined, undefined, 'DL'],
  [undefined, undefined, 'DW', undefined, undefined, undefined, 'DL', undefined, 'DL', undefined, undefined, undefined, 'DW', undefined, undefined],
  [undefined, 'DW', undefined, undefined, undefined, 'TL', undefined, undefined, undefined, 'TL', undefined, undefined, undefined, 'DW', undefined],
  ['TW', undefined, undefined, 'DL', undefined, undefined, undefined, 'TW', undefined, undefined, undefined, 'DL', undefined, undefined, 'TW'],
];

export const RACK_SIZE = 7;

export const BINGO_BONUS = 50; // Points for using all 7 tiles

export const COLORS = {
  board: {
    background: 'emerald-900',
    border: 'emerald-800',
  },
  squares: {
    normal: 'amber-50',
    center: 'yellow-400',
    doubleWord: 'pink-400',
    tripleWord: 'red-500',
    doubleLetter: 'sky-400',
    tripleLetter: 'blue-500',
  },
  tiles: {
    background: 'amber-100',
    border: 'amber-300',
    text: 'gray-800',
    selected: 'blue-200',
    placed: 'green-100',
  }
};
