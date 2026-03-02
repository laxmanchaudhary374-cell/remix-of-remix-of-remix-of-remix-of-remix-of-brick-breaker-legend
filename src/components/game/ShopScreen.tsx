import React, { useState } from 'react';
import { X, ShoppingBag, Zap, Palette } from 'lucide-react';

interface ShopScreenProps {
  coins: number;
  onPurchase: (item: ShopItem) => void;
  onClose: () => void;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'powerup' | 'skin';
  type: string;
  emoji: string;
}

const SHOP_ITEMS: ShopItem[] = [
  // Power-ups
  { id: 'pu_shield', name: 'Shield', description: 'Safety net for 10 seconds', cost: 30, category: 'powerup', type: 'shield', emoji: '🛡️' },
  { id: 'pu_fireball', name: 'Fireball', description: 'Ball destroys all bricks in one hit', cost: 50, category: 'powerup', type: 'fireball', emoji: '🔥' },
  { id: 'pu_multiball', name: 'Multiball', description: 'Doubles all your balls', cost: 40, category: 'powerup', type: 'multiball', emoji: '⚡' },
  { id: 'pu_extralife', name: 'Extra Life', description: 'Gain +1 life', cost: 80, category: 'powerup', type: 'extralife', emoji: '❤️' },
  { id: 'pu_laser', name: 'Laser Gun', description: 'Paddle auto-fires lasers for 7s', cost: 60, category: 'powerup', type: 'laser', emoji: '🔫' },
  { id: 'pu_magnet', name: 'Magnet', description: 'Ball sticks to paddle for aiming', cost: 35, category: 'powerup', type: 'magnet', emoji: '🧲' },
  { id: 'pu_widen', name: 'Wide Paddle', description: 'Widens your paddle for 10s', cost: 25, category: 'powerup', type: 'widen', emoji: '↔️' },
  { id: 'pu_sevenball', name: 'Seven Ball', description: 'Multiplies balls by 7!', cost: 100, category: 'powerup', type: 'sevenball', emoji: '✨' },
];

type TabType = 'powerup' | 'skin';

const ShopScreen: React.FC<ShopScreenProps> = ({ coins, onPurchase, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('powerup');
  const [purchased, setPurchased] = useState<string[]>([]);

  const filteredItems = SHOP_ITEMS.filter(item => item.category === activeTab);

  const handleBuy = (item: ShopItem) => {
    if (coins < item.cost) return;
    onPurchase(item);
    setPurchased(prev => [...prev, item.id]);
  };

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
          {(['powerup', 'skin'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 font-display text-sm transition-all ${
                activeTab === tab
                  ? 'text-neon-cyan border-b-2 border-neon-cyan'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'powerup' ? '⚡ POWER-UPS' : '🎨 SKINS'}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: '55vh' }}>
          {activeTab === 'skin' ? (
            <div className="text-center py-12">
              <span className="text-4xl">🚧</span>
              <p className="font-display text-sm text-muted-foreground mt-3">Skins coming soon!</p>
              <p className="font-game text-xs text-muted-foreground/60 mt-1">Save your coins for the update</p>
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
