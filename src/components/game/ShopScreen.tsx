import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Tv } from 'lucide-react';
import { purchaseCoinPackage } from '@/utils/billing';
import { showRewardedAd } from '@/utils/admob';

interface ShopScreenProps {
  coins: number;
  onPurchase: (item: ShopItem) => void;
  onAddCoins: (amount: number) => void;
  onClose: () => void;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'powerup' | 'emergency' | 'skin';
  type: string;
  emoji: string;
}

const SHOP_ITEMS: ShopItem[] = [
  // Emergency Power-ups (increment emergency counts)
  { id: 'em_auto', name: 'Auto Paddle', description: 'Paddle moves automatically for 10s', cost: 50, category: 'emergency', type: 'auto', emoji: '🤖' },
  { id: 'em_shock', name: 'Electric Shock', description: 'Chain lightning destroys bricks', cost: 75, category: 'emergency', type: 'shock', emoji: '⚡' },
  { id: 'em_multi', name: 'Three-Ball', description: 'Multiplies all balls by 3', cost: 100, category: 'emergency', type: 'multi', emoji: '🔮' },
  // Standard Power-ups
  { id: 'pu_shield', name: 'Shield', description: 'Safety net for 10 seconds', cost: 30, category: 'powerup', type: 'shield', emoji: '🛡️' },
  { id: 'pu_fireball', name: 'Fireball', description: 'Ball destroys all bricks in one hit', cost: 50, category: 'powerup', type: 'fireball', emoji: '🔥' },
  { id: 'pu_multiball', name: 'Multiball', description: 'Doubles all your balls', cost: 40, category: 'powerup', type: 'multiball', emoji: '⚡' },
  { id: 'pu_extralife', name: 'Extra Life', description: 'Gain +1 life', cost: 80, category: 'powerup', type: 'extralife', emoji: '❤️' },
  { id: 'pu_laser', name: 'Laser Gun', description: 'Paddle auto-fires lasers for 7s', cost: 60, category: 'powerup', type: 'laser', emoji: '🔫' },
  { id: 'pu_magnet', name: 'Magnet', description: 'Ball sticks to paddle for aiming', cost: 35, category: 'powerup', type: 'magnet', emoji: '🧲' },
  { id: 'pu_widen', name: 'Wide Paddle', description: 'Widens your paddle for 10s', cost: 25, category: 'powerup', type: 'widen', emoji: '↔️' },
  { id: 'pu_sevenball', name: 'Seven Ball', description: 'Multiplies balls by 7!', cost: 100, category: 'powerup', type: 'sevenball', emoji: '✨' },
];

const COIN_PACKAGES = [
  { id: 'coin_starter', name: 'Starter Pack', coins: 100, price: '$0.99', emoji: '🪙' },
  { id: 'coin_pro', name: 'Pro Pack', coins: 500, price: '$3.99', emoji: '💰' },
  { id: 'coin_whale', name: 'Whale Pack', coins: 1500, price: '$9.99', emoji: '👑' },
];

type TabType = 'emergency' | 'powerup' | 'coins';

