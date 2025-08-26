import React from 'react';
import { Player } from '@/lib/scrabble/types';
import { Crown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreBoardProps {
  players: Player[];
  currentPlayer: Player;
}

export function ScoreBoard({ players, currentPlayer }: ScoreBoardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const leader = sortedPlayers[0];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-500" />
        Scoreboard
      </h3>
      
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-all",
              player.id === currentPlayer.id 
                ? "bg-green-50 border-2 border-green-200" 
                : "bg-gray-50 border border-gray-200",
              "hover:shadow-md"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                index === 0 
                  ? "bg-yellow-100 text-yellow-800" 
                  : index === 1
                  ? "bg-gray-100 text-gray-700"
                  : index === 2
                  ? "bg-orange-100 text-orange-700"
                  : "bg-blue-100 text-blue-700"
              )}>
                {index + 1}
              </div>
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className={cn(
                  "font-medium",
                  player.id === currentPlayer.id ? "text-green-700" : "text-gray-700"
                )}>
                  {player.name}
                </span>
                {player.id === leader.id && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
                {player.id === currentPlayer.id && (
                  <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-medium">
                    Playing
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className={cn(
                "text-lg font-bold",
                player.id === currentPlayer.id ? "text-green-600" : "text-gray-800"
              )}>
                {player.score}
              </div>
              <div className="text-xs text-gray-500">
                {player.rack.length} tiles
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Game statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-800">{players.length}</div>
            <div className="text-gray-600">Players</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">{leader.score}</div>
            <div className="text-gray-600">High Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
