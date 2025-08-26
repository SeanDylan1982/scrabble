import React from 'react';
import { useDrop } from 'react-dnd';
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
  const [{ isOver }, drop] = useDrop({
    accept: 'tile',
    drop: (item: SelectedTile, monitor) => {
      if (!monitor.didDrop()) {
        // Handle dropping on the board generally
        return;
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

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
        onTilePlaced={onTilePlaced}
        onTileRemoved={onTileRemoved}
        isCenter={row === 7 && col === 7}
      />
    );
  };

  return (
    <div 
      ref={drop}
      className={cn(
        "relative bg-emerald-900 p-4 rounded-2xl shadow-2xl",
        "border-4 border-emerald-800",
        isOver && "ring-4 ring-blue-400 ring-opacity-50"
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
    </div>
  );
}
