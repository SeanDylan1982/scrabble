import React, { useState, useCallback, useEffect } from "react";
import { GameBoard } from "./game/GameBoard";
import { PlayerRack } from "./game/PlayerRack";
import { GameHeader } from "./game/GameHeader";
import { ScoreBoard } from "./game/ScoreBoard";
import { GameControls } from "./game/GameControls";
import { useGameState } from "@/hooks/useGameState";
import { cn } from "@/lib/utils";

type Mode = "solo" | "server";

interface Props {
  mode?: Mode;
  roomId?: string;
}

export function ScrabbleGame({ mode = "solo", roomId }: Props) {
  const solo = useGameState();
  const { useServerGame } = require("@/hooks/useServerGame");
  const server = mode === "server" && roomId ? useServerGame(roomId) : null;

  const gameState = server
    ? {
        tilesRemaining: server.state?.tilesRemaining || 0,
        turnNumber: server.state?.turnNumber || 1,
        lastWord: server.state?.lastWord,
        lastScore: server.state?.lastScore,
      }
    : solo.gameState;

  const currentPlayer = server
    ? server.me
      ? {
          id: server.me.id,
          name: server.me.name,
          score: server.me.score,
          rack: server.me.rack,
          isCurrentPlayer: server.currentPlayer?.id === server.me.id,
        }
      : { id: "me", name: "You", score: 0, rack: [], isCurrentPlayer: false }
    : solo.currentPlayer;

  const players = server
    ? server.state?.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        rack: p.rack,
        isCurrentPlayer: server.state?.currentPlayerId === p.id,
      })) || []
    : solo.players;

  const placedTiles = server
    ? server.placedTiles.map((pt) => ({
        row: pt.row,
        col: pt.col,
        tile: pt.tile,
      }))
    : solo.placedTiles;
  const selectedTiles = server ? server.selectedTiles : solo.selectedTiles;

  const gamePhase = server ? ("playing" as const) : solo.gamePhase;

  const actions = server
    ? {
        startNewGame: () => {},
        placeTile: (row: number, col: number) =>
          server.actions.placeTile(row, col),
        removeTile: (row: number, col: number) =>
          server.actions.removeTile(row, col),
        selectTile: (tile: any) => server.actions.selectTile(tile),
        deselectTile: (tileId: string) => server.actions.deselectTile(tileId),
        playWord: () => server.actions.playWord(),
        shuffleRack: () => server.actions.shuffleRack(),
        recallTiles: () => server.actions.recallTiles(),
        passTurn: () => server.actions.passTurn(),
        exchangeTiles: () => {},
      }
    : solo.actions;

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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Game Stats
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Tiles remaining:</span>
                  <span className="font-medium">
                    {gameState.tilesRemaining}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Turn:</span>
                  <span className="font-medium">{gameState.turnNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last word:</span>
                  <span className="font-medium">
                    {gameState.lastWord || "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last score:</span>
                  <span className="font-medium">
                    {gameState.lastScore || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
