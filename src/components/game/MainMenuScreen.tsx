import React, { useState } from 'react';
import { Play, Settings, Trophy, Grid3X3, Volume2, VolumeX, ChevronLeft, Star, Lock, ShoppingBag, Gift, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getTotalLevels } from '@/utils/levels/index';
import { audioManager } from '@/utils/audioManager';
import { useI18n, LANGUAGE_NAMES, Language } from '@/utils/i18n';
import { getTotalStars } from '@/utils/starStorage';
import LevelSelectScreen from './LevelSelectScreen';
import spaceBackground from '@/assets/space-background.jpg';

interface MainMenuScreenProps {
  highScore: number;
  unlockedLevel: number;
  persistentCoins: number;
  onStartGame: (level: number) => void;
  onBack: () => void;
  onOpenShop: () => void;
  onOpenWheel: () => void;
}

type MenuView = 'main' | 'levels' | 'settings';

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ 
  highScore, 
  unlockedLevel,
  persistentCoins,
  onStartGame,
  onBack,
  onOpenShop,
  onOpenWheel,
}) => {
  const { t, lang, setLang } = useI18n();
  const [currentView, setCurrentView] = useState<MenuView>('main');
  const [sfxVolume, setSfxVolume] = useState(audioManager.sfxVolume * 100);
  const [musicVolume, setMusicVolume] = useState(audioManager.musicVolume * 100);
  const [isMuted, setIsMuted] = useState(audioManager.isMuted);

  const totalLevels = getTotalLevels();
  const levelsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(totalLevels / levelsPerPage);

  const handleSfxChange = (value: number[]) => {
    const vol = value[0];
    setSfxVolume(vol);
    audioManager.sfxVolume = vol / 100;
  };

  const handleMusicChange = (value: number[]) => {
    const vol = value[0];
    setMusicVolume(vol);
    audioManager.musicVolume = vol / 100;
  };

  const toggleMute = () => {
    audioManager.toggleMute();
    setIsMuted(audioManager.isMuted);
  };

  const languages: Language[] = ['en', 'pt', 'hi', 'es', 'ar', 'ru', 'fr', 'zh', 'de', 'ko'];

  const renderMainMenu = () => (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
      {/* Coins + High Score */}
      <div className="flex items-center gap-3 w-full justify-center mb-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl border border-neon-yellow/30">
          <span className="text-base">🪙</span>
          <span className="font-display text-base text-neon-yellow">{persistentCoins}</span>
        </div>
        {highScore > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl border border-neon-yellow/30">
            <Trophy className="w-4 h-4 text-neon-yellow" />
            <span className="font-display text-sm text-neon-yellow">{highScore.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Continue / Play Button */}
      <button
        onClick={() => onStartGame(unlockedLevel)}
        className="w-full group relative px-8 py-4 font-display text-lg font-bold tracking-wider transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(180deg, hsl(150 100% 40%) 0%, hsl(160 100% 30%) 100%)',
          borderRadius: '12px',
          border: '2px solid hsl(150 100% 50%)',
          boxShadow: '0 0 20px rgba(0,255,150,0.3)',
          color: 'white',
        }}
      >
        <span className="flex items-center justify-center gap-3">
          <Play className="w-5 h-5 fill-current" />
          {unlockedLevel > 1 ? `${t('continue')} (${t('lvl')} ${unlockedLevel})` : t('newGame')}
        </span>
      </button>

      {/* Level Select */}
      <button
        onClick={() => setCurrentView('levels')}
        className="w-full group relative px-8 py-4 font-display text-lg font-bold tracking-wider transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(180deg, hsl(220 80% 50%) 0%, hsl(230 80% 40%) 100%)',
          borderRadius: '12px',
          border: '2px solid hsl(220 80% 60%)',
          boxShadow: '0 0 15px rgba(100,150,255,0.3)',
          color: 'white',
        }}
      >
        <span className="flex items-center justify-center gap-3">
          <Grid3X3 className="w-5 h-5" />
          {t('selectLevel')}
        </span>
      </button>

      {/* Shop + Lucky Wheel row */}
      <div className="flex gap-3 w-full">
        <button
          onClick={onOpenShop}
          className="flex-1 px-4 py-3 font-display text-sm font-bold tracking-wider transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(180deg, hsl(45 100% 45%) 0%, hsl(40 100% 35%) 100%)',
            borderRadius: '12px',
            border: '2px solid hsl(50 100% 55%)',
            boxShadow: '0 0 15px rgba(255,200,0,0.3)',
            color: 'white',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            {t('shop')}
          </span>
        </button>
        <button
          onClick={onOpenWheel}
          className="flex-1 px-4 py-3 font-display text-sm font-bold tracking-wider transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(180deg, hsl(320 80% 45%) 0%, hsl(330 80% 35%) 100%)',
            borderRadius: '12px',
            border: '2px solid hsl(320 80% 60%)',
            boxShadow: '0 0 15px rgba(255,0,150,0.25)',
            color: 'white',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <Gift className="w-4 h-4" />
            {t('wheel')}
          </span>
        </button>
      </div>

      {/* Settings */}
      <button
        onClick={() => setCurrentView('settings')}
        className="w-full group relative px-8 py-3 font-display text-base font-bold tracking-wider transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(180deg, hsl(280 80% 50%) 0%, hsl(290 80% 40%) 100%)',
          borderRadius: '12px',
          border: '2px solid hsl(280 80% 60%)',
          boxShadow: '0 0 15px rgba(180,100,255,0.3)',
          color: 'white',
        }}
      >
        <span className="flex items-center justify-center gap-3">
          <Settings className="w-5 h-5" />
          {t('settings')}
        </span>
      </button>

      {/* Back to Title */}
      <button
        onClick={onBack}
        className="mt-2 px-6 py-2 font-game text-muted-foreground hover:text-foreground transition-colors"
      >
        {t('backToTitle')}
      </button>
    </div>
  );

  const renderLevelSelect = () => {
    return (
      <LevelSelectScreen
        unlockedLevel={unlockedLevel}
        onStartGame={onStartGame}
        onBack={() => setCurrentView('main')}
      />
    );
  };

  const renderSettings = () => (
    <div className="flex flex-col items-center w-full max-w-xs">
      <div className="flex items-center justify-between w-full mb-8">
        <button
          onClick={() => setCurrentView('main')}
          className="p-2 text-foreground hover:text-neon-cyan transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="font-display text-xl font-bold text-foreground">{t('settings')}</h2>
        <div className="w-10" />
      </div>

      {/* Mute Toggle */}
      <button
        onClick={toggleMute}
        className={`
          w-full flex items-center justify-between px-6 py-4 rounded-xl mb-6
          ${isMuted ? 'bg-destructive/20 border-destructive/50' : 'bg-neon-green/20 border-neon-green/50'}
          border-2 transition-all duration-300
        `}
      >
        <span className="font-display text-foreground">
          {isMuted ? t('soundOff') : t('soundOn')}
        </span>
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-destructive" />
        ) : (
          <Volume2 className="w-6 h-6 text-neon-green" />
        )}
      </button>

      {/* SFX Volume */}
      <div className="w-full mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-game text-foreground">{t('soundEffects')}</span>
          <span className="font-game text-muted-foreground">{Math.round(sfxVolume)}%</span>
        </div>
        <Slider
          value={[sfxVolume]}
          onValueChange={handleSfxChange}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Music Volume */}
      <div className="w-full mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-game text-foreground">{t('music')}</span>
          <span className="font-game text-muted-foreground">{Math.round(musicVolume)}%</span>
        </div>
        <Slider
          value={[musicVolume]}
          onValueChange={handleMusicChange}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Language Selector */}
      <div className="w-full mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-neon-cyan" />
          <span className="font-game text-foreground">{t('language')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`
                px-3 py-2 rounded-lg font-game text-sm transition-all
                ${lang === l 
                  ? 'bg-neon-cyan/30 border-2 border-neon-cyan text-foreground' 
                  : 'bg-black/30 border-2 border-muted/30 text-muted-foreground hover:border-neon-cyan/50'}
              `}
            >
              {LANGUAGE_NAMES[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Game Info */}
      <div className="mt-4 text-center">
        <p className="font-game text-muted-foreground text-sm">
          {t('version')}
        </p>
        <p className="font-game text-muted-foreground/50 text-xs mt-1">
          {t('levelsInfo', { count: totalLevels })}
        </p>
      </div>
    </div>
  );

  // Level select is a full-screen overlay
  if (currentView === 'levels') {
    return renderLevelSelect();
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 mb-8">
        <h1 className="font-display text-3xl font-black text-glow-cyan text-foreground">
          {t('neonBreaker')}
        </h1>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        {currentView === 'main' && renderMainMenu()}
        {currentView === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default MainMenuScreen;
