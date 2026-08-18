import React, { useState, useCallback, useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { toast } from 'sonner';
import { GameState } from '@/types/game';
import { getTotalLevels } from '@/utils/levels/index';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import SplashScreen from './SplashScreen';
import MainMenuScreen from './MainMenuScreen';
import GameOverScreen from './GameOverScreen';
import LevelCompleteScreen from './LevelCompleteScreen';
import AudioControls from './AudioControls';
import DailyRewards, { checkDailyReward } from './DailyRewards';
import LuckyWheel from './LuckyWheel';
import ShopScreen, { ShopItem } from './ShopScreen';
import TutorialOverlay, { hasSeenTutorial } from './TutorialOverlay';
import { audioManager } from '@/utils/audioManager';
import { initBilling, restoreUnconsumedPurchases } from '@/utils/billing';
import { initAdMob, showBannerAd, showInterstitialAd, preloadInterstitial, isAdActive, isAdsRemoved } from '@/utils/admob';
import { calculateStars, setLevelStars } from '@/utils/starStorage';
import { initDailyReminder } from '@/utils/notifications';
import { getWorldBg } from '@/utils/worldBackgrounds';
import RateUsPopup, { shouldShowRatePrompt } from './RateUsPopup';
import LanguageSelectScreen, { hasChosenLanguage } from './LanguageSelectScreen';
import spaceBackground from '@/assets/space-background.jpg';
import { Pause, Play } from 'lucide-react';

const STORAGE_KEY = 'neon_breaker_highscore';
const LEVEL_KEY = 'neon_breaker_unlocked_level';
const COINS_KEY = 'neon_breaker_coins';
const LIVES_KEY = 'neon_breaker_lives';
const LAST_LIFE_REGEN_KEY = 'neon_breaker_last_regen';

const MAX_LIVES = 3;
const REGEN_TIME = 15 * 60 * 1000; // 15 minutes

const getStoredLives = (): number => {
  try { return Math.min(MAX_LIVES, parseInt(localStorage.getItem(LIVES_KEY) || '3', 10)); } catch { return 3; }
};
const setStoredLives = (lives: number) => {
  try { localStorage.setItem(LIVES_KEY, lives.toString()); } catch {}
};
const getStoredLastRegen = (): number => {
  try { return parseInt(localStorage.getItem(LAST_LIFE_REGEN_KEY) || Date.now().toString(), 10); } catch { return Date.now(); }
};
const setStoredLastRegen = (time: number) => {
  try { localStorage.setItem(LAST_LIFE_REGEN_KEY, time.toString()); } catch {}
};

const getStoredHighScore = (): number => {
  try { return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10); } catch { return 0; }
};
const setStoredHighScore = (score: number) => {
  try { localStorage.setItem(STORAGE_KEY, score.toString()); } catch {}
};
const getStoredUnlockedLevel = (): number => {
  try { return parseInt(localStorage.getItem(LEVEL_KEY) || '1', 10); } catch { return 1; }
};
const setStoredUnlockedLevel = (level: number) => {
  try { localStorage.setItem(LEVEL_KEY, level.toString()); } catch {}
};
const getStoredCoins = (): number => {
  try { return parseInt(localStorage.getItem(COINS_KEY) || '0', 10); } catch { return 0; }
};
const setStoredCoins = (coins: number) => {
  try { localStorage.setItem(COINS_KEY, coins.toString()); } catch {}
};

type ScreenState = 'splash' | 'menu' | 'playing' | 'paused' | 'gameover' | 'levelcomplete' | 'won';
type ModalType = 'none' | 'daily' | 'wheel' | 'shop' | 'tutorial';

const EMERGENCY_PRICES: Record<string, { cost: number; label: string }> = {
  auto: { cost: 50, label: 'Auto Paddle' },
  shock: { cost: 75, label: 'Electric Shock' },
  multi: { cost: 100, label: 'Three-Ball' },
  laser: { cost: 60, label: 'Laser Gun' },
};

const getEmergencyCounts = () => {
  try {
    return {
      auto: parseInt(localStorage.getItem('neon_breaker_em_auto') || '5'),
      shock: parseInt(localStorage.getItem('neon_breaker_em_shock') || '5'),
      multi: parseInt(localStorage.getItem('neon_breaker_em_multi') || '4'),
      laser: parseInt(localStorage.getItem('neon_breaker_em_laser') || '3'),
    };
  } catch { return { auto: 5, shock: 5, multi: 4, laser: 3 }; }
};

