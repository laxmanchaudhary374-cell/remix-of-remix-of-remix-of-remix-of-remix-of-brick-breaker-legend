import React from 'react';
import { Zap, Target, Sparkles } from 'lucide-react';

interface PowerUpsPanelProps {
  coins: number;
  onPurchase: (type: 'autopaddle' | 'shock' | 'sevenball') => void;
}

const POWER_UP_COSTS = {
  autopaddle: 50,
  shock: 75,
  sevenball: 100,
};

const PowerUpsPanel: React.FC<PowerUpsPanelProps> = ({ coins, onPurchase }) => {
  const powerUps = [
    {
      id: 'autopaddle' as const,
      name: 'Auto Paddle',
      description: 'Paddle moves automatically for 10s',
      icon: Target,
      cost: POWER_UP_COSTS.autopaddle,
      color: '#00cc66',
    },
    {
      id: 'shock' as const,
      name: 'Shock',
      description: 'Chain lightning destroys nearby bricks',
      icon: Zap,
      cost: POWER_UP_COSTS.shock,
      color: '#ffcc00',
    },
    {
      id: 'sevenball' as const,
      name: 'Seven Ball',
      description: 'Multiply all balls by 7',
      icon: Sparkles,
      cost: POWER_UP_COSTS.sevenball,
      color: '#aa55ff',
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h3 className="font-display text-lg text-center mb-4" style={{ color: '#00ccff', textShadow: '0 0 10px rgba(0,200,255,0.4)' }}>
        POWER-UPS SHOP
      </h3>
      
      <div className="flex flex-col gap-3">
        {powerUps.map((powerUp) => {
          const canAfford = coins >= powerUp.cost;
          const Icon = powerUp.icon;
          
          return (
            <button
              key={powerUp.id}
              onClick={() => canAfford && onPurchase(powerUp.id)}
              disabled={!canAfford}
              className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #0d1f3a 0%, #081428 100%)',
                border: `1.5px solid ${canAfford ? `${powerUp.color}66` : 'rgba(40, 50, 70, 0.4)'}`,
              }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${powerUp.color}22`, border: `1px solid ${powerUp.color}44` }}
              >
                <Icon className="w-5 h-5" style={{ color: powerUp.color }} />
              </div>
              
              <div className="flex-1 text-left">
                <div className="font-display text-sm text-white">
                  {powerUp.name}
                </div>
                <div className="text-xs" style={{ color: '#6688aa' }}>
                  {powerUp.description}
                </div>
              </div>
              
              <div 
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
                style={{
                  background: canAfford ? 'linear-gradient(180deg, #bb8800 0%, #886600 100%)' : '#222',
                  border: `1px solid ${canAfford ? '#ffcc00' : '#444'}`,
                }}
              >
                <span className="font-display text-xs text-white font-bold">{powerUp.cost}</span>
                <span className="text-xs">🪙</span>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs" style={{ color: '#5577aa' }}>
          Your coins: <span className="font-display font-bold" style={{ color: '#ffdd44' }}>{coins}</span>
        </p>
        <p className="text-[10px] mt-1" style={{ color: '#334466' }}>
          Purchased power-ups are available at level start
        </p>
      </div>
    </div>
  );
};

export default PowerUpsPanel;
