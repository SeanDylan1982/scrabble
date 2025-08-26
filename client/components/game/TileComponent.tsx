import React from 'react';
import { useDrag } from 'react-dnd';
import { Tile } from '@/lib/scrabble/types';
import { cn } from '@/lib/utils';

interface TileComponentProps {
  tile: Tile;
  isSelected?: boolean;
  isPlaced?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
}

export function TileComponent({ 
  tile, 
  isSelected = false, 
  isPlaced = false,
  onClick,
  onDoubleClick,
  className
}: TileComponentProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'tile',
    item: { ...tile, fromRack: !isPlaced },
    canDrag: !isPlaced,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const getLetterDisplay = () => {
    if (tile.isBlank && tile.letter !== '?') {
      return tile.letter.toLowerCase();
    }
    return tile.letter;
  };

  return (
    <div
      ref={drag}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        "relative w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200",
        "border-2 border-amber-300 rounded-lg shadow-lg",
        "flex items-center justify-center cursor-pointer",
        "transition-all duration-200 transform",
        "hover:scale-105 hover:shadow-xl",
        !isPlaced && "hover:rotate-1",
        isSelected && "ring-2 ring-blue-400 ring-opacity-75 scale-105",
        isPlaced && "cursor-default scale-90",
        isDragging && "opacity-50 rotate-12 scale-110",
        tile.isBlank && "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300",
        className
      )}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {/* Letter */}
      <span className={cn(
        "text-lg font-bold text-gray-800 select-none",
        tile.isBlank && "text-gray-600"
      )}>
        {getLetterDisplay()}
      </span>
      
      {/* Point value */}
      <span className={cn(
        "absolute bottom-0 right-0 text-xs font-semibold",
        "bg-white rounded-tl-md px-1 leading-none",
        "text-gray-600 border-l border-t border-amber-300",
        tile.isBlank && "border-gray-300"
      )}>
        {tile.points}
      </span>
      
      {/* Special effects for blank tiles */}
      {tile.isBlank && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-30 rounded-lg"></div>
      )}
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-20 rounded-lg pointer-events-none"></div>
    </div>
  );
}
