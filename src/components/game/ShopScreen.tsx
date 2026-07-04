import React, { useState } from 'react';
import { X, ShoppingBag, Zap, AlertTriangle } from 'lucide-react';
import { purchaseCoinPackage } from '@/utils/billing';
import { showRewardedAd } from '@/utils/admob';
import { setAdsRemoved } from '@/utils/admob';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'emergency' | 'powerup';
  type: string;
  emoji: string;
}

const SHOP_ITEMS: ShopItem[] = [
  // Emergency Power-ups (increment emergency counts)
  { id: 'em_auto', name: 'Auto Paddle', description: 'Paddle moves automatically for 10s', cost: 100, category: 'emergency', type: 'auto', emoji: '' },
  { id: 'em_shock', name: 'Electric Shock', description: 'Chain lightning destroys bricks', cost: 150, category: 'emergency', type: 'shock', emoji: '' },
  { id: 'em_multi', name: 'Three-Ball', description: 'Multiplies all balls by 3', cost: 200, category: 'emergency', type: 'multi', emoji: '' },
  // Standard Power-ups
  { id: 'pu_shield', name: 'Shield', description: 'Safety net for 10 seconds', cost: 80, category: 'powerup', type: 'shield', emoji: '' },
  { id: 'pu_fireball', name: 'Fireball', description: 'Ball destroys all bricks in one hit', cost: 120, category: 'powerup', type: 'fireball', emoji: '' },
  { id: 'pu_multiball', name: 'Multiball', description: 'Doubles all your balls', cost: 90, category: 'powerup', type: 'multiball', emoji: '' },
  { id: 'pu_extralife', name: 'Extra Life', description: 'Gain +1 life', cost: 150, category: 'powerup', type: 'extralife', emoji: '' },
  { id: 'pu_laser', name: 'Laser Gun', description: 'Paddle auto-fires lasers for 7s', cost: 100, category: 'powerup', type: 'laser', emoji: '' },
  { id: 'pu_magnet', name: 'Magnet', description: 'Ball sticks to paddle for aiming', cost: 70, category: 'powerup', type: 'magnet', emoji: '' },
  { id: 'pu_widen', name: 'Wide Paddle', description: 'Widens your paddle for 10s', cost: 50, category: 'powerup', type: 'widen', emoji: '' },
  { id: 'pu_sevenball', name: 'Seven Ball', description: 'Multiplies balls by 7!', cost: 200, category: 'powerup', type: 'sevenball', emoji: '' },
];

const COIN_PACKAGES = [
  { id: 'coin_starter', name: 'Starter Pack', coins: 500, price: '$0.99', icon: '🪙', badge: '' },
  { id: 'coin_pro', name: 'Pro Pack', coins: 2500, price: '$3.99', icon: '💰', badge: '+5%' },
  { id: 'coin_whale', name: 'Whale Pack', coins: 7500, price: '$9.99', icon: '👑', badge: 'BEST' },
  { id: 'remove_ads', name: 'Remove Ads', coins: 0, price: '₹270', icon: '🚫', badge: '' },
];

