import React from 'react';
import { RotateCcw, Trophy, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameState } from '@/types/game';

interface GameOverScreenProps {
  gameState: GameState;
  isNewHighScore: boolean;
  onRestart: () => void;
  onMainMenu: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  gameState,
  isNewHighScore,
  onRestart,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm z-10">
      <Skull className="w-16 h-16 text-destructive mb-4 animate-shake" />
      
      <h2 className="font-display text-4xl font-black text-destructive mb-2">
        GAME OVER
      </h2>
      
      <p className="font-game text-xl text-muted-foreground mb-6">
        Level {gameState.level}
      </p>

      <div className="flex items-center gap-3 mb-4">
        <span className="font-display text-3xl text-foreground">
          {gameState.score.toLocaleString()}
        </span>
        <span className="font-game text-muted-foreground">points</span>
      </div>

      {isNewHighScore && (
        <div className="flex items-center gap-2 mb-8 px-4 py-2 bg-neon-yellow/20 rounded-lg border border-neon-yellow/50">
          <Trophy className="w-5 h-5 text-neon-yellow" />
          <span className="font-display text-neon-yellow animate-pulse-neon">
            NEW HIGH SCORE!
          </span>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          onClick={onRestart}
          className="px-8 py-4 font-display bg-gradient-to-r from-neon-cyan to-neon-magenta hover:opacity-90"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          TRY AGAIN
        </Button>
        
        <Button
          onClick={onMainMenu}
          variant="outline"
          className="px-8 py-4 font-display border-muted-foreground/50 hover:bg-muted"
        >
          MENU
        </Button>
      </div>
    </div>
  );
};

export default GameOverScreen;
