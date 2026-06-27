import React, { useState } from 'react';
import { Play, Settings, Trophy, Grid3X3, Volume2, VolumeX, ChevronLeft, Star, Lock, ShoppingBag, Gift, Globe } from 'lucide-react';
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

  // Sci-fi button component
  const SciFiMenuButton = ({ children, onClick, color = 'cyan', size = 'large' }: any) => {
    const colors: Record<string, any> = {
      cyan: { bg: 'linear-gradient(180deg, #00bbcc 0%, #007788 100%)', border: '#00ddff', shadow: 'rgba(0,200,255,0.3)' },
      green: { bg: 'linear-gradient(180deg, #00bb66 0%, #007744 100%)', border: '#00ff88', shadow: 'rgba(0,255,100,0.3)' },
      blue: { bg: 'linear-gradient(180deg, #2255bb 0%, #1a3388 100%)', border: '#4488dd', shadow: 'rgba(50,100,200,0.3)' },
      yellow: { bg: 'linear-gradient(180deg, #bb8800 0%, #886600 100%)', border: '#ffcc00', shadow: 'rgba(255,200,0,0.3)' },
      pink: { bg: 'linear-gradient(180deg, #bb2288 0%, #882255 100%)', border: '#ff55aa', shadow: 'rgba(255,80,170,0.3)' },
      purple: { bg: 'linear-gradient(180deg, #7733bb 0%, #552288 100%)', border: '#aa66ff', shadow: 'rgba(150,80,255,0.3)' },
    };
    const c = colors[color] || colors.cyan;
    const py = size === 'large' ? 'py-4' : 'py-3';
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-center gap-3 px-6 ${py} rounded-xl font-display text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 tracking-wider`}
        style={{
          background: c.bg,
          border: `1.5px solid ${c.border}`,
          boxShadow: `0 4px 15px ${c.shadow}`,
        }}
      >
        {children}
      </button>
    );
  };

  const renderMainMenu = () => (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
      {/* Coins + High Score */}
      <div className="flex items-center gap-3 w-full justify-center mb-2">
        <div 
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #1a2a44 0%, #0d1a33 100%)',
            border: '1.5px solid #ffcc00',
            boxShadow: '0 0 8px rgba(255, 200, 0, 0.2)',
          }}
        >
          <span className="text-base">🪙</span>
          <span className="font-display text-base font-bold" style={{ color: '#ffdd44' }}>{persistentCoins}</span>
        </div>
        {highScore > 0 && (
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #1a2a44 0%, #0d1a33 100%)',
              border: '1.5px solid #ffcc00',
              boxShadow: '0 0 8px rgba(255, 200, 0, 0.2)',
            }}
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="font-display text-sm font-bold" style={{ color: '#ffdd44' }}>{highScore.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Continue / Play Button */}
      <SciFiMenuButton onClick={() => onStartGame(unlockedLevel)} color="green" size="large">
        <Play className="w-5 h-5 fill-current" />
        {unlockedLevel > 1 ? `${t('continue')} (${t('lvl')} ${unlockedLevel})` : t('newGame')}
      </SciFiMenuButton>

      {/* Level Select */}
      <SciFiMenuButton onClick={() => setCurrentView('levels')} color="blue" size="large">
        <Grid3X3 className="w-5 h-5" />
        {t('selectLevel')}
      </SciFiMenuButton>

      {/* Shop + Lucky Wheel row */}
      <div className="flex gap-3 w-full">
        <button
          onClick={onOpenShop}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-display text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(180deg, #bb8800 0%, #886600 100%)',
            border: '1.5px solid #ffcc00',
            boxShadow: '0 3px 12px rgba(255, 200, 0, 0.3)',
          }}
        >
          <ShoppingBag className="w-4 h-4" />
          {t('shop')}
        </button>
        <button
          onClick={onOpenWheel}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-display text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(180deg, #bb2288 0%, #882255 100%)',
            border: '1.5px solid #ff55aa',
            boxShadow: '0 3px 12px rgba(255, 80, 170, 0.3)',
          }}
        >
          <Gift className="w-4 h-4" />
          {t('wheel')}
        </button>
      </div>

      {/* Settings */}
      <SciFiMenuButton onClick={() => setCurrentView('settings')} color="purple" size="large">
        <Settings className="w-5 h-5" />
        {t('settings')}
      </SciFiMenuButton>

      {/* Back to Title */}
      <button
        onClick={onBack}
        className="mt-2 px-6 py-2 font-display text-xs transition-colors"
        style={{ color: '#5577aa' }}
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
    <div 
      className="flex flex-col items-center w-full max-w-xs p-5 rounded-2xl"
      style={{
        background: 'linear-gradient(180deg, #0d1b3a 0%, #060d1f 100%)',
        border: '2px solid rgba(60, 100, 200, 0.4)',
        boxShadow: '0 0 40px rgba(50, 80, 200, 0.15)',
      }}
    >
      <div className="flex items-center justify-between w-full mb-6">
        <button
          onClick={() => setCurrentView('main')}
          className="p-2 rounded-lg transition-colors"
          style={{ color: '#00ccff' }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="font-display text-xl font-bold text-white" style={{ textShadow: '0 0 10px rgba(0,200,255,0.4)' }}>
          {t('settings')}
        </h2>
        <div className="w-10" />
      </div>

      {/* Mute Toggle */}
      <button
        onClick={toggleMute}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl mb-5 transition-all"
        style={{
          background: isMuted 
            ? 'linear-gradient(135deg, rgba(200, 30, 30, 0.15) 0%, rgba(100, 10, 10, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(0, 200, 100, 0.15) 0%, rgba(0, 100, 50, 0.1) 100%)',
          border: `1.5px solid ${isMuted ? 'rgba(255, 50, 50, 0.5)' : 'rgba(0, 255, 100, 0.5)'}`,
        }}
      >
        <span className="font-display text-sm text-white">
          {isMuted ? t('soundOff') : t('soundOn')}
        </span>
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-red-400" />
        ) : (
          <Volume2 className="w-5 h-5" style={{ color: '#00cc66' }} />
        )}
      </button>

      {/* SFX Volume */}
      <div className="w-full mb-5">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-white font-display">{t('soundEffects')}</span>
          <span className="text-xs" style={{ color: '#5577aa' }}>{Math.round(sfxVolume)}%</span>
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
      <div className="w-full mb-5">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-white font-display">{t('music')}</span>
          <span className="text-xs" style={{ color: '#5577aa' }}>{Math.round(musicVolume)}%</span>
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
      <div className="w-full mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4" style={{ color: '#00ccff' }} />
          <span className="text-xs text-white font-display">{t('language')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="px-3 py-2 rounded-lg text-xs transition-all"
              style={{
                background: lang === l ? 'rgba(0, 200, 255, 0.15)' : 'rgba(20, 30, 50, 0.5)',
                border: `1.5px solid ${lang === l ? '#00ccff' : 'rgba(60, 80, 120, 0.4)'}`,
                color: lang === l ? '#00ddff' : '#6688aa',
              }}
            >
              {LANGUAGE_NAMES[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Game Info */}
      <div className="mt-3 text-center">
        <p className="text-xs" style={{ color: '#5577aa' }}>
          {t('version')}
        </p>
        <p className="text-[10px] mt-1" style={{ color: '#334466' }}>
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
      <div className="absolute inset-0" style={{ background: 'rgba(3, 5, 15, 0.7)' }} />

      <div className="relative z-10 mb-6">
        <h1 className="font-display text-3xl font-black text-white"
          style={{ textShadow: '0 0 20px rgba(0, 200, 255, 0.5)' }}
        >
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
