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
import { audioManager } from '@/utils/audioManager';
import { initBilling } from '@/utils/billing';
import { initAdMob, showBannerAd, showInterstitialAd } from '@/utils/admob';
import { calculateStars, setLevelStars } from '@/utils/starStorage';
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
type ModalType = 'none' | 'daily' | 'wheel' | 'shop';

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
    initBilling().then(ok => ok && console.log('[Billing] Ready'));
    initAdMob().then(ok => { if (ok) { console.log('[AdMob] Ready'); showBannerAd(); } });
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
    const { shouldShow } = checkDailyReward();
    if (shouldShow) {
      setTimeout(() => setActiveModal('daily'), 400);
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
    showInterstitialAd();
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
      level: 1,
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
      level: 1,
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

  const handleTogglePause = useCallback(() => {
    if (screenState === 'playing') {
      setScreenState('paused');
      setGameState(prev => ({ ...prev, status: 'paused' }));
    } else if (screenState === 'paused') {
      setScreenState('playing');
      setGameState(prev => ({ ...prev, status: 'playing' }));
    }
  }, [screenState]);

  const handleEmergencyPowerUp = useCallback((type: 'auto' | 'shock' | 'multi') => {
    if (screenState !== 'playing') return;
    if (emergencyCounts[type] <= 0) {
      // Show buy prompt and pause game
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
    // Add to inventory only - don't use immediately
    const key = buyPrompt as 'auto' | 'shock' | 'multi';
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

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 select-none"
      style={{
  background: 'hsl(220, 60%, 3%)',
}}
    >
      <div className="fixed inset-0 bg-black/40 pointer-events-none" />
      
      <AudioControls isPlaying={screenState === 'playing' || screenState === 'paused'} />
      
      {(screenState === 'playing' || screenState === 'paused') && (
        <button
          onClick={handleTogglePause}
          className="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border hover:bg-background transition-colors"
        >
          {screenState === 'paused' ? (
            <Play className="w-5 h-5 text-neon-cyan" />
          ) : (
            <Pause className="w-5 h-5 text-neon-cyan" />
          )}
        </button>
      )}
      
      <div className="relative z-10 mb-4 text-center">
        <h1 className="font-display text-2xl font-bold text-glow-cyan text-foreground">
          NEON BREAKER
        </h1>
      </div>

      <div className="relative z-10">
        <GameUI gameState={gameState} persistentCoins={persistentCoins} />
      </div>

      <div className="relative z-10">
        <GameCanvas
          gameState={gameState}
          setGameState={setGameState}
          onGameOver={handleGameOver}
          onLevelComplete={handleLevelComplete}
          // Award level completion bonus
          onScoreChange={handleScoreChange}
          emergencyRef={emergencyRef}
        />

        {/* Emergency Powerup Buttons - bottom right, matching reference image */}
        {screenState === 'playing' && (
          <div className="absolute flex flex-col items-center z-30" style={{ right: '8px', bottom: '80px', gap: '10px' }}>
            {([
              { key: 'auto' as const, label: 'AUTO', isText: true },
              { key: 'shock' as const, label: '⚡', isText: false },
              { key: 'multi' as const, label: null, isText: false },
            ]).map((btn) => (
              <button
                key={btn.key}
                onPointerDown={(e) => { e.stopPropagation(); handleEmergencyPowerUp(btn.key); }}
                disabled={emergencyCounts[btn.key] <= 0}
                className="relative flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
                style={{
                  width: '55px',
                  height: '55px',
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
                {btn.label === null ? (
                  /* Three balls icon */
                  <svg width="28" height="28" viewBox="0 0 28 28">
                    <circle cx="14" cy="8" r="5" fill="white" />
                    <circle cx="7" cy="20" r="5" fill="white" />
                    <circle cx="21" cy="20" r="5" fill="white" />
                  </svg>
                ) : btn.isText ? (
                  <span className="font-bold text-base leading-none"
                    style={{ color: 'hsl(50, 100%, 55%)', textShadow: '0 0 10px hsla(50, 100%, 50%, 0.8), 0 1px 2px rgba(0,0,0,0.5)', fontFamily: 'Orbitron, sans-serif' }}
                  >
                    {btn.label}
                  </span>
                ) : (
                  <span className="text-white font-bold text-2xl leading-none"
                    style={{ textShadow: '0 0 10px hsla(200, 100%, 70%, 0.9), 0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    {btn.label}
                  </span>
                )}
                <span className="absolute flex items-center justify-center" style={{ bottom: '-4px', right: '-4px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.75)', border: '1.5px solid hsla(200, 100%, 70%, 0.4)' }}>
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

        {screenState === 'paused' && !buyPrompt && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
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
        
        {screenState === 'gameover' && (
          <GameOverScreen
            gameState={gameState}
            isNewHighScore={isNewHighScore}
            onRestart={handleRestart}
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

      <div className="relative z-10 mt-4 text-center text-muted-foreground font-game text-sm">
        <p>Move paddle with mouse or touch</p>
      </div>
    </div>
  );
};

export default BrickBreakerGame;
