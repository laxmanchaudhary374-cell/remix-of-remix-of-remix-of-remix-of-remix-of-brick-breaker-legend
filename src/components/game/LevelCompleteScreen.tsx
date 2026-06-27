import React from 'react';
import { ArrowRight, RotateCcw, Home, Star, PartyPopper, Trophy, Zap, Target } from 'lucide-react';
import { GameState } from '@/types/game';
import { getTotalLevels } from '@/utils/levels/index';
import { calculateStars } from '@/utils/starStorage';

interface LevelCompleteScreenProps {
  gameState: GameState;
  onNextLevel: () => void;
  onReplay: () => void;
  onMainMenu: () => void;
}

const getStars = (gameState: GameState): number => {
  return calculateStars(gameState.lives, gameState.maxCombo, gameState.score, gameState.level);
};

const StarRating: React.FC<{ stars: number; isGameWon: boolean }> = ({ stars }) => {
  return (
    <div className="flex items-end gap-2 mb-5">
      {[1, 2, 3].map((i) => {
        const isMiddle = i === 2;
        const earned = i <= stars;
        return (
          <div
            key={i}
            className={`transform transition-all duration-700 ${
              earned ? 'scale-100' : 'scale-75 opacity-30'
            }`}
            style={{
              animationDelay: `${i * 200}ms`,
              marginBottom: isMiddle ? '8px' : '0',
            }}
          >
            <Star
              className={`${isMiddle ? 'w-14 h-14' : 'w-10 h-10'}`}
              style={{
                color: earned ? '#ffcc00' : '#334455',
                fill: earned ? '#ffcc00' : '#1a2233',
                filter: earned ? 'drop-shadow(0 0 10px rgba(255, 200, 0, 0.7))' : 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({
  icon, label, value, color,
}) => (
  <div 
    className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
    style={{
      background: 'linear-gradient(135deg, #0d1f3a 0%, #081428 100%)',
      border: `1px solid ${color}33`,
    }}
  >
    {icon}
    <span className="text-xs" style={{ color: '#6688aa' }}>{label}</span>
    <span className="ml-auto font-display text-sm text-white font-bold">{value}</span>
  </div>
);

const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({
  gameState,
  onNextLevel,
  onReplay,
  onMainMenu,
}) => {
  const isGameWon = gameState.level >= getTotalLevels();
  const stars = getStars(gameState);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4"
      style={{ background: 'radial-gradient(ellipse at center, rgba(5, 15, 40, 0.97) 0%, rgba(3, 5, 15, 0.99) 100%)' }}
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-3xl animate-pulse"
          style={{ background: 'rgba(0, 200, 255, 0.1)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full blur-3xl animate-pulse"
          style={{ background: 'rgba(0, 255, 100, 0.08)', animationDelay: '500ms' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        {/* Header */}
        {isGameWon ? (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(255, 200, 0, 0.15)', border: '2px solid rgba(255, 200, 0, 0.5)', boxShadow: '0 0 20px rgba(255, 200, 0, 0.3)' }}
            >
              <PartyPopper className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="font-display text-3xl font-black mb-1"
              style={{ color: '#ffcc00', textShadow: '0 0 20px rgba(255, 200, 0, 0.5)' }}
            >
              VICTORY!
            </h2>
            <p className="text-sm mb-4" style={{ color: '#6688aa' }}>
              All {getTotalLevels()} levels completed!
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(0, 200, 100, 0.15)', border: '2px solid rgba(0, 200, 100, 0.5)', boxShadow: '0 0 20px rgba(0, 200, 100, 0.3)' }}
            >
              <Trophy className="w-8 h-8" style={{ color: '#00cc66' }} />
            </div>
            <h2 className="font-display text-3xl font-black mb-1"
              style={{ color: '#00cc66', textShadow: '0 0 20px rgba(0, 200, 100, 0.5)' }}
            >
              LEVEL {gameState.level}
            </h2>
            <p className="text-sm mb-4" style={{ color: '#6688aa' }}>
              COMPLETE
            </p>
          </>
        )}

        {/* Star Rating */}
        <StarRating stars={stars} isGameWon={isGameWon} />

        {/* Stats */}
        <div className="w-full space-y-2 mb-6">
          <StatItem
            icon={<Target className="w-4 h-4" style={{ color: '#00ccff' }} />}
            label="Score"
            value={gameState.score.toLocaleString()}
            color="#00ccff"
          />
          <StatItem
            icon={<Zap className="w-4 h-4" style={{ color: '#ffcc00' }} />}
            label="Max Combo"
            value={`${gameState.maxCombo || 0}x`}
            color="#ffcc00"
          />
          <StatItem
            icon={<Star className="w-4 h-4" style={{ color: '#cc33aa' }} />}
            label="Lives Left"
            value={gameState.lives}
            color="#cc33aa"
          />
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3">
          {isGameWon ? (
            <>
              <button
                onClick={onReplay}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-display text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(180deg, #00bbcc 0%, #007788 100%)',
                  border: '1.5px solid #00ddff',
                  boxShadow: '0 4px 15px rgba(0, 200, 255, 0.3)',
                }}
              >
                <RotateCcw className="w-4 h-4" />
                PLAY AGAIN
              </button>
              <button
                onClick={onMainMenu}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-display text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(180deg, #2255bb 0%, #1a3388 100%)',
                  border: '1.5px solid #4488dd',
                  boxShadow: '0 4px 15px rgba(50, 100, 200, 0.3)',
                }}
              >
                <Home className="w-4 h-4" />
                MAIN MENU
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onNextLevel}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-display text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(180deg, #00bb66 0%, #007744 100%)',
                  border: '1.5px solid #00ff88',
                  boxShadow: '0 4px 15px rgba(0, 255, 100, 0.3)',
                }}
              >
                NEXT LEVEL
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onReplay}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-display text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(180deg, #2255bb 0%, #1a3388 100%)',
                    border: '1.5px solid #4488dd',
                    boxShadow: '0 2px 10px rgba(50, 100, 200, 0.3)',
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  REPLAY
                </button>
                <button
                  onClick={onMainMenu}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-display text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(180deg, #2255bb 0%, #1a3388 100%)',
                    border: '1.5px solid #4488dd',
                    boxShadow: '0 2px 10px rgba(50, 100, 200, 0.3)',
                  }}
                >
                  <Home className="w-3.5 h-3.5" />
                  MENU
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelCompleteScreen;
