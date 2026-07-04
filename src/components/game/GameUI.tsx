import React, { useState, useEffect } from 'react';
import { GameState } from '@/types/game';
import { Heart, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '@/utils/audioManager';

interface GameUIProps {
  gameState: GameState;
  persistentCoins?: number;
  onTogglePause?: () => void;
  isPaused?: boolean;
  isPlaying?: boolean;
  shieldTimer?: number;
  ghostTimer?: number;
}

const GameUI: React.FC<GameUIProps> = ({ gameState, persistentCoins, onTogglePause, isPaused, isPlaying, shieldTimer, ghostTimer }) => {
  const [isMuted, setIsMuted] = useState(audioManager.isMuted);

  useEffect(() => {
    const initAudio = async () => {
      await audioManager.init();
      await audioManager.resume();
    };
    initAudio();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      audioManager.startBackgroundMusic();
    } else {
      audioManager.stopBackgroundMusic();
    }
  }, [isPlaying]);

  const toggleMute = () => {
    audioManager.toggleMute();
    setIsMuted(audioManager.isMuted);
  };

  const boxStyle = {
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(0, 20, 30, 0.85)',
    border: '2px solid #00e5ff',
    boxShadow: '0 0 6px rgba(0, 229, 255, 0.3)',
  };

  return (
    <div className="relative flex flex-col w-full max-w-[480px] mx-auto px-2 gap-1" style={{ paddingTop: '2px' }}>
      {/* Banner ad space */}
      <div style={{ height: '50px', minHeight: '50px' }} id="banner-ad-space" />

      {/* HUD: 5 separate boxes in one row */}
      {isPlaying && (
        <div className="flex items-center gap-1.5">
          {/* Pause */}
          <button
            onClick={onTogglePause}
            className="flex items-center justify-center"
            style={{ ...boxStyle, width: '38px', minWidth: '38px' }}
          >
            {isPaused ? <Play className="w-5 h-5" style={{ color: '#00e5ff' }} /> : <Pause className="w-5 h-5" style={{ color: '#00e5ff' }} />}
          </button>

          {/* Sound */}
          <button
            onClick={toggleMute}
            className="flex items-center justify-center"
            style={{ ...boxStyle, width: '38px', minWidth: '38px' }}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" style={{ color: '#ff4444' }} />
            ) : (
              <Volume2 className="w-5 h-5" style={{ color: '#00e5ff' }} />
            )}
          </button>

          {/* Level */}
          <div
            className="flex items-center justify-center gap-1 px-3 flex-1"
            style={boxStyle}
          >
            <span className="font-display text-xs font-bold" style={{ color: '#aabbcc' }}>LV</span>
            <span className="font-display text-sm text-white font-black">{gameState.level}</span>
          </div>

          {/* Coins */}
          <div
            className="flex items-center justify-center gap-1 px-3 flex-1"
            style={boxStyle}
          >
            <span className="text-sm">🪙</span>
            <span className="font-display text-sm font-black" style={{ color: '#ffdd44' }}>
              {(persistentCoins ?? 0) + gameState.coins}
            </span>
          </div>

          {/* Lives - 3 hearts */}
          <div
            className="flex items-center justify-center gap-0.5 px-2"
            style={boxStyle}
          >
            {[0, 1, 2].map(i => (
              <Heart
                key={i}
                className="w-4 h-4"
                style={{
                  color: i < gameState.lives ? '#ff3388' : 'rgba(255,255,255,0.15)',
                  fill: i < gameState.lives ? '#ff3388' : 'transparent',
                  filter: i < gameState.lives ? 'drop-shadow(0 0 3px rgba(255, 50, 130, 0.5))' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* #11 Power-up timers — absolutely positioned under the pause button so
          the game canvas below never shifts up/down when a countdown appears. */}
      {isPlaying && (gameState.autoTimer || shieldTimer || ghostTimer) ? (
        <div
          className="absolute flex flex-col items-start gap-0.5 pointer-events-none animate-pulse"
          style={{ top: '96px', left: '10px', zIndex: 40 }}
        >
          {gameState.autoTimer && gameState.autoTimer > 0 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(0, 200, 100, 0.25)', border: '1px solid rgba(0, 200, 100, 0.5)' }}>
              <span className="text-[9px]">🎯</span>
              <span className="font-display text-[9px] font-bold" style={{ color: '#00ff88' }}>AUTO {gameState.autoTimer}s</span>
            </div>
          )}
          {shieldTimer && shieldTimer > 0 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(0, 150, 255, 0.25)', border: '1px solid rgba(0, 150, 255, 0.5)' }}>
              <span className="text-[9px]">🛡️</span>
              <span className="font-display text-[9px] font-bold" style={{ color: '#00aaff' }}>SHIELD {shieldTimer}s</span>
            </div>
          )}
          {ghostTimer && ghostTimer > 0 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(150, 0, 200, 0.25)', border: '1px solid rgba(150, 0, 200, 0.5)' }}>
              <span className="text-[9px]">👻</span>
              <span className="font-display text-[9px] font-bold" style={{ color: '#cc66ff' }}>GHOST {ghostTimer}s</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default GameUI;
