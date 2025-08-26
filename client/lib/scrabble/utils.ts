import { Tile } from './types';
import { LETTER_DISTRIBUTION } from './constants';

export function generateTileBag(): Tile[] {
  const tiles: Tile[] = [];
  let id = 0;

  Object.entries(LETTER_DISTRIBUTION).forEach(([letter, { count, points }]) => {
    for (let i = 0; i < count; i++) {
      tiles.push({
        id: `tile-${id++}`,
        letter,
        points,
        isBlank: letter === '?'
      });
    }
  });

  return shuffleArray(tiles);
}

export function drawTiles(tileBag: Tile[], count: number): Tile[] {
  return tileBag.splice(0, Math.min(count, tileBag.length));
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 15 && col >= 0 && col < 15;
}

export function getAdjacentPositions(row: number, col: number) {
  return [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 }
  ].filter(pos => isValidPosition(pos.row, pos.col));
}

export function calculateWordScore(
  word: string, 
  positions: Array<{ row: number; col: number }>,
  premiumSquares: any[][],
  placedThisTurn: Array<{ row: number; col: number }>
): number {
  let score = 0;
  let wordMultiplier = 1;

  positions.forEach(({ row, col }, index) => {
    const letter = word[index];
    const isNewTile = placedThisTurn.some(pos => pos.row === row && pos.col === col);
    
    let letterScore = getLetterPoints(letter);
    let letterMultiplier = 1;

    // Apply premium squares only for newly placed tiles
    if (isNewTile) {
      const premium = premiumSquares[row]?.[col];
      switch (premium) {
        case 'DL':
          letterMultiplier = 2;
          break;
        case 'TL':
          letterMultiplier = 3;
          break;
        case 'DW':
          wordMultiplier *= 2;
          break;
        case 'TW':
          wordMultiplier *= 3;
          break;
      }
    }

    score += letterScore * letterMultiplier;
  });

  return score * wordMultiplier;
}

export function getLetterPoints(letter: string): number {
  return LETTER_DISTRIBUTION[letter.toUpperCase()]?.points || 0;
}

export function isValidWord(word: string): boolean {
  // Simplified word validation - in a real game, this would check against a dictionary
  return word.length >= 2 && /^[A-Z]+$/.test(word.toUpperCase());
}

export function findAllWords(
  board: any[][],
  newPlacements: Array<{ row: number; col: number; letter: string }>
): string[] {
  const words: string[] = [];
  
  // This is a simplified implementation
  // In a real Scrabble game, you'd need to find all words formed by the new placement
  
  if (newPlacements.length > 0) {
    // Sort placements to form the main word
    const sorted = [...newPlacements].sort((a, b) => {
      if (a.row === b.row) return a.col - b.col;
      return a.row - b.row;
    });
    
    const mainWord = sorted.map(p => p.letter).join('');
    if (mainWord.length >= 2) {
      words.push(mainWord);
    }
  }
  
  return words;
}

export function formatScore(score: number): string {
  return score.toLocaleString();
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
