import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Lock, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { getTotalLevels } from '@/utils/levels/index';
import { getLevelStars, getTotalStars } from '@/utils/starStorage';

interface LevelSelectScreenProps {
  unlockedLevel: number;
  onStartGame: (level: number) => void;
  onBack: () => void;
}

// Zone definitions with planet themes
const ZONES = [
  { name: 'Mercury', from: 1, to: 20, color: 'hsl(30, 80%, 55%)' },
  { name: 'Venus', from: 21, to: 40, color: 'hsl(45, 90%, 60%)' },
  { name: 'Earth', from: 41, to: 60, color: 'hsl(200, 80%, 55%)' },
  { name: 'Mars', from: 61, to: 80, color: 'hsl(10, 80%, 50%)' },
  { name: 'Jupiter', from: 81, to: 120, color: 'hsl(25, 70%, 55%)' },
  { name: 'Saturn', from: 121, to: 160, color: 'hsl(45, 60%, 50%)' },
  { name: 'Uranus', from: 161, to: 200, color: 'hsl(185, 70%, 55%)' },
  { name: 'Neptune', from: 201, to: 260, color: 'hsl(220, 80%, 55%)' },
  { name: 'Pluto', from: 261, to: 340, color: 'hsl(270, 60%, 55%)' },
  { name: 'Andromeda', from: 341, to: 440, color: 'hsl(280, 80%, 60%)' },
  { name: 'Nebula', from: 441, to: 560, color: 'hsl(320, 70%, 55%)' },
  { name: 'Quasar', from: 561, to: 700, color: 'hsl(0, 80%, 55%)' },
  { name: 'Pulsar', from: 701, to: 860, color: 'hsl(160, 80%, 50%)' },
  { name: 'Supernova', from: 861, to: 1040, color: 'hsl(50, 100%, 55%)' },
  { name: 'Black Hole', from: 1041, to: 1260, color: 'hsl(260, 100%, 40%)' },
  { name: 'Multiverse', from: 1261, to: 1500, color: 'hsl(180, 100%, 50%)' },
  { name: 'Singularity', from: 1501, to: 1750, color: 'hsl(340, 100%, 55%)' },
  { name: 'Infinity', from: 1751, to: 2000, color: 'hsl(60, 100%, 55%)' },
];

const getZoneForLevel = (level: number) => {
  return ZONES.find(z => level >= z.from && level <= z.to) || ZONES[0];
};