const BrickBreakerGame: React.FC = () => {
  const [showLangSelect, setShowLangSelect] = useState(() => !hasChosenLanguage());
  const [showRatePopup, setShowRatePopup] = useState(false);
  const [screenState, setScreenState] = useState<ScreenState>('splash');
  const [unlockedLevel, setUnlockedLevel] = useState(getStoredUnlockedLevel());
  const [persistentCoins, setPersistentCoins] = useState(getStoredCoins());
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [pendingPowerUps, setPendingPowerUps] = useState<string[]>([]);
  const [emergencyCounts, setEmergencyCounts] = useState(getEmergencyCounts);
  const emergencyRef = useRef<string | null>(null);
  const pendingNextLevelRef = useRef<number | null>(null);
  const [buyPrompt, setBuyPrompt] = useState<'auto' | 'shock' | 'multi' | 'laser' | null>(null);
  const [lives, setLives] = useState(getStoredLives);
  const [lastRegen, setLastRegen] = useState(getStoredLastRegen);
  const [showDaily, setShowDaily] = useState(false);

  // Check daily reward on startup
  useEffect(() => {
    const { shouldShow } = checkDailyReward();
    if (shouldShow) {
      setTimeout(() => setShowDaily(true), 2000);
    }
  }, []);

  // Life regeneration logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (lives < MAX_LIVES) {
        const now = Date.now();
        const diff = now - lastRegen;
        if (diff >= REGEN_TIME) {
          const newLives = Math.min(MAX_LIVES, lives + 1);
          setLives(newLives);
          setStoredLives(newLives);
          setLastRegen(now);
          setStoredLastRegen(now);
        }
      }
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [lives, lastRegen]);

  // BACK BUTTON HANDLER - Correct position to avoid Black Screen
  useEffect(() => {
    const backListener = App.addListener('backButton', () => {
      if (screenState === 'playing' || screenState === 'paused' || screenState === 'gameover' || screenState === 'levelcomplete') {
        setScreenState('menu');
      } else if (screenState === 'menu' || screenState === 'splash') {
        App.exitApp();
      }
    });
    return () => { backListener.then(l => l.remove()); };
  }, [screenState]);

  // #8 Pause everything when app is minimized / screen locked (Capacitor + web fallback)
  useEffect(() => {
    const pauseAll = () => {
      try { audioManager.stopBackgroundMusic(); } catch {}
      setScreenState(prev => (prev === 'playing' ? 'paused' : prev));
      setGameState(prev => (prev.status === 'playing' ? { ...prev, status: 'paused' } : prev));
    };
    const stateSub = App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) pauseAll();
    });
    const onVis = () => { if (document.hidden) pauseAll(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stateSub.then(l => l.remove());
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const [gameState, setGameState] = useState<GameState>({
    status: 'menu',
    score: 0,
    lives: 3,
    level: 1,
    highScore: getStoredHighScore(),
    coins: 0,
    combo: 0,
    maxCombo: 0,
  });

  const [isNewHighScore, setIsNewHighScore] = useState(false);

  useEffect(() => {
    // Initialize billing and restore any unconsumed purchases
    initBilling().then(async (ok) => {
      console.log('[Billing] Init result:', ok);
      if (ok) {
        const restoredCoins = await restoreUnconsumedPurchases();
        if (restoredCoins > 0) {
          setGameState(prev => ({ ...prev, coins: prev.coins + restoredCoins }));
          console.log('[Billing] Restored', restoredCoins, 'coins from unconsumed purchases');
        }
      }
    });
    // Initialize AdMob
    initAdMob().then(ok => { 
      console.log('[AdMob] Init result:', ok);
      if (ok) { showBannerAd(); preloadInterstitial(); } 
    });
    initDailyReminder();
  }, []);

  useEffect(() => {
    if (screenState === 'gameover' || screenState === 'won' || screenState === 'levelcomplete') {
      if (gameState.score > gameState.highScore) {
        setStoredHighScore(gameState.score);
        setGameState(prev => ({ ...prev, highScore: gameState.score }));
        setIsNewHighScore(true);
      }
      if (screenState === 'levelcomplete' || screenState === 'won') {
        const nextLevel = gameState.level + 1;
        if (nextLevel > unlockedLevel) {
          setUnlockedLevel(nextLevel);
          setStoredUnlockedLevel(nextLevel);
        }
        const stars = calculateStars(gameState.lives, gameState.maxCombo, gameState.score, gameState.level);
        setLevelStars(gameState.level, stars);
        
        const coinReward = 1; // Fixed 1 coin per level completion
        const newTotal = persistentCoins + gameState.coins + coinReward;
        setPersistentCoins(newTotal);
        setStoredCoins(newTotal);
      }
    }
  }, [screenState, gameState.score, gameState.highScore, gameState.level, unlockedLevel]);

  const handlePlayFromSplash = useCallback(() => {
    setScreenState('menu');
    if (!hasSeenTutorial()) {
      setTimeout(() => setActiveModal('tutorial'), 300);
      return;
    }
    const { shouldShow } = checkDailyReward();
    if (shouldShow) {
      setTimeout(() => setActiveModal('daily'), 400);
    }
  }, []);

  const handleTutorialClose = useCallback(() => {
    setActiveModal('none');
    const { shouldShow } = checkDailyReward();
    if (shouldShow) {
      setTimeout(() => setActiveModal('daily'), 300);
    }
  }, []);

  const handleDailyRewardClose = useCallback((reward?: { type: string; amount: number }) => {
    setActiveModal('none');
    if (reward) {
      if (reward.type === 'coins') {
        const newTotal = persistentCoins + reward.amount;
        setPersistentCoins(newTotal);
        setStoredCoins(newTotal);
      } else {
        setPendingPowerUps(prev => [...prev, reward.type]);
      }
    }
  }, [persistentCoins]);

  const handleWheelClose = useCallback((reward?: { type: string; amount: number; label: string }) => {
    setActiveModal('none');
    if (reward) {
      if (reward.type === 'coins') {
        const newTotal = persistentCoins + reward.amount;
        setPersistentCoins(newTotal);
        setStoredCoins(newTotal);
      } else if (['auto', 'shock', 'multi'].includes(reward.type)) {
        setEmergencyCounts(prev => {
          const key = reward.type as 'auto' | 'shock' | 'multi';
          const newVal = prev[key] + reward.amount;
          const updated = { ...prev, [key]: newVal };
          try { localStorage.setItem(`neon_breaker_em_${key}`, newVal.toString()); } catch {}
          return updated;
        });
      } else {
        setPendingPowerUps(prev => [...prev, reward.type]);
      }
    }
  }, [persistentCoins]);

  const handleShopPurchase = useCallback((item: ShopItem) => {
    if (persistentCoins < item.cost) return;
    const newTotal = persistentCoins - item.cost;
    setPersistentCoins(newTotal);
    setStoredCoins(newTotal);
    if (item.category === 'emergency') {
      const key = item.type as 'auto' | 'shock' | 'multi' | 'laser';
      setEmergencyCounts(prev => {
        const newVal = prev[key] + 1;
        const updated = { ...prev, [key]: newVal };
        try { localStorage.setItem(`neon_breaker_em_${key}`, newVal.toString()); } catch {}
        return updated;
      });
    } else if (item.category === 'powerup') {
      setPendingPowerUps(prev => [...prev, item.type]);
    }
  }, [persistentCoins]);

  const handleBackToSplash = useCallback(() => {
    setScreenState('splash');
  }, []);

  const handleStartGame = useCallback((level: number = 1) => {
    // Lives are per-level: always start a new level with 3 lives.
    setIsNewHighScore(false);
    setGameState({
      status: 'playing',
      score: 0,
      lives: 3,
      level: level,
      highScore: getStoredHighScore(),
      coins: 0,
      combo: 0,
      maxCombo: 0,
    });
    setScreenState('playing');
  }, []);

  const handleGameOver = useCallback(() => {
    // Lives are per-level only — no persistent life system, no shop gating.
    setScreenState('gameover');
    setGameState(prev => ({ ...prev, status: 'gameover' }));
  }, []);

  const handleLevelComplete = useCallback(() => {
    const totalLevels = getTotalLevels();
    
    // Ad moved to handleNextLevel so it shows BEFORE game starts

    if (gameState.level === 10 && shouldShowRatePrompt(10)) {
      setTimeout(() => setShowRatePopup(true), 600);
    }
    if (gameState.level >= totalLevels) {
      setScreenState('won');
      setGameState(prev => ({ ...prev, status: 'won' }));
    } else {
      setScreenState('levelcomplete');
      setGameState(prev => ({ ...prev, status: 'levelcomplete' }));
    }
  }, [gameState.level]);

  const handleNextLevel = useCallback(() => {
    const nextLevel = gameState.level + 1;

    // #2 Show interstitial only every 3 levels.
    // #9 Skip ad entirely when offline so next level starts instantly.
    const online = typeof navigator === 'undefined' ? true : navigator.onLine !== false;
        const shouldShowAd = nextLevel >= 15
      && (nextLevel - 15) % 3 === 0

      && online
      && !isAdsRemoved();


    if (shouldShowAd) {
      pendingNextLevelRef.current = nextLevel;
      audioManager.stopBackgroundMusic();
     showInterstitialAd(
  "Between_Levels",
  () => { /* ad is showing */ },
  () => {
          const lvl = pendingNextLevelRef.current;
          pendingNextLevelRef.current = null;
          if (!audioManager.isMuted) audioManager.startBackgroundMusic();
          if (lvl) {
            setGameState(prev => ({
              ...prev,
              status: 'playing',
              level: lvl,
              lives: 3,
            }));
            setScreenState('playing');
            preloadInterstitial();
          }
        }
      );
      
    } else {
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        level: nextLevel,
        lives: 3,
      }));
      setScreenState('playing');
      if (online) preloadInterstitial();
    }
  }, [gameState.level]);

  const handleReplayLevel = useCallback(() => {
    setIsNewHighScore(false);
    const currentLevel = gameState.level;
    const currentHighScore = gameState.highScore;
    setScreenState('menu');
    requestAnimationFrame(() => {
      setTimeout(() => {
        setGameState({
          status: 'playing',
          score: 0,
          lives: 3,
          level: currentLevel,
          highScore: currentHighScore,
          coins: 0,
          combo: 0,
          maxCombo: 0,
        });
        setScreenState('playing');
      }, 100);
    });
  }, [gameState.level, gameState.highScore]);

    const handleMainMenu = useCallback(() => {
    audioManager.setBossMode(false);
    audioManager.stopBackgroundMusic();
    setScreenState('menu');
    setGameState(prev => ({
      ...prev,
      status: 'menu',
      score: 0,
      lives: 3,
      level: prev.level,
    }));
  }, []);

  const handleScoreChange = useCallback((newScore: number) => {
    setGameState(prev => ({ ...prev, score: newScore }));
  }, []);

  const handleRestart = useCallback(() => {
    setIsNewHighScore(false);
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      score: 0,
      lives: 3,
      level: prev.level,
      coins: 0,
      combo: 0,
      maxCombo: 0,
    }));
    setScreenState('playing');
  }, []);

  useEffect(() => {
    if (screenState === 'levelcomplete' || screenState === 'won') {
      audioManager.playLevelComplete();
    } else if (screenState === 'gameover') {
      audioManager.playGameOver();
    }
  }, [screenState]);

  useEffect(() => {
    // Keep music running across level transitions (levelcomplete -> playing)
    // so it never stutters on/off between levels.
    const inGame =
      screenState === 'playing' ||
      screenState === 'paused' ||
      screenState === 'levelcomplete';
    if (inGame && !isAdActive() && !audioManager.isMuted) {
      audioManager.startBackgroundMusic();
    } else if (!inGame) {
      audioManager.stopBackgroundMusic();
    }
  }, [screenState]);

  const handleTogglePause = useCallback(() => {
    if (screenState === 'playing') {
      setScreenState('paused');
      setGameState(prev => ({ ...prev, status: 'paused' }));
    } else if (screenState === 'paused') {
      setScreenState('playing');
      setGameState(prev => ({ ...prev, status: 'playing' }));
    }
  }, [screenState]);

  const handleEmergencyPowerUp = useCallback((type: 'auto' | 'shock' | 'multi' | 'laser') => {
    if (screenState !== 'playing') return;
    if (emergencyCounts[type] <= 0) {
      setBuyPrompt(type);
      setScreenState('paused');
      setGameState(prev => ({ ...prev, status: 'paused' }));
      return;
    }
    emergencyRef.current = type;
    setEmergencyCounts(prev => {
      const newVal = prev[type] - 1;
      const updated = { ...prev, [type]: newVal };
      try { localStorage.setItem(`neon_breaker_em_${type}`, newVal.toString()); } catch {}
      return updated;
    });
  }, [emergencyCounts, screenState]);

  const handleBuyEmergency = useCallback(() => {
    if (!buyPrompt) return;
    const price = EMERGENCY_PRICES[buyPrompt].cost;
    if (persistentCoins < price) { setBuyPrompt(null); return; }
    const newCoins = persistentCoins - price;
    setPersistentCoins(newCoins);
    setStoredCoins(newCoins);
    const key = buyPrompt as 'auto' | 'shock' | 'multi' | 'laser';
    setEmergencyCounts(prev => {
      const newVal = prev[key] + 1;
      const updated = { ...prev, [key]: newVal };
      try { localStorage.setItem(`neon_breaker_em_${key}`, newVal.toString()); } catch {}
      return updated;
    });
    setBuyPrompt(null);
    setScreenState('playing');
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, [buyPrompt, persistentCoins]);

  const handleCancelBuy = useCallback(() => {
    setBuyPrompt(null);
    setScreenState('playing');
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  if (showLangSelect) {
    return <LanguageSelectScreen onDone={() => setShowLangSelect(false)} />;
  }

  if (screenState === 'splash') {
    return <SplashScreen onPlay={handlePlayFromSplash} />;
  }

  if (screenState === 'menu') {
    return (
      <>
        <MainMenuScreen
          highScore={gameState.highScore}
          unlockedLevel={unlockedLevel}
          persistentCoins={persistentCoins}
          onStartGame={handleStartGame}
          onBack={handleBackToSplash}
          onOpenShop={() => setActiveModal('shop')}
          onOpenWheel={() => setActiveModal('wheel')}
        />
        {activeModal === 'tutorial' && <TutorialOverlay onClose={handleTutorialClose} />}
        {activeModal === 'daily' && <DailyRewards onClose={handleDailyRewardClose} />}
        {activeModal === 'wheel' && <LuckyWheel onClose={handleWheelClose} />}
        {activeModal === 'shop' && (
          <ShopScreen
            coins={persistentCoins}
            onPurchase={handleShopPurchase}
            onAddCoins={(amount: number) => {
              const newTotal = persistentCoins + amount;
              setPersistentCoins(newTotal);
              setStoredCoins(newTotal);
            }}
            onClose={() => setActiveModal('none')}
          />
        )}
      </>
    );
  }

  const worldBg = getWorldBg(gameState.level);
  return (
    <div 
      className="flex flex-col items-center justify-center p-0 select-none overflow-hidden"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${getWorldBg(gameState.level)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      {showRatePopup && <RateUsPopup onClose={() => setShowRatePopup(false)} />}
      {showDaily && <DailyRewards onClose={(reward) => {
        setShowDaily(false);
        if (reward) {
          const newTotal = persistentCoins + reward.amount;
          setPersistentCoins(newTotal);
          setStoredCoins(newTotal);
          toast.success(`Daily Bonus: +${reward.amount} Coins!`);
        }
      }} />}

      
      <div className="relative z-10">
        <GameUI gameState={gameState} persistentCoins={persistentCoins} onTogglePause={handleTogglePause} isPaused={screenState === 'paused'} isPlaying={screenState === 'playing' || screenState === 'paused'} />
      </div>

      <div className="relative z-10">
        <GameCanvas
          gameState={gameState}
          setGameState={setGameState}
          onGameOver={handleGameOver}
          onLevelComplete={handleLevelComplete}
          onScoreChange={handleScoreChange}
          emergencyRef={emergencyRef}
        />

        {screenState === 'playing' && (gameState.autoTimer || gameState.shieldTimer || gameState.ghostTimer) ? (
          <div
            className="absolute left-0 top-2 z-40 flex max-w-[230px] flex-wrap items-center gap-1 pointer-events-none animate-pulse"
          >
            {gameState.autoTimer && gameState.autoTimer > 0 ? (
              <div className="flex items-center gap-1 rounded-md px-2 py-0.5" style={{ background: 'rgba(0, 20, 30, 0.88)', border: '1px solid rgba(0, 200, 100, 0.9)', boxShadow: '0 0 8px rgba(0,200,100,0.5)' }}>
                <span className="text-[10px]">🎯</span>
                <span className="font-display text-[10px] font-bold leading-none" style={{ color: '#00ff88' }}>AUTO {gameState.autoTimer}s</span>
              </div>
            ) : null}
            {gameState.shieldTimer && gameState.shieldTimer > 0 ? (
              <div className="flex items-center gap-1 rounded-md px-2 py-0.5" style={{ background: 'rgba(0, 20, 30, 0.88)', border: '1px solid rgba(0, 150, 255, 0.9)', boxShadow: '0 0 8px rgba(0,150,255,0.5)' }}>
                <span className="text-[10px]">🛡️</span>
                <span className="font-display text-[10px] font-bold leading-none" style={{ color: '#00aaff' }}>SHIELD {gameState.shieldTimer}s</span>
              </div>
            ) : null}
            {gameState.ghostTimer && gameState.ghostTimer > 0 ? (
              <div className="flex items-center gap-1 rounded-md px-2 py-0.5" style={{ background: 'rgba(0, 20, 30, 0.88)', border: '1px solid rgba(200, 100, 255, 0.9)', boxShadow: '0 0 8px rgba(200,100,255,0.5)' }}>
                <span className="text-[10px]">👻</span>
                <span className="font-display text-[10px] font-bold leading-none" style={{ color: '#cc66ff' }}>GHOST {gameState.ghostTimer}s</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {screenState === 'playing' && (
          <div className="absolute flex flex-col items-center z-30" style={{ right: '6px', bottom: '80px', gap: '8px', opacity: 0.5 }}>
            {([
              { key: 'auto' as const, label: 'AUTO', isText: true, kind: 'text' as const },
              { key: 'shock' as const, label: '⚡', isText: false, kind: 'emoji' as const },
              { key: 'multi' as const, label: null, isText: false, kind: 'multi' as const },
              { key: 'laser' as const, label: null, isText: false, kind: 'laser' as const },
            ]).map((btn) => (
              <button
                key={btn.key}
                onPointerDown={(e) => { e.stopPropagation(); handleEmergencyPowerUp(btn.key); }}
                disabled={emergencyCounts[btn.key] <= 0}
                className="relative flex items-center justify-center transition-all active:scale-90 disabled:opacity-20"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: emergencyCounts[btn.key] > 0
                    ? 'radial-gradient(circle at 40% 35%, hsl(200, 100%, 72%), hsl(210, 85%, 50%))'
                    : 'radial-gradient(circle at 40% 35%, hsl(200, 15%, 35%), hsl(210, 15%, 25%))',
                  boxShadow: emergencyCounts[btn.key] > 0
                    ? '0 0 20px hsla(200, 100%, 60%, 0.6), 0 0 40px hsla(200, 100%, 50%, 0.2), inset 0 -4px 10px hsla(210, 100%, 25%, 0.5), inset 0 3px 6px hsla(200, 100%, 85%, 0.4)'
                    : 'none',
                  border: '3px solid hsla(195, 100%, 75%, 0.6)',
                }}
              >
                {btn.kind === 'multi' ? (
                  <svg width="22" height="22" viewBox="0 0 28 28">
                    <circle cx="14" cy="8" r="5" fill="white" />
                    <circle cx="7" cy="20" r="5" fill="white" />
                    <circle cx="21" cy="20" r="5" fill="white" />
                  </svg>
                ) : btn.kind === 'laser' ? (
                  // Laser icon: white paddle with two red laser beams (matches
                  // the in-game laser power-up icon in powerUpRenderer).
                  <svg width="24" height="24" viewBox="0 0 28 28">
                    {/* red laser beams shooting up */}
                    <rect x="6.5" y="4" width="2.2" height="10" rx="1" fill="#ff2a2a" />
                    <rect x="19.3" y="4" width="2.2" height="10" rx="1" fill="#ff2a2a" />
                    {/* beam tips */}
                    <polygon points="6.5,4 7.6,1.5 8.7,4" fill="#ff2a2a" />
                    <polygon points="19.3,4 20.4,1.5 21.5,4" fill="#ff2a2a" />
                    {/* white paddle */}
                    <rect x="4" y="16" width="20" height="5" rx="2.5" fill="white" />
                  </svg>
                ) : btn.isText ? (
                  <span className="font-bold text-sm leading-none" style={{ color: 'hsl(50, 100%, 55%)', textShadow: '0 0 10px hsla(50, 100%, 50%, 0.8), 0 1px 2px rgba(0,0,0,0.5)', fontFamily: 'Orbitron, sans-serif' }}>{btn.label}</span>
                ) : (
                  <span className="text-white font-bold text-xl leading-none" style={{ textShadow: '0 0 10px hsla(200, 100%, 70%, 0.9), 0 1px 2px rgba(0,0,0,0.5)' }}>{btn.label}</span>
                )}
                <span className="absolute flex items-center justify-center" style={{ bottom: '-3px', right: '-3px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.75)', border: '1.5px solid hsla(200, 100%, 70%, 0.4)' }}>
                  <span className="text-white font-bold" style={{ fontSize: '11px' }}>{emergencyCounts[btn.key]}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {screenState === 'paused' && buyPrompt && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg z-50">
            <div className="text-center p-6 rounded-xl border border-neon-cyan/30" style={{ background: 'linear-gradient(135deg, hsl(220,60%,8%), hsl(220,50%,14%))' }}>
              <h2 className="font-display text-xl text-neon-cyan text-glow-cyan mb-2">BUY POWER-UP</h2>
              <p className="text-foreground/80 text-sm mb-1">{EMERGENCY_PRICES[buyPrompt].label}</p>
              <p className="text-neon-yellow font-bold text-lg mb-4">🪙 {EMERGENCY_PRICES[buyPrompt].cost} Coins</p>
              <p className="text-muted-foreground text-xs mb-4">You have: 🪙 {persistentCoins}</p>
              <div className="flex flex-col gap-2">
                <button onClick={handleBuyEmergency} disabled={persistentCoins < EMERGENCY_PRICES[buyPrompt].cost} className="w-48 py-3 px-6 bg-gradient-to-r from-neon-cyan to-neon-cyan/70 hover:from-neon-cyan/90 hover:to-neon-cyan/60 text-black font-display text-base rounded-lg transition-all transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100">
                  {persistentCoins >= EMERGENCY_PRICES[buyPrompt].cost ? 'BUY' : 'NOT ENOUGH'}
                </button>
                <button onClick={handleCancelBuy} className="w-48 py-2 px-6 bg-muted/30 hover:bg-muted/50 text-foreground/70 font-display text-sm rounded-lg transition-all">CANCEL</button>
              </div>
            </div>
          </div>
        )}

        {screenState === 'paused' && !buyPrompt && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
            <div className="text-center p-6">
              <h2 className="font-display text-3xl text-neon-cyan text-glow-cyan mb-6">PAUSED</h2>
              <div className="flex flex-col gap-3">
                <button onClick={handleTogglePause} className="w-48 py-3 px-6 bg-gradient-to-r from-neon-cyan to-neon-cyan/70 hover:from-neon-cyan/90 hover:to-neon-cyan/60 text-black font-display text-lg rounded-lg transition-all transform hover:scale-105">RESUME</button>
                <button onClick={handleReplayLevel} className="w-48 py-3 px-6 bg-gradient-to-r from-neon-yellow to-neon-yellow/70 hover:from-neon-yellow/90 hover:to-neon-yellow/60 text-black font-display text-lg rounded-lg transition-all transform hover:scale-105">RETRY</button>
                <button onClick={handleMainMenu} className="w-48 py-3 px-6 bg-gradient-to-r from-muted-foreground to-muted-foreground/70 hover:from-muted-foreground/90 hover:to-muted-foreground/60 text-black font-display text-lg rounded-lg transition-all transform hover:scale-105">MAIN MENU</button>
              </div>
            </div>
          </div>
        )}
        
        {screenState === 'gameover' && <GameOverScreen gameState={gameState} isNewHighScore={isNewHighScore} onRestart={handleRestart} onMainMenu={handleMainMenu} />}
        {(screenState === 'levelcomplete' || screenState === 'won') && <LevelCompleteScreen gameState={gameState} onNextLevel={handleNextLevel} onReplay={handleReplayLevel} onMainMenu={handleMainMenu} />}
      </div>
    </div>
  );
};

export default BrickBreakerGame;
