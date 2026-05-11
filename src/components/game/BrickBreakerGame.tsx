import React, { useState, useEffect, useCallback, useRef } from 'react';
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

    // 2. Initialize SDKs
    const initMonetization = async () => {
      try {
        await initAdMob();
        await initBilling();
        initDailyReminder();
      } catch (err) {
        console.error('Monetization init failed:', err);
      }
    };
    initMonetization();
  }, []);

  useEffect(() => {
    if (gameState.score > gameState.highScore) {
      setGameState(prev => ({ ...prev, highScore: prev.score }));
      setStoredHighScore(gameState.score);
      setIsNewHighScore(true);
    }
  }, [gameState.score, gameState.highScore]);

  useEffect(() => {
    if (gameState.level > unlockedLevel) {
      setUnlockedLevel(gameState.level);
      setStoredUnlockedLevel(gameState.level);
    }
  }, [gameState.level, unlockedLevel]);

  const handleStartGame = useCallback((level: number) => {
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      score: 0,
      lives: 3,
      level: level,
      coins: 0,
      combo: 0,
      maxCombo: 0,
    }));
    setScreenState('playing');
    setIsNewHighScore(false);
    
    if (!hasSeenTutorial()) {
      setActiveModal('tutorial');
    }
  }, []);

  const handlePlayFromSplash = useCallback(() => {
    setScreenState('menu');
    if (checkDailyReward()) {
      setActiveModal('daily');
    }
  }, []);

  const handleBackToSplash = useCallback(() => {
    setScreenState('splash');
  }, []);

  const handleDailyRewardClose = useCallback((rewardCoins: number) => {
    if (rewardCoins > 0) {
      const newTotal = persistentCoins + rewardCoins;
      setPersistentCoins(newTotal);
      setStoredCoins(newTotal);
    }
    setActiveModal('none');
  }, [persistentCoins]);

  const handleWheelClose = useCallback(() => {
    setActiveModal('none');
    setStoredCoins(persistentCoins);
  }, [persistentCoins]);

  const handleTutorialClose = useCallback(() => {
    setActiveModal('none');
  }, []);

  const handleReplayLevel = useCallback(() => {
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

  const handleScoreChange = useCallback((score: number) => {
    setGameState(prev => ({ ...prev, score }));
  }, []);

  const handleGameOver = useCallback(() => {
    setScreenState('gameover');
    setGameState(prev => ({ ...prev, status: 'gameover' }));
  }, []);

  const handleLevelComplete = useCallback(() => {
    setGameState(prev => {
      if (prev.level >= 500) {
        setScreenState('won');
        return { ...prev, status: 'won' };
      }
      return { ...prev, level: prev.level + 1 };
    });
  }, []);

  const handleShopPurchase = useCallback((coins: number) => {
    handleAddCoins(coins);
  }, [handleAddCoins]);

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
          <div className="relative w-full h-full flex flex-col">
            {/* HUD at the top */}
            <div className="relative z-30 w-full pt-4 pb-2 flex items-center justify-between px-4">
              <h1 className="font-display text-2xl font-bold text-neon-cyan text-glow-cyan">NEON BREAKER</h1>
              <div className="flex items-center gap-2">
                <AudioControls isPlaying={screenState === 'playing'} />
                <button
                  onClick={() => setScreenState(prev => prev === 'playing' ? 'paused' : 'playing')}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border hover:bg-background transition-colors"
                >
                  {screenState === 'playing' ? (
                    <Pause className="w-5 h-5 text-neon-cyan" />
                  ) : (
                    <Play className="w-5 h-5 text-neon-cyan" />
                  )}
                </button>
              </div>
            </div>
            <GameUI
                gameState={gameState}
                persistentCoins={persistentCoins}
              />

            {/* Emergency Power-ups */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
              {[ { type: 'auto', label: 'AUTO', icon: null, color: 'hsl(50,100%,55%)' },
                { type: 'shock', label: '⚡', icon: null, color: 'white' },
                { type: 'multi', label: '●●●', icon: null, color: 'white' },
              ].map((item) => {
                const count = emergencyCounts[item.type as keyof typeof emergencyCounts];
                const price = EMERGENCY_PRICES[item.type].cost;
                const canAfford = persistentCoins >= price;

                return (
                  <button
                    key={item.type}
                    onClick={() => handleUseEmergency(item.type as 'auto' | 'shock' | 'multi')}
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center font-bold text-white transition-all duration-200
                      ${count > 0 ? 'opacity-100' : 'opacity-50'}
                      ${buyPrompt === item.type ? 'scale-110 ring-4 ring-neon-cyan' : ''}
                    `}
                    style={{
                      background: 'radial-gradient(circle at 40% 35%, hsl(200, 100%, 72%), hsl(210, 85%, 50%))',
                      boxShadow: '0 0 15px hsla(200,100%,60%,0.6), inset 0 -3px 8px hsla(210,100%,25%,0.5)',
                      border: '2px solid hsla(195,100%,75%,0.6)',
                      fontSize: item.type === 'shock' ? '22px' : '12px',
                      color: item.color,
                    }}
                  >
                    {item.label}
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-magenta rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-black">
                        {count}
                      </span>
                    )}
                    {count === 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white bg-black/70 rounded-full">
                        <span className="flex flex-col items-center">
                          <span className="text-[10px]">BUY</span>
                          <span className="text-yellow-300">🪙 {price}</span>
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            </div>

            {/* Buy Prompt Modal */}
            {buyPrompt && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-neon-cyan/40 text-center">
                  <h3 className="text-xl font-bold text-neon-cyan mb-2">Buy {EMERGENCY_PRICES[buyPrompt].label}?</h3>
                  <p className="text-yellow-300 text-lg mb-4">Cost: 🪙 {EMERGENCY_PRICES[buyPrompt].cost} Coins</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={handleBuyEmergency}
                      disabled={persistentCoins < EMERGENCY_PRICES[buyPrompt].cost}
                      className="px-6 py-2 rounded-lg bg-neon-green/80 hover:bg-neon-green disabled:opacity-50 font-bold text-black"
                    >
                      Buy
                    </button>
                    <button
                      onClick={handleCancelBuy}
                      className="px-6 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 font-bold text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Game Area */}
            <div className="flex-1 relative overflow-hidden">
              <GameCanvas
                gameState={gameState}
                setGameState={setGameState}
                onGameOver={handleGameOver}
                onLevelComplete={handleLevelComplete}
                onScoreChange={handleScoreChange}
                emergencyRef={emergencyRef}
              />
            </div>

            {/* Pause Button Overlay */}
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
                  onClick={() => setScreenState(prev => prev === 'playing' ? 'paused' : 'playing')}
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
            onReplay={handleReplayLevel}
            onMainMenu={handleMainMenu}
            isNewHighScore={isNewHighScore}
          />
        )}
        
        {screenState === 'levelcomplete' && (
          <LevelCompleteScreen
            gameState={gameState}
            onNextLevel={handleLevelComplete}
            onReplay={handleReplayLevel}
            onMainMenu={handleMainMenu}
          />
        )}
        
        {screenState === 'won' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
            <div className="text-center p-8">
              <h1 className="font-display text-5xl text-neon-yellow text-glow-yellow mb-4">VICTORY!</h1>
              <p className="text-xl mb-8">You have conquered all 500 levels!</p>
              <button
                onClick={handleMainMenu}
                className="py-3 px-8 bg-neon-cyan text-black font-display text-xl rounded-lg"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrickBreakerGame;
