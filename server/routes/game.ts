import { RequestHandler } from "express";
import { LobbyRoom, LobbyPlayer } from "@shared/api";

// Types for server-side game state
interface Tile {
  id: string;
  letter: string;
  points: number;
  isBlank?: boolean;
}
interface BoardTile {
  row: number;
  col: number;
  tile: Tile;
}
interface PlayerState {
  id: string;
  name: string;
  score: number;
  rack: Tile[];
}
interface GameState {
  roomId: string;
  board: (BoardTile | null)[][];
  players: PlayerState[];
  currentPlayerId: string;
  tileBag: Tile[];
  tilesRemaining: number;
  turnNumber: number;
  startedAt: string;
  lastWord?: string;
  lastScore?: number;
}

// Premium squares
const PREMIUM_SQUARES: (("DW" | "TW" | "DL" | "TL") | undefined)[][] = [
  [
    "TW",
    undefined,
    undefined,
    "DL",
    undefined,
    undefined,
    undefined,
    "TW",
    undefined,
    undefined,
    undefined,
    "DL",
    undefined,
    undefined,
    "TW",
  ],
  [
    undefined,
    "DW",
    undefined,
    undefined,
    undefined,
    "TL",
    undefined,
    undefined,
    undefined,
    "TL",
    undefined,
    undefined,
    undefined,
    "DW",
    undefined,
  ],
  [
    undefined,
    undefined,
    "DW",
    undefined,
    undefined,
    undefined,
    "DL",
    undefined,
    "DL",
    undefined,
    undefined,
    undefined,
    "DW",
    undefined,
    undefined,
  ],
  [
    "DL",
    undefined,
    undefined,
    "DW",
    undefined,
    undefined,
    undefined,
    "DL",
    undefined,
    undefined,
    undefined,
    "DW",
    undefined,
    undefined,
    "DL",
  ],
  [
    undefined,
    undefined,
    undefined,
    undefined,
    "DW",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "DW",
    undefined,
    undefined,
    undefined,
    undefined,
  ],
  [
    undefined,
    "TL",
    undefined,
    undefined,
    undefined,
    "TL",
    undefined,
    undefined,
    undefined,
    "TL",
    undefined,
    undefined,
    undefined,
    "TL",
    undefined,
  ],
  [
    undefined,
    undefined,
    "DL",
    undefined,
    undefined,
    undefined,
    "DL",
    undefined,
    "DL",
    undefined,
    undefined,
    undefined,
    "DL",
    undefined,
    undefined,
  ],
  [
    "TW",
    undefined,
    undefined,
    "DL",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "DL",
    undefined,
    undefined,
    "TW",
  ],
  [
    undefined,
    undefined,
    "DL",
    undefined,
    undefined,
    undefined,
    "DL",
    undefined,
    "DL",
    undefined,
    undefined,
    undefined,
    "DL",
    undefined,
    undefined,
  ],
  [
    undefined,
    "TL",
    undefined,
    undefined,
    undefined,
    "TL",
    undefined,
    undefined,
    undefined,
    "TL",
    undefined,
    undefined,
    undefined,
    "TL",
    undefined,
  ],
  [
    undefined,
    undefined,
    undefined,
    undefined,
    "DW",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "DW",
    undefined,
    undefined,
    undefined,
    undefined,
  ],
  [
    "DL",
    undefined,
    undefined,
    "DW",
    undefined,
    undefined,
    undefined,
    "DL",
    undefined,
    undefined,
    undefined,
    "DW",
    undefined,
    undefined,
    "DL",
  ],
  [
    undefined,
    undefined,
    "DW",
    undefined,
    undefined,
    undefined,
    "DL",
    undefined,
    "DL",
    undefined,
    undefined,
    undefined,
    "DW",
    undefined,
    undefined,
  ],
  [
    undefined,
    "DW",
    undefined,
    undefined,
    undefined,
    "TL",
    undefined,
    undefined,
    undefined,
    "TL",
    undefined,
    undefined,
    undefined,
    "DW",
    undefined,
  ],
  [
    "TW",
    undefined,
    undefined,
    "DL",
    undefined,
    undefined,
    undefined,
    "TW",
    undefined,
    undefined,
    undefined,
    "DL",
    undefined,
    undefined,
    "TW",
  ],
];

const LETTER_DISTRIBUTION: Record<string, { count: number; points: number }> = {
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
  "?": { count: 2, points: 0 },
};

const games = new Map<string, GameState>();

