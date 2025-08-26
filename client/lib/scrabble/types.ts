export type PremiumType = 'DW' | 'TW' | 'DL' | 'TL';

export interface Tile {
  id: string;
  letter: string;
  points: number;
  isBlank?: boolean;
}

export interface SelectedTile extends Tile {
  fromRack: boolean;
  originalIndex?: number;
}

export interface PlacedTile {
  row: number;
  col: number;
  tile: Tile;
  isTemporary?: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  rack: Tile[];
  isCurrentPlayer: boolean;
}

export interface GameState {
  board: (PlacedTile | null)[][];
  players: Player[];
  currentPlayerIndex: number;
  tileBag: Tile[];
  tilesRemaining: number;
  turnNumber: number;
  gamePhase: GamePhase;
  lastWord?: string;
  lastScore?: number;
  gameHistory: Move[];
}

export type GamePhase = 
  | 'waiting'
  | 'playing'
  | 'validating'
  | 'scoring'
  | 'finished';

export interface Move {
  playerId: string;
  word: string;
  score: number;
  placedTiles: PlacedTile[];
  timestamp: Date;
}

export interface WordValidationResult {
  isValid: boolean;
  words: string[];
  score: number;
  errors?: string[];
}

export interface GameActions {
  startNewGame: () => void;
  placeTile: (row: number, col: number, tile: SelectedTile) => void;
  removeTile: (row: number, col: number) => void;
  selectTile: (tile: Tile, index: number) => void;
  deselectTile: (tileId: string) => void;
  playWord: () => void;
  shuffleRack: () => void;
  recallTiles: () => void;
  passTurn: () => void;
  exchangeTiles: (tiles: Tile[]) => void;
}

export interface Position {
  row: number;
  col: number;
}

export interface WordPlacement {
  word: string;
  startPosition: Position;
  direction: 'horizontal' | 'vertical';
  tiles: PlacedTile[];
}
