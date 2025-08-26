import React from 'react';
import { useDrop } from 'react-dnd';
import { TileComponent } from './TileComponent';
import { PlacedTile, SelectedTile, PremiumType } from '@/lib/scrabble/types';
import { cn } from '@/lib/utils';

interface BoardSquareProps {
  row: number;
  col: number;
  placedTile?: PlacedTile;
  premiumType?: PremiumType;
  onTilePlaced: (row: number, col: number, tile: SelectedTile) => void;
  onTileRemoved: (row: number, col: number) => void;
  isCenter: boolean;
}

export function BoardSquare({ 
  row, 
  col, 
  placedTile, 
  premiumType, 
  onTilePlaced, 
  onTileRemoved,
  isCenter 
}: BoardSquareProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'tile',
    drop: (item: SelectedTile) => {
      if (!placedTile) {
        onTilePlaced(row, col, item);
      }
    },
    canDrop: () => !placedTile,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const getPremiumStyle = () => {
    switch (premiumType) {
      case 'TW':
        return 'bg-red-500 text-white border-red-600';
      case 'DW':
        return 'bg-pink-400 text-white border-pink-500';
      case 'TL':
        return 'bg-blue-500 text-white border-blue-600';
      case 'DL':
        return 'bg-sky-400 text-white border-sky-500';
      default:
        return isCenter 
          ? 'bg-yellow-400 text-gray-800 border-yellow-500'
          : 'bg-amber-50 border-amber-200';
    }
  };

  const getPremiumText = () => {
    switch (premiumType) {
      case 'TW':
        return 'TRIPLE\nWORD\nSCORE';
      case 'DW':
        return 'DOUBLE\nWORD\nSCORE';
      case 'TL':
        return 'TRIPLE\nLETTER\nSCORE';
      case 'DL':
        return 'DOUBLE\nLETTER\nSCORE';
      default:
        return isCenter ? '★' : '';
    }
  };

  return (
    <div
      ref={drop}
      className={cn(
        "relative w-8 h-8 border-2 flex items-center justify-center text-xs font-bold",
        "transition-all duration-200 cursor-pointer",
        getPremiumStyle(),
        isOver && canDrop && "ring-2 ring-blue-400 ring-opacity-75 scale-105",
        isOver && !canDrop && "ring-2 ring-red-400 ring-opacity-75"
      )}
    >
      {placedTile ? (
        <TileComponent
          tile={placedTile.tile}
          isPlaced={true}
          onClick={() => onTileRemoved(row, col)}
        />
      ) : (
        <div className="text-center leading-none whitespace-pre-line">
          {getPremiumText()}
        </div>
      )}
    </div>
  );
}