function generateTileBag(): Tile[] {
  const tiles: Tile[] = [];
  let id = 0;
  Object.entries(LETTER_DISTRIBUTION).forEach(([letter, { count, points }]) => {
    for (let i = 0; i < count; i++)
      tiles.push({ id: `t${id++}`, letter, points, isBlank: letter === "?" });
  });
  return shuffle(tiles);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function draw(tileBag: Tile[], n: number): Tile[] {
  return tileBag.splice(0, Math.min(n, tileBag.length));
}

export function initGameForRoom(room: LobbyRoom) {
  // Require exactly 2 players
  if (room.players.length !== 2)
    throw new Error("Game requires exactly 2 players");

  const bag = generateTileBag();
  const players: PlayerState[] = room.players.map((p) => ({
    id: p.id,
    name: p.name,
    score: 0,
    rack: draw(bag, 7),
  }));

  const game: GameState = {
    roomId: room.id,
    board: Array.from({ length: 15 }, () =>
      Array.from({ length: 15 }, () => null),
    ),
    players,
    currentPlayerId: room.hostId,
    tileBag: bag,
    tilesRemaining: bag.length,
    turnNumber: 1,
    startedAt: new Date().toISOString(),
  };
  games.set(room.id, game);
}

function getGameOr404(roomId: string) {
  const g = games.get(roomId);
  if (!g) throw Object.assign(new Error("Game not found"), { code: 404 });
  return g;
}

// Helpers for words/scoring
function getLetterPoints(letter: string) {
  return LETTER_DISTRIBUTION[letter.toUpperCase()]?.points || 0;
}

function calculateWordScore(
  word: string,
  positions: Array<{ row: number; col: number }>,
  newPositions: Array<{ row: number; col: number }>,
) {
  let score = 0;
  let wordMult = 1;
  positions.forEach(({ row, col }, i) => {
    const letter = word[i];
    const isNew = newPositions.some((p) => p.row === row && p.col === col);
    let letterScore = getLetterPoints(letter);
    let letterMult = 1;
    if (isNew) {
      const premium = PREMIUM_SQUARES[row]?.[col];
      if (premium === "DL") letterMult = 2;
      else if (premium === "TL") letterMult = 3;
      else if (premium === "DW") wordMult *= 2;
      else if (premium === "TW") wordMult *= 3;
    }
    score += letterScore * letterMult;
  });
  return score * wordMult;
}

function extendWord(
  board: (BoardTile | null)[][],
  row: number,
  col: number,
  dir: "h" | "v",
) {
  let r = row,
    c = col;
  while (r > 0 && (dir === "v" ? board[r - 1][c] : board[r][c - 1])) {
    if (dir === "v") r--;
    else c--;
  }
  const positions: { row: number; col: number }[] = [];
  const letters: string[] = [];
  while (r < 15 && c < 15 && board[r][c]) {
    positions.push({ row: r, col: c });
    letters.push(board[r][c]!.tile.letter);
    if (dir === "v") r++;
    else c++;
  }
  return { word: letters.join(""), positions };
}

// Handlers
export const getGameStateHandler: RequestHandler = (req, res) => {
  const roomId = req.params.id;
  const playerId = String(req.query.playerId || "");
  let game: GameState;
  try {
    game = getGameOr404(roomId);
  } catch (e: any) {
    return res.status(e.code || 500).json({ error: e.message });
  }

  const redactedPlayers = game.players.map((p) => ({
    id: p.id,
    name: p.name,
    score: p.score,
    rack: p.id === playerId ? p.rack : ([] as Tile[]),
    rackCount: p.rack.length,
  }));

  res.json({
    roomId: game.roomId,
    board: game.board,
    players: redactedPlayers,
    currentPlayerId: game.currentPlayerId,
    tilesRemaining: game.tilesRemaining,
    turnNumber: game.turnNumber,
    lastWord: game.lastWord,
    lastScore: game.lastScore,
  });
};

export const playMoveHandler: RequestHandler = (req, res) => {
  const roomId = req.params.id;
  const { playerId, placements } = req.body as {
    playerId: string;
    placements: Array<{
      row: number;
      col: number;
      tileId: string;
      letter?: string;
    }>;
  };
  let game: GameState;
  try {
    game = getGameOr404(roomId);
  } catch (e: any) {
    return res.status(e.code || 500).json({ error: e.message });
  }
  if (game.currentPlayerId !== playerId)
    return res.status(400).json({ error: "Not your turn" });
  if (!placements || placements.length === 0)
    return res.status(400).json({ error: "No tiles placed" });

  const player = game.players.find((p) => p.id === playerId)!;
  // Validate tiles belong to player
  const rackIds = new Set(player.rack.map((t) => t.id));
  for (const pl of placements)
    if (!rackIds.has(pl.tileId))
      return res.status(400).json({ error: "Invalid tile" });

  const sameRow = placements.every((p) => p.row === placements[0].row);
  const sameCol = placements.every((p) => p.col === placements[0].col);
  if (!sameRow && !sameCol)
    return res
      .status(400)
      .json({ error: "Tiles must be in one row or column" });

  // No overwrite existing tiles
  for (const p of placements)
    if (game.board[p.row][p.col])
      return res.status(400).json({ error: "Square occupied" });

  // First move must cover center
  const isFirstMove =
    game.turnNumber === 1 &&
    game.players.every((pl) => pl.score === 0) &&
    game.board.flat().every((c) => c === null);
  if (isFirstMove && !placements.some((p) => p.row === 7 && p.col === 7))
    return res.status(400).json({ error: "First word must cover center" });

  // Check contiguity with existing board or among themselves
  const dir: "h" | "v" = sameRow ? "h" : "v";
  const coords = placements.map((p) => ({ row: p.row, col: p.col }));
  const minR = Math.min(...coords.map((p) => p.row));
  const maxR = Math.max(...coords.map((p) => p.row));
  const minC = Math.min(...coords.map((p) => p.col));
  const maxC = Math.max(...coords.map((p) => p.col));
  // Ensure no gaps in main word span
  for (let r = minR; r <= maxR; r++)
    for (let c = minC; c <= maxC; c++) {
      if (
        (dir === "h" && r === placements[0].row) ||
        (dir === "v" && c === placements[0].col)
      ) {
        if (
          !game.board[r][c] &&
          !placements.find((p) => p.row === r && p.col === c)
        )
          return res.status(400).json({ error: "Tiles must be contiguous" });
      }
    }

  // Build temp board
  const tempBoard = game.board.map((row) => row.slice());
  const newPositions: { row: number; col: number }[] = [];
  // Map placements to tiles
  const tilesById = new Map(player.rack.map((t) => [t.id, t] as const));
  for (const p of placements) {
    const rackTile = tilesById.get(p.tileId)!;
    const letter =
      rackTile.isBlank && p.letter ? p.letter.toUpperCase() : rackTile.letter;
    tempBoard[p.row][p.col] = {
      row: p.row,
      col: p.col,
      tile: { ...rackTile, letter },
    };
    newPositions.push({ row: p.row, col: p.col });
  }

  // Find all words
  const main =
    dir === "h"
      ? extendWord(
          tempBoard,
          placements[0].row,
          Math.min(...placements.map((p) => p.col)),
          "h",
        )
      : extendWord(
          tempBoard,
          Math.min(...placements.map((p) => p.row)),
          placements[0].col,
          "v",
        );
  const words: { word: string; positions: { row: number; col: number }[] }[] =
    [];
  if (main.word.length >= 2) words.push(main);
  for (const p of placements) {
    const cross =
      dir === "h"
        ? extendWord(tempBoard, p.row, p.col, "v")
        : extendWord(tempBoard, p.row, p.col, "h");
    if (cross.word.length >= 2) words.push(cross);
  }
  if (words.length === 0)
    return res.status(400).json({ error: "No valid word formed" });

  // Score
  let totalScore = 0;
  for (const w of words)
    totalScore += calculateWordScore(w.word, w.positions, newPositions);

  // Commit: remove tiles from rack
  for (const p of placements) {
    const idx = player.rack.findIndex((t) => t.id === p.tileId);
    if (idx >= 0) player.rack.splice(idx, 1);
  }
  // Place tiles on real board
  for (const p of placements)
    game.board[p.row][p.col] = tempBoard[p.row][p.col];

  // Draw
  const newTiles = draw(
    game.tileBag,
    Math.min(7 - player.rack.length, game.tileBag.length),
  );
  player.rack.push(...newTiles);
  game.tilesRemaining = game.tileBag.length;

  // Update score and turn
  player.score += totalScore;
  const other = game.players.find((p) => p.id !== player.id)!;
  game.currentPlayerId = other.id;
  game.turnNumber += 1;
  game.lastWord = words[0]?.word;
  game.lastScore = totalScore;

  return res.json({ ok: true });
};

export const passTurnHandler: RequestHandler = (req, res) => {
  const roomId = req.params.id;
  const { playerId } = req.body as { playerId: string };
  let game: GameState;
  try {
    game = getGameOr404(roomId);
  } catch (e: any) {
    return res.status(e.code || 500).json({ error: e.message });
  }
  if (game.currentPlayerId !== playerId)
    return res.status(400).json({ error: "Not your turn" });
  const other = game.players.find((p) => p.id !== playerId)!;
  game.currentPlayerId = other.id;
  game.turnNumber += 1;
  res.json({ ok: true });
};
