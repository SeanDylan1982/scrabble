import { useState, useCallback, useEffect } from 'react';
import { 
  GameState, 
  Player, 
  Tile, 
  SelectedTile, 
  PlacedTile, 
  GamePhase, 
  GameActions 
} from '@/lib/scrabble/types';
import { LETTER_DISTRIBUTION, RACK_SIZE, BINGO_BONUS } from '@/lib/scrabble/constants';
import { generateTileBag, drawTiles, shuffleArray } from '@/lib/scrabble/utils';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());
  const [selectedTiles, setSelectedTiles] = useState<SelectedTile[]>([]);
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const players = gameState.players;
  const gamePhase = gameState.gamePhase;

  // Initialize a new game
  function initializeGame(): GameState {
    const tileBag = generateTileBag();
    const players: Player[] = [
      {
        id: 'player1',
        name: 'You',
        score: 0,
        rack: drawTiles(tileBag, RACK_SIZE),
        isCurrentPlayer: true,
      },
      {
        id: 'player2',
        name: 'AI Player',
        score: 0,
        rack: drawTiles(tileBag, RACK_SIZE),
        isCurrentPlayer: false,
      }
    ];

    return {
      board: Array(15).fill(null).map(() => Array(15).fill(null)),
      players,
      currentPlayerIndex: 0,
      tileBag,
      tilesRemaining: tileBag.length,
      turnNumber: 1,
      gamePhase: 'playing',
      gameHistory: [],
    };
  }

  const startNewGame = useCallback(() => {
    const newGame = initializeGame();
    setGameState(newGame);
    setSelectedTiles([]);
    setPlacedTiles([]);
  }, []);

  const selectTile = useCallback((tile: Tile, index: number) => {
    if (selectedTiles.find(selected => selected.id === tile.id)) return;
    
    setSelectedTiles(prev => [...prev, {
      ...tile,
      fromRack: true,
      originalIndex: index
    }]);
  }, [selectedTiles]);

  const deselectTile = useCallback((tileId: string) => {
    setSelectedTiles(prev => prev.filter(tile => tile.id !== tileId));
  }, []);

  const placeTile = useCallback((row: number, col: number, tile: SelectedTile) => {
    // Remove from selected tiles
    setSelectedTiles(prev => prev.filter(t => t.id !== tile.id));
    
    // Add to placed tiles
    setPlacedTiles(prev => [...prev, {
      row,
      col,
      tile: { ...tile },
      isTemporary: true
    }]);
  }, []);

  const removeTile = useCallback((row: number, col: number) => {
    const removedTile = placedTiles.find(tile => tile.row === row && tile.col === col);
    if (removedTile) {
      setPlacedTiles(prev => prev.filter(tile => !(tile.row === row && tile.col === col)));
      // Add back to selected tiles if it was from rack
      setSelectedTiles(prev => [...prev, {
        ...removedTile.tile,
        fromRack: true
      }]);
    }
  }, [placedTiles]);

  const playWord = useCallback(() => {
    if (placedTiles.length === 0) return;

    setGameState(prev => ({ ...prev, gamePhase: 'validating' }));

    // Simulate word validation and scoring
    setTimeout(() => {
      const wordScore = calculateScore(placedTiles);
      const word = extractWord(placedTiles);
      
      setGameState(prev => {
        const newState = { ...prev };
        
        // Update current player's score
        newState.players[prev.currentPlayerIndex].score += wordScore;
        
        // Remove played tiles from rack
        const playedTileIds = placedTiles.map(pt => pt.tile.id);
        newState.players[prev.currentPlayerIndex].rack = 
          newState.players[prev.currentPlayerIndex].rack.filter(
            tile => !playedTileIds.includes(tile.id)
          );
        
        // Draw new tiles
        const newTiles = drawTiles(newState.tileBag, Math.min(
          RACK_SIZE - newState.players[prev.currentPlayerIndex].rack.length,
          newState.tileBag.length
        ));
        newState.players[prev.currentPlayerIndex].rack.push(...newTiles);
        newState.tilesRemaining = newState.tileBag.length;
        
        // Place tiles permanently on board
        placedTiles.forEach(placedTile => {
          newState.board[placedTile.row][placedTile.col] = {
            ...placedTile,
            isTemporary: false
          };
        });
        
        // Move to next player
        newState.currentPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
        newState.players.forEach((player, index) => {
          player.isCurrentPlayer = index === newState.currentPlayerIndex;
        });
        
        newState.turnNumber += 1;
        newState.gamePhase = 'playing';
        newState.lastWord = word;
        newState.lastScore = wordScore;
        
        return newState;
      });
      
      setPlacedTiles([]);
      setSelectedTiles([]);
    }, 1500);
  }, [placedTiles]);

  const shuffleRack = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev };
      newState.players[prev.currentPlayerIndex].rack = 
        shuffleArray([...newState.players[prev.currentPlayerIndex].rack]);
      return newState;
    });
  }, []);

  const recallTiles = useCallback(() => {
    // Return all placed tiles to selected tiles
    setSelectedTiles(prev => [
      ...prev,
      ...placedTiles.map(pt => ({ ...pt.tile, fromRack: true }))
    ]);
    setPlacedTiles([]);
  }, [placedTiles]);

  const passTurn = useCallback(() => {
    // Move to next player without scoring
    setGameState(prev => {
      const newState = { ...prev };
      newState.currentPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      newState.players.forEach((player, index) => {
        player.isCurrentPlayer = index === newState.currentPlayerIndex;
      });
      newState.turnNumber += 1;
      return newState;
    });
    
    setSelectedTiles([]);
    setPlacedTiles([]);
  }, []);

  const exchangeTiles = useCallback((tiles: Tile[]) => {
    // Implementation for exchanging tiles
    console.log('Exchange tiles:', tiles);
  }, []);

  const actions: GameActions = {
    startNewGame,
    placeTile,
    removeTile,
    selectTile,
    deselectTile,
    playWord,
    shuffleRack,
    recallTiles,
    passTurn,
    exchangeTiles,
  };

  return {
    gameState,
    currentPlayer,
    players,
    placedTiles,
    selectedTiles,
    gamePhase,
    actions,
  };
}

// Helper functions
function calculateScore(placedTiles: PlacedTile[]): number {
  // Simplified scoring - just sum tile values
  const baseScore = placedTiles.reduce((sum, tile) => sum + tile.tile.points, 0);
  
  // Add bonus for using all 7 tiles
  if (placedTiles.length === 7) {
    return baseScore + BINGO_BONUS;
  }
  
  return baseScore;
}

function extractWord(placedTiles: PlacedTile[]): string {
  // Simplified word extraction - sort by position and concatenate
  const sorted = [...placedTiles].sort((a, b) => {
    if (a.row === b.row) return a.col - b.col;
    return a.row - b.row;
  });
  
  return sorted.map(tile => tile.tile.letter).join('');
}
