import React from 'react';
import { TileComponent } from './TileComponent';
import { PlacedTile, PremiumType } from '@/lib/scrabble/types';
import { cn } from '@/lib/utils';

interface BoardSquareProps {
  row: number;
  col: number;
  placedTile?: PlacedTile;
  premiumType?: PremiumType;
  onSquareClick: (row: number, col: number) => void;
  isCenter: boolean;
  canPlaceTile: boolean;
}

export function BoardSquare({ 
  row, 
  col, 
  placedTile, 
  premiumType, 
  onSquareClick,
  isCenter,
  canPlaceTile
}: BoardSquareProps) {
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
      onClick={() => onSquareClick(row, col)}
      className={cn(
        "relative w-8 h-8 border-2 flex items-center justify-center text-xs font-bold",
        "transition-all duration-200 cursor-pointer",
        getPremiumStyle(),
        canPlaceTile && "ring-2 ring-blue-400 ring-opacity-75 scale-105 hover:scale-110",
        placedTile && "cursor-default"
      )}
    >
      {placedTile ? (
        <TileComponent
          tile={placedTile.tile}
          isPlaced={true}
        />
      ) : (
        <div className="text-center leading-none whitespace-pre-line">
          {getPremiumText()}
        </div>
      )}
    </div>
  );
}
