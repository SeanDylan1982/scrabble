import React from 'react';
import { BoardSquare } from './BoardSquare';
import { BOARD_SIZE, PREMIUM_SQUARES } from '@/lib/scrabble/constants';
import { PlacedTile, SelectedTile } from '@/lib/scrabble/types';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  placedTiles: PlacedTile[];
  onTilePlaced: (row: number, col: number, tile: SelectedTile) => void;
  onTileRemoved: (row: number, col: number) => void;
  selectedTiles: SelectedTile[];
}

export function GameBoard({ placedTiles, onTilePlaced, onTileRemoved, selectedTiles }: GameBoardProps) {
  const handleSquareClick = (row: number, col: number) => {
    const placedTile = placedTiles.find(tile => tile.row === row && tile.col === col);
    
    if (placedTile) {
      // Remove tile from board
      onTileRemoved(row, col);
    } else if (selectedTiles.length > 0) {
      // Place first selected tile
      onTilePlaced(row, col, selectedTiles[0]);
    }
  };

  const renderSquare = (row: number, col: number) => {
    const key = `${row}-${col}`;
    const placedTile = placedTiles.find(tile => tile.row === row && tile.col === col);
    const premiumType = PREMIUM_SQUARES[row]?.[col];
    
    return (
      <BoardSquare
        key={key}
        row={row}
        col={col}
        placedTile={placedTile}
        premiumType={premiumType}
        onSquareClick={handleSquareClick}
        isCenter={row === 7 && col === 7}
        canPlaceTile={selectedTiles.length > 0 && !placedTile}
      />
    );
  };

  return (
    <div 
      className={cn(
        "relative bg-emerald-900 p-4 rounded-2xl shadow-2xl",
        "border-4 border-emerald-800"
      )}
      style={{
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)
        `
      }}
    >
      <div className="grid grid-cols-15 gap-1 bg-emerald-800 p-2 rounded-xl">
        {Array.from({ length: BOARD_SIZE }, (_, row) =>
          Array.from({ length: BOARD_SIZE }, (_, col) => renderSquare(row, col))
        )}
      </div>
      
      {/* Board decorations */}
      <div className="absolute -top-2 -left-2 w-6 h-6 bg-emerald-700 rounded-full"></div>
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-700 rounded-full"></div>
      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-700 rounded-full"></div>
      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-700 rounded-full"></div>
      
      {/* Instructions */}
      {selectedTiles.length > 0 && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
          Click on board to place "{selectedTiles[0].letter}"
        </div>
      )}
    </div>
  );
}