interface ShopScreenProps {
  coins: number;
  onPurchase: (item: ShopItem) => void;
  onAddCoins?: (amount: number) => void;
  onClose: () => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ coins, onPurchase, onAddCoins, onClose }) => {
  const [activeTab, setActiveTab] = useState<'emergency' | 'powerup' | 'coins'>('coins');
  const [purchasing, setPurchasing] = useState(false);

  const handleCoinPurchase = async (packageId: string) => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const result = await purchaseCoinPackage(packageId);
      if (result === -1) {
        // Remove ads purchased
        setAdsRemoved();
        alert('Ads removed successfully!');
      } else if (result > 0) {
        alert(`You received ${result} coins!`);
      }
    } catch (e) {
      console.error('Purchase error:', e);
    }
    setPurchasing(false);
  };

  const handleWatchAd = async () => {
    const result = await showRewardedAd(() => {});
    if (result.ok) {
      if (result.reward > 0) {
        onAddCoins?.(result.reward);
        alert(`You earned ${result.reward} coins!`);
      }
    } else {
      alert(result.error);
    }
  };

  const tabs = [
    { id: 'emergency' as const, label: 'EMERGENCY', icon: <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#ff4444' }} /> },
    { id: 'powerup' as const, label: 'POWER-UPS', icon: <Zap className="w-3.5 h-3.5" style={{ color: '#ffdd44' }} /> },
    { id: 'coins' as const, label: 'COINS', icon: <span className="text-sm">🪙</span> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #0d1b2a 0%, #0a0f1a 100%)',
          border: '1px solid rgba(0, 200, 255, 0.2)',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: '#00ccff' }} />
            <h2 className="font-display text-xl font-black text-white">SHOP</h2>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(30, 30, 40, 0.8)', border: '1px solid rgba(255, 200, 0, 0.4)' }}
            >
              <span className="text-sm">🪙</span>
              <span className="font-display text-sm font-bold" style={{ color: '#ffdd44' }}>{coins}</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(50,50,60,0.8)' }}>
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-1 mb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-display text-xs font-bold transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(0, 200, 255, 0.1)' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #00ccff' : '2px solid transparent',
                color: activeTab === tab.id ? '#00ccff' : '#667788',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ maxHeight: '60vh' }}>
          {activeTab === 'coins' && (
            <div className="space-y-3">
              {/* Watch Ad for coins */}
              <div
                className="p-4 rounded-xl"
                style={{ background: 'rgba(0, 40, 40, 0.5)', border: '1px solid rgba(0, 200, 150, 0.4)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📺</span>
                  <span className="font-display text-base font-bold text-white">Watch Ad for 50 Coins</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">Free coins – just watch a short ad!</p>
                <button
                  onClick={handleWatchAd}
                  className="w-full py-3 rounded-xl font-display text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #00cc88, #00aa66)' }}
                >
                  ▶ Watch Ad
                </button>
              </div>

              {/* OR BUY divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px" style={{ background: 'rgba(100,100,120,0.4)' }} />
                <span className="font-display text-xs" style={{ color: '#667788' }}>OR BUY</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(100,100,120,0.4)' }} />
              </div>

              {/* Coin packages */}
              {COIN_PACKAGES.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => handleCoinPurchase(pkg.id)}
                  disabled={purchasing}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98]"
                  style={{
                    background: 'rgba(20, 25, 35, 0.8)',
                    border: '1px solid rgba(255, 200, 0, 0.3)',
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(40, 40, 50, 0.8)' }}>
                    <span className="text-xl">{pkg.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-display text-sm font-bold text-white">{pkg.name}</div>
                    {pkg.coins > 0 && <div className="text-xs" style={{ color: '#00ccaa' }}>{pkg.coins} Coins</div>}
                    {pkg.coins === 0 && <div className="text-xs" style={{ color: '#00ccaa' }}>No more ads!</div>}
                  </div>
                  {pkg.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(255, 100, 200, 0.2)', color: '#ff88cc' }}>
                      {pkg.badge}
                    </span>
                  )}
                  <div
                    className="px-4 py-2 rounded-lg font-display text-sm font-bold"
                    style={{ background: '#e6b800', color: '#1a1a00' }}
                  >
                    {pkg.price}
                  </div>
                </button>
              ))}
            </div>
          )}

          {(activeTab === 'emergency' || activeTab === 'powerup') && (
            <div className="space-y-2">
              {SHOP_ITEMS.filter(item => item.category === activeTab).map(item => (
                <button
                  key={item.id}
                  onClick={() => onPurchase(item)}
                  disabled={coins < item.cost}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: 'rgba(20, 25, 35, 0.8)',
                    border: '1px solid rgba(0, 200, 255, 0.2)',
                  }}
                >
                  <div className="flex-1 text-left">
                    <div className="font-display text-sm font-bold text-white">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255, 200, 0, 0.1)', border: '1px solid rgba(255, 200, 0, 0.3)' }}>
                    <span className="text-xs">🪙</span>
                    <span className="font-display text-sm font-bold" style={{ color: '#ffdd44' }}>{item.cost}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopScreen;
