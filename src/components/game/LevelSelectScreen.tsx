import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Lock, Star } from 'lucide-react';
import { getTotalLevels } from '@/utils/levels/index';
import { getLevelStars, getTotalStars } from '@/utils/starStorage';

interface LevelSelectScreenProps {
  unlockedLevel: number;
  onStartGame: (level: number) => void;
  onBack: () => void;
}

// Zone definitions with planet themes
const ZONES = [
  { name: 'Mercury', from: 1, to: 20, color: '#cc7733' },
  { name: 'Venus', from: 21, to: 40, color: '#ccaa33' },
  { name: 'Earth', from: 41, to: 60, color: '#3388cc' },
  { name: 'Mars', from: 61, to: 80, color: '#cc4433' },
  { name: 'Jupiter', from: 81, to: 120, color: '#cc7744' },
  { name: 'Saturn', from: 121, to: 160, color: '#bbaa44' },
  { name: 'Uranus', from: 161, to: 200, color: '#33bbcc' },
  { name: 'Neptune', from: 201, to: 260, color: '#3355cc' },
  { name: 'Pluto', from: 261, to: 340, color: '#7744bb' },
  { name: 'Andromeda', from: 341, to: 440, color: '#9944cc' },
  { name: 'Nebula', from: 441, to: 560, color: '#cc3388' },
  { name: 'Quasar', from: 561, to: 700, color: '#cc3333' },
  { name: 'Pulsar', from: 701, to: 860, color: '#33bb77' },
  { name: 'Supernova', from: 861, to: 1040, color: '#ccaa00' },
  { name: 'Black Hole', from: 1041, to: 1260, color: '#5500cc' },
  { name: 'Multiverse', from: 1261, to: 1500, color: '#00bbbb' },
  { name: 'Singularity', from: 1501, to: 1750, color: '#cc2266' },
  { name: 'Infinity', from: 1751, to: 2000, color: '#bbbb00' },
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
          className="w-3.5 h-3.5"
          style={{
            color: i <= stars ? '#ffcc00' : '#1a2233',
            fill: i <= stars ? '#ffcc00' : '#1a2233',
            filter: i <= stars ? 'drop-shadow(0 0 4px rgba(255, 200, 0, 0.7))' : 'none',
          }}
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
          width: '50px',
          height: '50px',
          background: isUnlocked
            ? isCurrent
              ? `radial-gradient(circle at 40% 35%, ${zoneColor}, #004422)`
              : isCompleted
                ? `radial-gradient(circle at 40% 35%, ${zoneColor}aa, #112244)`
                : `radial-gradient(circle at 40% 35%, #335577, #112233)`
            : 'radial-gradient(circle at 40% 35%, #1a2233, #0a1122)',
          border: isUnlocked
            ? isCurrent
              ? `3px solid #00ff88`
              : `2px solid ${zoneColor}66`
            : '2px solid #1a2233',
          boxShadow: isUnlocked
            ? isCurrent
              ? `0 0 15px rgba(0, 255, 100, 0.5), inset 0 -3px 8px rgba(0,0,0,0.4)`
              : isCompleted
                ? `0 0 8px ${zoneColor}33, inset 0 -3px 8px rgba(0,0,0,0.4)`
                : `inset 0 -3px 8px rgba(0,0,0,0.4)`
            : 'inset 0 -3px 8px rgba(0,0,0,0.5)',
          opacity: isUnlocked ? 1 : 0.4,
        }}
      >
        {isUnlocked ? (
          <span className="font-display text-sm font-bold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {level}
          </span>
        ) : (
          <Lock className="w-3.5 h-3.5" style={{ color: '#334455' }} />
        )}

        {isCurrent && (
          <div
            className="absolute -right-1 -bottom-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{
              background: '#00cc66',
              border: '2px solid #00ff88',
              boxShadow: '0 0 8px rgba(0, 255, 100, 0.5)',
            }}
          >
            <span className="text-white text-[7px]">▶</span>
          </div>
        )}
      </div>

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
  
  const currentZone = getZoneForLevel(unlockedLevel);

  useEffect(() => {
    const el = document.getElementById(`zone-${currentZone.name}`);
    if (el && scrollRef.current) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: '#060d1f' }}>
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: 'rgba(200, 220, 255, 0.4)',
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
          className="p-2 rounded-full transition-colors"
          style={{ background: 'rgba(20, 40, 70, 0.8)', border: '1px solid rgba(60, 100, 200, 0.4)' }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="font-display text-lg font-bold text-white" style={{ textShadow: '0 0 10px rgba(0,200,255,0.4)' }}>
          SELECT LEVEL
        </h2>
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(20, 40, 70, 0.8)', border: '1px solid rgba(255, 200, 0, 0.4)' }}
        >
          <Star className="w-4 h-4" style={{ color: '#ffcc00', fill: '#ffcc00' }} />
          <span className="font-display text-sm" style={{ color: '#ffdd44' }}>{totalStars}</span>
        </div>
      </div>

      {/* Scrollable level grid */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 pb-8 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {ZONES.map((zone) => {
          if (zone.from > totalLevels) return null;
          const zoneTo = Math.min(zone.to, totalLevels);
          const levels = Array.from({ length: zoneTo - zone.from + 1 }, (_, i) => zone.from + i);
          const zoneStars = levels.reduce((sum, l) => sum + getLevelStars(l), 0);
          const maxZoneStars = levels.length * 3;

          return (
            <div key={zone.name} id={`zone-${zone.name}`} className="mb-6">
              {/* Zone Header */}
              <div className="flex items-center justify-center gap-3 mb-4 mt-2">
                <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${zone.color}44)` }} />
                <div className="flex flex-col items-center">
                  <span
                    className="font-display text-base font-bold"
                    style={{ color: zone.color, textShadow: `0 0 8px ${zone.color}44` }}
                  >
                    {zone.name}
                  </span>
                  <span className="text-[10px]" style={{ color: '#5577aa' }}>
                    {zone.from}-{zoneTo} | {zoneStars}/{maxZoneStars} ⭐
                  </span>
                </div>
                <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${zone.color}44)` }} />
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
