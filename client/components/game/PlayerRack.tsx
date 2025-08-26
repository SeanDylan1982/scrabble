import React from 'react';
import { TileComponent } from './TileComponent';
import { Player, Tile, SelectedTile } from '@/lib/scrabble/types';
import { cn } from '@/lib/utils';

interface PlayerRackProps {
  player: Player;
  onTileSelect: (tile: Tile, index: number) => void;
  onTileDeselect: (tileId: string) => void;
  selectedTiles: SelectedTile[];
}

export function PlayerRack({ player, onTileSelect, onTileDeselect, selectedTiles }: PlayerRackProps) {
  const isSelected = (tile: Tile) => 
    selectedTiles.some(selected => selected.id === tile.id);

  const handleTileClick = (tile: Tile, index: number) => {
    if (isSelected(tile)) {
      onTileDeselect(tile.id);
    } else {
      onTileSelect(tile, index);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          {player.name}'s Rack
        </h3>
        <div className="text-sm text-gray-600">
          Score: <span className="font-semibold text-green-600">{player.score}</span>
        </div>
      </div>
      
      <div className="relative">
        {/* Rack background */}
        <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 rounded-xl p-4 shadow-inner">
          <div className="bg-amber-900 rounded-lg p-2">
            <div className="flex justify-center items-center gap-2 min-h-[3rem]">
              {player.rack.map((tile, index) => (
                <div key={tile.id} className="relative">
                  <TileComponent
                    tile={tile}
                    isSelected={isSelected(tile)}
                    onClick={() => handleTileClick(tile, index)}
                    className="w-10 h-10"
                  />
                  {isSelected(tile) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: 7 - player.rack.length }, (_, index) => (
                <div
                  key={`empty-${index}`}
                  className="w-10 h-10 bg-amber-800 rounded-lg border-2 border-amber-600 opacity-50"
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Rack decorations */}
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-amber-900 rounded-r-full"></div>
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-8 bg-amber-900 rounded-l-full"></div>
      </div>
      
      {selectedTiles.length > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 text-sm text-blue-700">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            {selectedTiles.length} tile{selectedTiles.length !== 1 ? 's' : ''} selected
          </div>
        </div>
      )}
    </div>
  );
}
