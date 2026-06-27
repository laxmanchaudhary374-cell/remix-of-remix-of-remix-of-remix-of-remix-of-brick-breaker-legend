import React from 'react';
import { RotateCcw, Trophy, Skull, Home } from 'lucide-react';
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
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10"
      style={{ background: 'radial-gradient(ellipse at center, rgba(20, 5, 30, 0.95) 0%, rgba(5, 5, 15, 0.98) 100%)' }}
    >
      {/* Skull icon */}
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{
          background: 'radial-gradient(circle, rgba(200, 30, 30, 0.3) 0%, rgba(100, 10, 10, 0.1) 100%)',
          border: '2px solid rgba(255, 50, 50, 0.5)',
          boxShadow: '0 0 30px rgba(255, 50, 50, 0.3)',
        }}
      >
        <Skull className="w-10 h-10 text-red-400" />
      </div>
      
      <h2 className="font-display text-4xl font-black mb-2"
        style={{ color: '#ff4444', textShadow: '0 0 20px rgba(255, 50, 50, 0.5)' }}
      >
        GAME OVER
      </h2>
      
      <p className="font-display text-lg mb-6" style={{ color: '#6688aa' }}>
        Level {gameState.level}
      </p>

      {/* Score card */}
      <div 
        className="px-8 py-4 rounded-xl mb-4 text-center"
        style={{
          background: 'linear-gradient(135deg, #0d1f3a 0%, #081428 100%)',
          border: '1.5px solid rgba(60, 120, 200, 0.4)',
          boxShadow: '0 0 20px rgba(50, 80, 200, 0.15)',
        }}
      >
        <span className="font-display text-3xl text-white font-black">
          {gameState.score.toLocaleString()}
        </span>
        <p className="text-xs mt-1" style={{ color: '#5577aa' }}>POINTS</p>
      </div>

      {isNewHighScore && (
        <div 
          className="flex items-center gap-2 mb-6 px-5 py-2.5 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 200, 0, 0.15) 0%, rgba(200, 150, 0, 0.05) 100%)',
            border: '1.5px solid rgba(255, 200, 0, 0.5)',
            boxShadow: '0 0 15px rgba(255, 200, 0, 0.2)',
          }}
        >
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="font-display text-sm text-yellow-300 animate-pulse">
            NEW HIGH SCORE!
          </span>
        </div>
      )}

      <div className="flex gap-4 mt-2">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-display text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(180deg, #00bbcc 0%, #007788 100%)',
            border: '1.5px solid #00ddff',
            boxShadow: '0 4px 15px rgba(0, 200, 255, 0.3)',
          }}
        >
          <RotateCcw className="w-4 h-4" />
          TRY AGAIN
        </button>
        
        <button
          onClick={onMainMenu}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-display text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(180deg, #2255bb 0%, #1a3388 100%)',
            border: '1.5px solid #4488dd',
            boxShadow: '0 4px 15px rgba(50, 100, 200, 0.3)',
          }}
        >
          <Home className="w-4 h-4" />
          MENU
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
