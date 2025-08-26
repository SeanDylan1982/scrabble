import React from 'react';
import { Player, GamePhase } from '@/lib/scrabble/types';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameHeaderProps {
  gamePhase: GamePhase;
  currentPlayer: Player;
  onNewGame: () => void;
}

export function GameHeader({ gamePhase, currentPlayer, onNewGame }: GameHeaderProps) {
  const getPhaseDisplay = () => {
    switch (gamePhase) {
      case 'waiting':
        return { text: 'Waiting for players...', color: 'text-yellow-600', icon: Users };
      case 'playing':
        return { text: 'Game in progress', color: 'text-green-600', icon: Play };
      case 'validating':
        return { text: 'Validating word...', color: 'text-blue-600', icon: RefreshCw };
      case 'scoring':
        return { text: 'Calculating score...', color: 'text-purple-600', icon: RefreshCw };
      case 'finished':
        return { text: 'Game finished!', color: 'text-gray-600', icon: Users };
      default:
        return { text: 'Ready to play', color: 'text-gray-600', icon: Play };
    }
  };

  const phase = getPhaseDisplay();
  const Icon = phase.icon;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl shadow-lg">
            <div className="text-white font-bold text-2xl">S</div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Scrabble Online
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Icon 
                className={cn("w-4 h-4", phase.color)} 
                {...(gamePhase === 'validating' || gamePhase === 'scoring' ? { 
                  className: cn("w-4 h-4 animate-spin", phase.color) 
                } : {})}
              />
              <span className={cn("text-sm font-medium", phase.color)}>
                {phase.text}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Current Player</div>
            <div className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {currentPlayer.name}
            </div>
          </div>
          
          <Button
            onClick={onNewGame}
            variant="outline"
            className="gap-2 hover:bg-green-50 hover:border-green-300"
          >
            <RefreshCw className="w-4 h-4" />
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
}
