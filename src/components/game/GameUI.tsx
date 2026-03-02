import React from 'react';
import { GameState } from '@/types/game';
import { Heart, Zap, Coins } from 'lucide-react';

interface GameUIProps {
  gameState: GameState;
  persistentCoins?: number;
}

const GameUI: React.FC<GameUIProps> = ({ gameState, persistentCoins }) => {
  return (
    <div className="flex justify-between items-center w-full max-w-[400px] mx-auto mb-3 px-1 gap-2">
      {/* Lives Box */}
      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-neon-magenta/40 rounded-lg px-3 py-1.5">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: Math.min(gameState.lives, 3) }).map((_, i) => (
            <Heart
              key={i}
              className="w-4 h-4 text-neon-magenta fill-neon-magenta"
            />
          ))}
          {gameState.lives > 3 && (
            <span className="font-display text-xs text-neon-magenta ml-0.5">+{gameState.lives - 3}</span>
          )}
          {Array.from({ length: Math.max(0, 3 - Math.min(gameState.lives, 3)) }).map((_, i) => (
            <Heart
              key={`empty-${i}`}
              className="w-4 h-4 text-muted-foreground/30"
            />
          ))}
        </div>
      </div>

      {/* Level Box */}
      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-neon-yellow/40 rounded-lg px-3 py-1.5">
        <Zap className="w-4 h-4 text-neon-yellow" />
        <span className="font-display text-sm text-neon-yellow">
          Lv.{gameState.level}
        </span>
      </div>

      {/* Auto Timer - blinking white countdown */}
      {gameState.autoTimer && gameState.autoTimer > 0 ? (
        <div className="flex items-center bg-black/50 backdrop-blur-sm border border-white/40 rounded-lg px-3 py-1.5">
          <style>{`@keyframes blink-auto { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }`}</style>
          <span 
            className="font-display text-sm text-white font-bold"
            style={{ animation: 'blink-auto 1s step-end infinite' }}
          >
            {gameState.autoTimer}
          </span>
        </div>
      ) : null}

      {/* Coins Box */}
      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-neon-yellow/40 rounded-lg px-3 py-1.5">
        <Coins className="w-4 h-4 text-yellow-400" />
        <span className="font-display text-sm text-yellow-400">
          {(persistentCoins ?? 0) + gameState.coins}
        </span>
      </div>

      {/* Score Box */}
      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-neon-cyan/40 rounded-lg px-3 py-1.5">
        <span className="font-display text-sm text-neon-cyan text-glow-cyan">
          {gameState.score.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default GameUI;
