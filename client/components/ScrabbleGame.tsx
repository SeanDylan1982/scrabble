import React, { useState, useCallback, useEffect } from 'react';
import { GameBoard } from './game/GameBoard';
import { PlayerRack } from './game/PlayerRack';
import { GameHeader } from './game/GameHeader';
import { ScoreBoard } from './game/ScoreBoard';
import { GameControls } from './game/GameControls';
import { useGameState } from '@/hooks/useGameState';
import { cn } from '@/lib/utils';

export function ScrabbleGame() {
  const {
    gameState,
    currentPlayer,
    players,
    placedTiles,
    selectedTiles,
    gamePhase,
    actions
  } = useGameState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto px-4 py-6">
        <GameHeader 
          gamePhase={gamePhase}
          currentPlayer={currentPlayer}
          onNewGame={actions.startNewGame}
        />
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
          {/* Main game area */}
          <div className="xl:col-span-3 space-y-6">
            <div className="flex justify-center">
              <GameBoard
                placedTiles={placedTiles}
                onTilePlaced={actions.placeTile}
                onTileRemoved={actions.removeTile}
                selectedTiles={selectedTiles}
              />
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <PlayerRack
                player={currentPlayer}
                onTileSelect={actions.selectTile}
                onTileDeselect={actions.deselectTile}
                selectedTiles={selectedTiles}
              />
            </div>
            
            <GameControls
              onPlayWord={actions.playWord}
              onShuffle={actions.shuffleRack}
              onRecall={actions.recallTiles}
              onPass={actions.passTurn}
              onExchange={actions.exchangeTiles}
              gamePhase={gamePhase}
              hasSelectedTiles={selectedTiles.length > 0}
              hasPlacedTiles={placedTiles.length > 0}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <ScoreBoard players={players} currentPlayer={currentPlayer} />
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Game Stats</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Tiles remaining:</span>
                  <span className="font-medium">{gameState.tilesRemaining}</span>
                </div>
                <div className="flex justify-between">
                  <span>Turn:</span>
                  <span className="font-medium">{gameState.turnNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last word:</span>
                  <span className="font-medium">{gameState.lastWord || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last score:</span>
                  <span className="font-medium">{gameState.lastScore || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
