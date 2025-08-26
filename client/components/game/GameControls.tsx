import React from 'react';
import { Button } from '@/components/ui/button';
import { GamePhase } from '@/lib/scrabble/types';
import { 
  Play, 
  Shuffle, 
  ArrowLeft, 
  SkipForward, 
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  onPlayWord: () => void;
  onShuffle: () => void;
  onRecall: () => void;
  onPass: () => void;
  onExchange: () => void;
  gamePhase: GamePhase;
  hasSelectedTiles: boolean;
  hasPlacedTiles: boolean;
}

export function GameControls({
  onPlayWord,
  onShuffle,
  onRecall,
  onPass,
  onExchange,
  gamePhase,
  hasSelectedTiles,
  hasPlacedTiles
}: GameControlsProps) {
  const isGameActive = gamePhase === 'playing';
  const isProcessing = gamePhase === 'validating' || gamePhase === 'scoring';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Game Controls</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Play Word */}
        <Button
          onClick={onPlayWord}
          disabled={!isGameActive || !hasPlacedTiles || isProcessing}
          className={cn(
            "flex items-center gap-2 bg-green-600 hover:bg-green-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Play Word
        </Button>

        {/* Recall Tiles */}
        <Button
          onClick={onRecall}
          disabled={!isGameActive || !hasPlacedTiles}
          variant="outline"
          className="flex items-center gap-2 hover:bg-orange-50 hover:border-orange-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Recall
        </Button>

        {/* Shuffle Rack */}
        <Button
          onClick={onShuffle}
          disabled={!isGameActive}
          variant="outline"
          className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
        >
          <Shuffle className="w-4 h-4" />
          Shuffle
        </Button>

        {/* Exchange Tiles */}
        <Button
          onClick={onExchange}
          disabled={!isGameActive || !hasSelectedTiles}
          variant="outline"
          className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-300"
        >
          <RefreshCw className="w-4 h-4" />
          Exchange
        </Button>

        {/* Pass Turn */}
        <Button
          onClick={onPass}
          disabled={!isGameActive}
          variant="outline"
          className="flex items-center gap-2 hover:bg-gray-50 hover:border-gray-400"
        >
          <SkipForward className="w-4 h-4" />
          Pass
        </Button>
      </div>

      {/* Action hints */}
      <div className="mt-4 space-y-2">
        {hasPlacedTiles && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-2">
            <CheckCircle className="w-4 h-4" />
            Tiles placed on board. Click "Play Word" to submit your move.
          </div>
        )}

        {hasSelectedTiles && !hasPlacedTiles && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-lg p-2">
            <CheckCircle className="w-4 h-4" />
            {hasSelectedTiles ? `${hasSelectedTiles} tile${hasSelectedTiles !== 1 ? 's' : ''} selected` : 'Tiles selected'}. Drag to board or click "Exchange".
          </div>
        )}

        {!hasPlacedTiles && !hasSelectedTiles && isGameActive && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
            <XCircle className="w-4 h-4" />
            Select tiles from your rack to place on the board.
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 rounded-lg p-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Processing your move...
          </div>
        )}
      </div>

      {/* Control descriptions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
          <div><strong>Play Word:</strong> Submit placed tiles as a word</div>
          <div><strong>Recall:</strong> Return placed tiles to your rack</div>
          <div><strong>Shuffle:</strong> Rearrange tiles in your rack</div>
          <div><strong>Exchange:</strong> Swap selected tiles for new ones</div>
        </div>
      </div>
    </div>
  );
}
