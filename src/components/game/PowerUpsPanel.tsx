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
      color: 'hsl(120, 70%, 50%)',
    },
    {
      id: 'shock' as const,
      name: 'Shock',
      description: 'Chain lightning destroys nearby bricks',
      icon: Zap,
      cost: POWER_UP_COSTS.shock,
      color: 'hsl(55, 100%, 50%)',
    },
    {
      id: 'sevenball' as const,
      name: 'Seven Ball',
      description: 'Multiply all balls by 7',
      icon: Sparkles,
      cost: POWER_UP_COSTS.sevenball,
      color: 'hsl(280, 80%, 60%)',
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h3 className="font-display text-lg text-neon-cyan text-center mb-4">
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
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all
                ${canAfford 
                  ? 'bg-background/60 border-neon-cyan/30 hover:border-neon-cyan hover:bg-background/80' 
                  : 'bg-background/30 border-muted-foreground/20 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${powerUp.color}33` }}
              >
                <Icon 
                  className="w-6 h-6" 
                  style={{ color: powerUp.color }} 
                />
              </div>
              
              <div className="flex-1 text-left">
                <div className="font-display text-sm text-foreground">
                  {powerUp.name}
                </div>
                <div className="font-game text-xs text-muted-foreground">
                  {powerUp.description}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <span className={`font-display text-sm ${canAfford ? 'text-neon-yellow' : 'text-muted-foreground'}`}>
                  {powerUp.cost}
                </span>
                <span className="text-xs text-neon-yellow">🪙</span>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <p className="font-game text-xs text-muted-foreground">
          Your coins: <span className="text-neon-yellow font-display">{coins}</span>
        </p>
        <p className="font-game text-xs text-muted-foreground mt-1">
          Purchased power-ups are available at level start
        </p>
      </div>
    </div>
  );
};

export default PowerUpsPanel;
