import React from 'react';
import { Play } from 'lucide-react';
import spaceBackground from '@/assets/space-background.jpg';

interface SplashScreenProps {
  onPlay: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onPlay }) => {
  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-between py-16 overflow-hidden"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      
      {/* Title Section - Upper portion */}
      <div className="relative z-10 flex flex-col items-center mt-16">
        {/* Main Title with 3D effect */}
        <div className="relative">
          {/* Shadow/3D effect layers */}
          <h1 
            className="font-display text-5xl md:text-7xl font-black tracking-wider"
            style={{
              background: 'linear-gradient(180deg, hsl(210 100% 70%) 0%, hsl(220 100% 50%) 50%, hsl(240 80% 30%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 8px rgba(0,0,0,0.5)',
              filter: 'drop-shadow(0 2px 4px rgba(100,150,255,0.5))',
            }}
          >
            NEON BRICK
          </h1>
        </div>
        
        <div className="relative -mt-2">
          <h2 
            className="font-display text-4xl md:text-6xl font-black tracking-wider"
            style={{
              background: 'linear-gradient(180deg, hsl(280 100% 75%) 0%, hsl(320 100% 60%) 50%, hsl(280 80% 40%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(200,100,255,0.5))',
            }}
          >
            BREAKER: BALL
          </h2>
        </div>
        
        {/* Subtitle ribbon */}
        <div className="mt-4 relative">
          <div 
            className="px-8 py-2 rounded-full"
            style={{
              background: 'linear-gradient(135deg, hsl(320 100% 50%) 0%, hsl(350 100% 60%) 100%)',
              boxShadow: '0 4px 15px rgba(255,100,150,0.4)',
            }}
          >
            <span className="font-display text-sm md:text-base font-bold text-white tracking-widest">
              SPACE EDITION
            </span>
          </div>
        </div>
      </div>
      
      {/* Play Button - Lower portion */}
      <div className="relative z-10 mb-24">
        <button
          onClick={onPlay}
          className="group relative px-16 py-5 font-display text-xl md:text-2xl font-bold tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(180deg, hsl(180 100% 45%) 0%, hsl(190 100% 35%) 100%)',
            borderRadius: '12px',
            border: '3px solid hsl(180 100% 60%)',
            boxShadow: `
              0 0 20px rgba(0,255,255,0.4),
              0 0 40px rgba(0,255,255,0.2),
              inset 0 2px 4px rgba(255,255,255,0.3),
              inset 0 -2px 4px rgba(0,0,0,0.2)
            `,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {/* Inner glow effect */}
          <div 
            className="absolute inset-1 rounded-lg opacity-30"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
            }}
          />
          
          {/* Hexagon pattern overlay */}
          <div 
            className="absolute inset-0 rounded-xl opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 8px,
                rgba(255,255,255,0.1) 8px,
                rgba(255,255,255,0.1) 9px
              )`,
            }}
          />
          
          <span className="relative z-10 flex items-center gap-3">
            <Play className="w-6 h-6 fill-current" />
            PLAY
          </span>
          
          {/* Outer glow on hover */}
          <div 
            className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
            style={{
              background: 'linear-gradient(180deg, hsl(180 100% 50%) 0%, hsl(190 100% 40%) 100%)',
              filter: 'blur(15px)',
            }}
          />
        </button>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
