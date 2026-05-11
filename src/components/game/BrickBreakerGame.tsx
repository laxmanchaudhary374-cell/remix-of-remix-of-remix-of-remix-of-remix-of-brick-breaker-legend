import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { initBilling, setPurchaseCallback } from '@/utils/billing';
import { initAdMob, showBannerAd, showInterstitialAd, setAdRewardCallback } from '@/utils/admob';
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
};

const getEmergencyCounts = () => {
  try {
    return {
      auto: parseInt(localStorage.getItem('neon_breaker_em_auto') || '5'),
      shock: parseInt(localStorage.getItem('neon_breaker_em_shock') || '5'),
      multi: parseInt(localStorage.getItem('neon_breaker_em_multi') || '4'),
    };
  } catch { return { auto: 5, shock: 5, multi: 4 }; }
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
  const [buyPrompt, setBuyPrompt] = useState<'auto' | 'shock' | 'multi' | null>(null);

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

  // Initialize native monetization SDKs on mount
  useEffect(() => {
    // 1. Register monetization callbacks FIRST
    setAdRewardCallback((amount: number) => {
      setPersistentCoins(prev => {
        const newTotal = prev + amount;
        setStoredCoins(newTotal);
        return newTotal;
      });
    });

    setPurchaseCallback((coins: number) => {
      setPersistentCoins(prev => {
        const newTotal = prev + coins;
        setStoredCoins(newTotal);
        return newTotal;
      });
    });

    // 2. Then initialize plugins in the background
    initBilling().then(ok => ok && console.log('[Billing] Ready'));
    initAdMob().then(ok => { 
      if (ok) { 
        console.log('[AdMob] Ready'); 
        showBannerAd(); 
      } 
    });
    
    initDailyReminder();
  }, []);


  // Update high score and unlocked level when game ends
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
        // Save star rating for this level
        const stars = calculateStars(gameState.lives, gameState.maxCombo, gameState.score, gameState.level);
        setLevelStars(gameState.level, stars);
        
        const coinReward = gameState.level <= 10 ? 2 :
  gameState.level <= 20 ? 3 :
  gameState.level <= 30 ? 4 :
  gameState.level <= 50 ? 5 : 6;
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
      // Increment emergency power-up counts (auto, shock, multi)
      const key = item.type as 'auto' | 'shock' | 'multi';
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
    setScreenState('gameover');
    setGameState(prev => ({ ...prev, status: 'gameover' }));
  }, []);

  const handleLevelComplete = useCallback(() => {
    const totalLevels = getTotalLevels();
    // No interstitial ads for first 9 levels — give new players a smooth start.
    if (gameState.level >= 10) showInterstitialAd();
    // Rate-us prompt after first level-10 completion
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
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      level: prev.level + 1,
      lives: 3,
    }));
    setScreenState('playing');
  }, []);

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
      }, 80);
    });
  }, [gameState.level, gameState.highScore]);

  const handleMainMenu = useCallback(() => {
    setScreenState('menu');
    setGameState(prev => ({
      ...prev,
      status: 'menu',
      score: 0,
      lives: 3,
      coins: 0,
      combo: 0,
      maxCombo: 0,
    }));
  }, []);

  const handleTogglePause = useCallback(() => {
    setScreenState(prev => prev === 'playing' ? 'paused' : 'playing');
  }, []);

  const handleBuyEmergency = useCallback(() => {
    if (!buyPrompt) return;
    const cost = EMERGENCY_PRICES[buyPrompt].cost;
    if (persistentCoins >= cost) {
      const newTotal = persistentCoins - cost;
      setPersistentCoins(newTotal);
      setStoredCoins(newTotal);
      setEmergencyCounts(prev => {
        const newVal = prev[buyPrompt] + 1;
        const updated = { ...prev, [buyPrompt]: newVal };
        try { localStorage.setItem(`neon_breaker_em_${buyPrompt}`, newVal.toString()); } catch {}
        return updated;
      });
      setBuyPrompt(null);
      setScreenState('playing');
    }
  }, [buyPrompt, persistentCoins]);

  const handleCancelBuy = useCallback(() => {
    setBuyPrompt(null);
    setScreenState('playing');
  }, []);

  const handleUseEmergency = useCallback((type: 'auto' | 'shock' | 'multi') => {
    if (emergencyCounts[type] > 0) {
      setEmergencyCounts(prev => {
        const newVal = prev[type] - 1;
        const updated = { ...prev, [type]: newVal };
        try { localStorage.setItem(`neon_breaker_em_${type}`, newVal.toString()); } catch {}
        return updated;
      });
      emergencyRef.current = type;
      setScreenState('playing');
    } else {
      setBuyPrompt(type);
      setScreenState('paused');
    }
  }, [emergencyCounts]);

  const handleEmergencyUsed = useCallback(() => {
    emergencyRef.current = null;
  }, []);

  const handleAddCoins = useCallback((amount: number) => {
    const newTotal = persistentCoins + amount;
    setPersistentCoins(newTotal);
    setStoredCoins(newTotal);
  }, [persistentCoins]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden font-sans select-none">
      <div className="relative mx-auto max-w-md h-screen shadow-2xl shadow-neon-cyan/20">
        {showLangSelect && (
          <LanguageSelectScreen onComplete={() => setShowLangSelect(false)} />
        )}
        
        {screenState === 'splash' && (
          <SplashScreen onPlay={handlePlayFromSplash} />
        )}
        
        {screenState === 'menu' && (
          <MainMenuScreen
            unlockedLevel={unlockedLevel}
            onStartGame={handleStartGame}
            onOpenWheel={() => setActiveModal('wheel')}
            onOpenShop={() => setActiveModal('shop')}
            onBack={handleBackToSplash}
            coins={persistentCoins}
          />
        )}
        
        {activeModal === 'daily' && (
          <DailyRewards onClose={handleDailyRewardClose} />
        )}
        
        {activeModal === 'wheel' && (
          <LuckyWheel onClose={handleWheelClose} coins={persistentCoins} onUpdateCoins={setPersistentCoins} />
        )}
        
        {activeModal === 'shop' && (
          <ShopScreen
            onClose={() => setActiveModal('none')}
            coins={persistentCoins}
            onAddCoins={handleAddCoins}
            onPurchase={handleShopPurchase}
          />
        )}
        
        {activeModal === 'tutorial' && (
          <TutorialOverlay onClose={handleTutorialClose} />
        )}

        {showRatePopup && (
          <RateUsPopup onClose={() => setShowRatePopup(false)} />
        )}
        
        {(screenState === 'playing' || screenState === 'paused') && (
          <div className="relative w-full h-full">
            <GameCanvas
              gameState={gameState}
              onGameOver={handleGameOver}
              onLevelComplete={handleLevelComplete}
              onScoreUpdate={(score, coins, combo, maxCombo) => setGameState(prev => ({ ...prev, score, coins, combo, maxCombo }))}
              onLivesUpdate={(lives) => setGameState(prev => ({ ...prev, lives }))}
              pendingPowerUps={pendingPowerUps}
              onPowerUpUsed={() => setPendingPowerUps([])}
              emergencyPowerUp={emergencyRef.current}
              onEmergencyUsed={handleEmergencyUsed}
            />
            
            <GameUI
              gameState={gameState}
              onTogglePause={handleTogglePause}
              onUseEmergency={handleUseEmergency}
              emergencyCounts={emergencyCounts}
            />

            <div className="absolute top-4 right-4 z-40">
              <button
                onClick={handleTogglePause}
                className="p-2 bg-black/40 backdrop-blur-md border border-neon-cyan/30 rounded-full text-neon-cyan hover:bg-neon-cyan/20 transition-all"
              >
                {screenState === 'paused' ? <Play size={24} /> : <Pause size={24} />}
              </button>
            </div>
          </div>
        )}
        
        {screenState === 'paused' && !buyPrompt && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg z-50">
            <div className="text-center p-6">
              <h2 className="font-display text-3xl text-neon-cyan text-glow-cyan mb-6">PAUSED</h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleTogglePause}
                  className="w-48 py-3 px-6 bg-gradient-to-r from-neon-cyan to-neon-cyan/70 hover:from-neon-cyan/90 hover:to-neon-cyan/60 text-black font-display text-lg rounded-lg transition-all transform hover:scale-105"
                >
                  RESUME
                </button>
                <button
                  onClick={handleReplayLevel}
                  className="w-48 py-3 px-6 bg-gradient-to-r from-neon-yellow to-neon-yellow/70 hover:from-neon-yellow/90 hover:to-neon-yellow/60 text-black font-display text-lg rounded-lg transition-all transform hover:scale-105"
                >
                  RETRY
                </button>
                <button
                  onClick={handleMainMenu}
                  className="w-48 py-3 px-6 bg-gradient-to-r from-muted-foreground to-muted-foreground/70 hover:from-muted-foreground/90 hover:to-muted-foreground/60 text-black font-display text-lg rounded-lg transition-all transform hover:scale-105"
                >
                  MAIN MENU
                </button>
              </div>
            </div>
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
                <button
                  onClick={handleBuyEmergency}
                  disabled={persistentCoins < EMERGENCY_PRICES[buyPrompt].cost}
                  className="w-48 py-3 px-6 bg-gradient-to-r from-neon-cyan to-neon-cyan/70 hover:from-neon-cyan/90 hover:to-neon-cyan/60 text-black font-display text-base rounded-lg transition-all transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                >
                  {persistentCoins >= EMERGENCY_PRICES[buyPrompt].cost ? 'BUY' : 'NOT ENOUGH'}
                </button>
                <button
                  onClick={handleCancelBuy}
                  className="w-48 py-2 px-6 bg-muted/30 hover:bg-muted/50 text-foreground/70 font-display text-sm rounded-lg transition-all"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}
        
        {screenState === 'gameover' && (
          <GameOverScreen
            gameState={gameState}
            isNewHighScore={isNewHighScore}
            onRestart={handleStartGame}
            onMainMenu={handleMainMenu}
          />
        )}
        {(screenState === 'levelcomplete' || screenState === 'won') && (
          <LevelCompleteScreen
            gameState={gameState}
            onNextLevel={handleNextLevel}
            onReplay={handleReplayLevel}
            onMainMenu={handleMainMenu}
          />
        )}
      </div>
    </div>
  );
};

export default BrickBreakerGame;