const StarDisplay: React.FC<{ stars: number }> = ({ stars }) => {
  return (
    <div className="flex gap-0 justify-center -mt-1">
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= stars
              ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.9)]'
              : 'text-muted-foreground/20 fill-muted-foreground/10'
          }`}
          style={i === 2 ? { marginTop: '-2px' } : {}}
        />
      ))}
    </div>
  );
};

const LevelButton: React.FC<{
  level: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  stars: number;
  zoneColor: string;
  onClick: () => void;
}> = ({ level, isUnlocked, isCompleted, isCurrent, stars, zoneColor, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={!isUnlocked}
      className="flex flex-col items-center gap-1 transition-all duration-200 active:scale-95"
    >
      <div
        className="relative flex items-center justify-center rounded-full transition-all duration-300"
        style={{
          width: '52px',
          height: '52px',
          background: isUnlocked
            ? isCurrent
              ? `radial-gradient(circle at 40% 35%, ${zoneColor}, hsl(150, 100%, 35%))`
              : isCompleted
                ? `radial-gradient(circle at 40% 35%, ${zoneColor}, hsl(210, 85%, 40%))`
                : `radial-gradient(circle at 40% 35%, hsl(200, 60%, 50%), hsl(210, 70%, 35%))`
            : 'radial-gradient(circle at 40% 35%, hsl(220, 20%, 25%), hsl(220, 20%, 15%))',
          border: isUnlocked
            ? isCurrent
              ? '3px solid hsl(150, 100%, 60%)'
              : `3px solid ${zoneColor}88`
            : '3px solid hsl(220, 15%, 25%)',
          boxShadow: isUnlocked
            ? isCurrent
              ? `0 0 15px hsl(150, 100%, 50%, 0.6), 0 0 30px hsl(150, 100%, 50%, 0.3), inset 0 -3px 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2)`
              : isCompleted
                ? `0 0 10px ${zoneColor}44, inset 0 -3px 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.15)`
                : `0 0 8px ${zoneColor}33, inset 0 -3px 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)`
            : 'inset 0 -3px 8px rgba(0,0,0,0.5)',
          opacity: isUnlocked ? 1 : 0.5,
        }}
      >
        {isUnlocked ? (
          <span
            className="font-display text-base font-bold"
            style={{
              color: 'white',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {level}
          </span>
        ) : (
          <Lock className="w-4 h-4 text-muted-foreground/60" />
        )}

        {/* Play indicator for current level */}
        {isCurrent && (
          <div
            className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: 'hsl(150, 100%, 45%)',
              border: '2px solid hsl(150, 100%, 65%)',
              boxShadow: '0 0 8px hsl(150, 100%, 50%, 0.6)',
            }}
          >
            <span className="text-white text-[8px]">▶</span>
          </div>
        )}
      </div>

      {/* Stars below */}
      {isCompleted ? (
        <StarDisplay stars={stars} />
      ) : (
        <div className="h-3" />
      )}
    </button>
  );
};

const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  unlockedLevel,
  onStartGame,
  onBack,
}) => {
  const totalLevels = getTotalLevels();
  const totalStars = getTotalStars();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Find the zone the player is currently in
  const currentZone = getZoneForLevel(unlockedLevel);
  const currentZoneIndex = ZONES.findIndex(z => z.name === currentZone.name);

  // Auto-scroll to current zone on mount
  useEffect(() => {
    const el = document.getElementById(`zone-${currentZone.name}`);
    if (el && scrollRef.current) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      {/* Background stars effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-foreground/40"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-card/80 border border-border hover:bg-card transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="font-display text-lg font-bold text-foreground">SELECT LEVEL</h2>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-neon-yellow/30">
          <Star className="w-4 h-4 text-neon-yellow fill-neon-yellow" />
          <span className="font-display text-sm text-neon-yellow">{totalStars}</span>
        </div>
      </div>

      {/* Scrollable level grid */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 pb-8 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {ZONES.map((zone, zoneIdx) => {
          if (zone.from > totalLevels) return null;
          const zoneTo = Math.min(zone.to, totalLevels);
          const levels = Array.from({ length: zoneTo - zone.from + 1 }, (_, i) => zone.from + i);
          const zoneStars = levels.reduce((sum, l) => sum + getLevelStars(l), 0);
          const maxZoneStars = levels.length * 3;
          const isCurrentZone = zone.name === currentZone.name;

          return (
            <div key={zone.name} id={`zone-${zone.name}`} className="mb-6">
              {/* Zone Header */}
              <div className="flex items-center justify-center gap-3 mb-4 mt-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${zone.color}66)` }} />
                <div className="flex flex-col items-center">
                  <span
                    className="font-display text-lg font-bold"
                    style={{ color: zone.color, textShadow: `0 0 10px ${zone.color}66` }}
                  >
                    {zone.name}
                  </span>
                  <span className="font-game text-xs text-muted-foreground">
                    {zoneStars}/{maxZoneStars} ⭐
                  </span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent" style={{ backgroundImage: `linear-gradient(to left, transparent, ${zone.color}66)` }} />
              </div>

              {/* Level Grid */}
              <div className="grid grid-cols-5 gap-3 justify-items-center">
                {levels.map(level => {
                  const isUnlocked = level <= unlockedLevel;
                  const isCompleted = level < unlockedLevel;
                  const isCurrent = level === unlockedLevel;
                  const stars = getLevelStars(level);

                  return (
                    <LevelButton
                      key={level}
                      level={level}
                      isUnlocked={isUnlocked}
                      isCompleted={isCompleted}
                      isCurrent={isCurrent}
                      stars={stars}
                      zoneColor={zone.color}
                      onClick={() => onStartGame(level)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelSelectScreen;