const ShopScreen: React.FC<ShopScreenProps> = ({ coins, onPurchase, onAddCoins, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('emergency');
  const [purchased, setPurchased] = useState<string[]>([]);
  const [adTimer, setAdTimer] = useState<number | null>(null);
  const [adWatched, setAdWatched] = useState(false);

  const filteredItems = SHOP_ITEMS.filter(item => item.category === activeTab);

  const handleBuy = (item: ShopItem) => {
    if (coins < item.cost) return;
    onPurchase(item);
    setPurchased(prev => [...prev, item.id]);
    // Clear purchased indicator after 1s so user can buy again
    setTimeout(() => setPurchased(prev => prev.filter(id => id !== item.id)), 1000);
  };

  const handleBuyCoins = async (pkg: typeof COIN_PACKAGES[0]) => {
    // Uses @capgo/native-purchases on native, simulates on web
    const coins = await purchaseCoinPackage(pkg.id);
    if (coins > 0) {
      onAddCoins(coins);
    }
  };

  const handleWatchAd = async () => {
    if (adTimer !== null) return;
    // Uses @capacitor-community/admob on native, simulates on web
    setAdTimer(5);
    const reward = await showRewardedAd();
    setAdTimer(null);
    if (reward > 0) {
      onAddCoins(reward);
      setAdWatched(true);
      setTimeout(() => setAdWatched(false), 3000);
    }
  };

  useEffect(() => {
    if (adTimer === null || adTimer <= 0) return;
    const interval = setInterval(() => {
      setAdTimer(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          onAddCoins(50);
          setAdWatched(true);
          setTimeout(() => setAdWatched(false), 3000);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [adTimer, onAddCoins]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-neon-cyan/20 shadow-2xl"
        style={{
          background: 'linear-gradient(160deg, hsl(240 25% 10%) 0%, hsl(260 30% 8%) 100%)',
          boxShadow: '0 0 60px hsla(180, 100%, 50%, 0.1)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(180deg, hsl(220 50% 18%) 0%, hsl(240 40% 12%) 100%)' }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neon-cyan" />
            <h2 className="font-display text-lg font-black text-foreground">SHOP</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-neon-yellow/30">
              <span className="text-base">🪙</span>
              <span className="font-display text-sm text-neon-yellow">{coins}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {([
            { key: 'emergency' as TabType, label: '🚨 EMERGENCY' },
            { key: 'powerup' as TabType, label: '⚡ POWER-UPS' },
            { key: 'coins' as TabType, label: '🪙 COINS' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 font-display text-xs transition-all ${
                activeTab === tab.key
                  ? 'text-neon-cyan border-b-2 border-neon-cyan'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: '55vh' }}>
          {activeTab === 'coins' ? (
            <div className="space-y-3">
              {/* Watch Ad */}
              <div className="p-4 rounded-xl border border-neon-green/30 bg-neon-green/5">
                <div className="flex items-center gap-3 mb-3">
                  <Tv className="w-5 h-5 text-neon-green" />
                  <div>
                    <p className="font-display text-sm text-foreground">Watch Ad for 50 Coins</p>
                    <p className="font-game text-xs text-muted-foreground">Free coins — just watch a short ad!</p>
                  </div>
                </div>
                <button
                  onClick={handleWatchAd}
                  disabled={adTimer !== null}
                  className={`w-full py-3 rounded-lg font-display text-sm font-bold transition-all ${
                    adWatched
                      ? 'bg-neon-green/20 text-neon-green'
                      : adTimer !== null
                      ? 'bg-muted/30 text-muted-foreground cursor-wait'
                      : 'bg-neon-green/80 text-black hover:bg-neon-green hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {adWatched ? '✓ +50 Coins Added!' : adTimer !== null ? `⏳ Watching ad... ${adTimer}s` : '▶ Watch Ad'}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="font-game text-xs text-muted-foreground">OR BUY</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Coin Packages */}
              {COIN_PACKAGES.map(pkg => (
                <div
                  key={pkg.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-neon-yellow/20 bg-muted/20 hover:border-neon-yellow/40 hover:bg-muted/30 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'hsl(240 20% 18%)' }}
                  >
                    {pkg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm text-foreground leading-none mb-0.5">{pkg.name}</p>
                    <p className="font-game text-xs text-neon-yellow leading-tight">{pkg.coins} Coins</p>
                  </div>
                  <button
                    onClick={() => handleBuyCoins(pkg)}
                    className="flex-shrink-0 px-4 py-2 rounded-lg font-display text-xs font-bold bg-neon-yellow/90 text-black hover:bg-neon-yellow hover:scale-105 active:scale-95 transition-all"
                  >
                    {pkg.price}
                  </button>
                </div>
              ))}

              <p className="font-game text-xs text-muted-foreground/50 text-center mt-2">
                Purchases are simulated in preview mode
              </p>
            </div>
          ) : (
            filteredItems.map(item => {
              const canAfford = coins >= item.cost;
              const wasPurchased = purchased.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    canAfford
                      ? 'border-neon-cyan/20 bg-muted/20 hover:border-neon-cyan/40 hover:bg-muted/30'
                      : 'border-muted/20 bg-muted/10 opacity-60'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'hsl(240 20% 18%)' }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm text-foreground leading-none mb-0.5">{item.name}</p>
                    <p className="font-game text-xs text-muted-foreground leading-tight">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford || wasPurchased}
                    className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg font-display text-xs font-bold transition-all ${
                      wasPurchased
                        ? 'bg-neon-green/20 text-neon-green cursor-default'
                        : canAfford
                        ? 'bg-neon-yellow/90 text-black hover:bg-neon-yellow hover:scale-105 active:scale-95'
                        : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {wasPurchased ? '✓' : (
                      <>
                        <span>🪙</span>
                        <span>{item.cost}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopScreen;
