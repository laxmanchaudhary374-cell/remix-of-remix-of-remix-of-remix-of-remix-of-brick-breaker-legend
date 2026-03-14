import React, { useState } from 'react';

interface DailyRewardsProps {
  onClose: (reward?: { type: string; amount: number }) => void;
}

const REWARDS = [
  { day: 1, amount: 10 },
  { day: 2, amount: 15 },
  { day: 3, amount: 20 },
  { day: 4, amount: 25 },
  { day: 5, amount: 30 },
  { day: 6, amount: 40 },
  { day: 7, amount: 50 },
];

const STORAGE_KEYS = {
  lastClaim: 'daily_reward_last_claim',
  streak: 'daily_reward_streak',
  claimed: 'daily_reward_claimed_today',
};

export const checkDailyReward = (): { shouldShow: boolean; day: number } => {
  try {
    const lastClaim = localStorage.getItem(STORAGE_KEYS.lastClaim);
    const streak = parseInt(localStorage.getItem(STORAGE_KEYS.streak) || '0', 10);
    const claimedToday = localStorage.getItem(STORAGE_KEYS.claimed);
    
    const now = new Date();
    const today = now.toDateString();
    
    if (claimedToday === today) return { shouldShow: false, day: 0 };
    
    if (!lastClaim) return { shouldShow: true, day: 1 };
    
    const lastDate = new Date(lastClaim);
    
    // Clock manipulation detection: if lastClaim is in the future, reset
    if (lastDate > now) {
      localStorage.removeItem(STORAGE_KEYS.lastClaim);
      localStorage.removeItem(STORAGE_KEYS.streak);
      return { shouldShow: true, day: 1 };
    }
    
    const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      const nextDay = ((streak % 7) + 1);
      return { shouldShow: true, day: nextDay };
    } else if (daysDiff > 1) {
      return { shouldShow: true, day: 1 };
    }
    
    return { shouldShow: false, day: 0 };
  } catch {
    return { shouldShow: false, day: 0 };
  }
};

export const claimDailyReward = (day: number) => {
  try {
    const now = new Date();
    const streak = parseInt(localStorage.getItem(STORAGE_KEYS.streak) || '0', 10);
    localStorage.setItem(STORAGE_KEYS.lastClaim, now.toISOString());
    localStorage.setItem(STORAGE_KEYS.streak, (streak + 1).toString());
    localStorage.setItem(STORAGE_KEYS.claimed, now.toDateString());
  } catch {}
};

const DailyRewards: React.FC<DailyRewardsProps> = ({ onClose }) => {
  const { day } = checkDailyReward();
  const reward = REWARDS[Math.max(0, Math.min(day - 1, 6))];
  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    claimDailyReward(day);
    setClaimed(true);
    setTimeout(() => {
      onClose({ type: 'coins', amount: reward.amount });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-[340px] rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(160deg, hsl(210, 40%, 12%) 0%, hsl(220, 50%, 8%) 100%)',
          border: '1px solid hsla(180, 100%, 50%, 0.2)',
        }}
      >
        {/* Gold ribbon banner */}
        <div 
          className="relative px-6 py-5 text-center overflow-hidden"
          style={{ 
            background: 'linear-gradient(180deg, hsl(45, 90%, 50%) 0%, hsl(35, 90%, 40%) 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-20" style={{
            background: 'radial-gradient(circle at 50% 120%, hsl(200, 80%, 40%), transparent 70%)'
          }} />
          <h2 className="font-display text-2xl font-black text-white drop-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            DAILY BONUS
          </h2>
        </div>

        {/* Day grid */}
        <div className="px-4 py-4">
          {/* Row 1: Days 1-3 */}
          <div className="flex justify-center gap-2 mb-2">
            {REWARDS.slice(0, 3).map(r => {
              const isActive = r.day === day;
              const isPast = r.day < day;
              return (
                <div key={r.day} className="flex flex-col items-center">
                  <div
                    className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center transition-all ${
                      isActive ? 'ring-2 ring-neon-yellow scale-105' : ''
                    }`}
                    style={{
                      background: isPast || isActive
                        ? 'linear-gradient(135deg, hsla(150, 80%, 30%, 0.6), hsla(150, 60%, 20%, 0.6))'
                        : 'hsla(220, 30%, 15%, 0.6)',
                      border: `1px solid ${isPast || isActive ? 'hsla(150, 80%, 50%, 0.5)' : 'hsla(220, 30%, 30%, 0.3)'}`,
                    }}
                  >
                    <span className="font-display text-sm text-neon-yellow font-bold">{r.amount}</span>
                    <span className="text-2xl mt-0.5">🪙</span>
                  </div>
                  <span className="font-game text-[10px] text-muted-foreground mt-1">Day {r.day}</span>
                </div>
              );
            })}
          </div>
          
          {/* Row 2: Days 4-7 */}
          <div className="flex justify-center gap-2">
            {REWARDS.slice(3).map(r => {
              const isActive = r.day === day;
              const isPast = r.day < day;
              return (
                <div key={r.day} className="flex flex-col items-center">
                  <div
                    className={`w-[72px] h-20 rounded-lg flex flex-col items-center justify-center transition-all ${
                      isActive ? 'ring-2 ring-neon-yellow scale-105' : ''
                    }`}
                    style={{
                      background: isPast || isActive
                        ? 'linear-gradient(135deg, hsla(150, 80%, 30%, 0.6), hsla(150, 60%, 20%, 0.6))'
                        : 'hsla(220, 30%, 15%, 0.6)',
                      border: `1px solid ${isPast || isActive ? 'hsla(150, 80%, 50%, 0.5)' : 'hsla(220, 30%, 30%, 0.3)'}`,
                    }}
                  >
                    <span className="font-display text-sm text-neon-yellow font-bold">{r.amount}</span>
                    <span className="text-2xl mt-0.5">{r.amount >= 500 ? '💰' : '🪙'}</span>
                  </div>
                  <span className="font-game text-[10px] text-muted-foreground mt-1">Day {r.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status message */}
        <div className="px-6 pb-2 text-center">
          {claimed ? (
            <p className="font-display text-sm text-neon-yellow">{reward.amount} Coin Received!</p>
          ) : (
            <p className="font-game text-xs text-muted-foreground">You can receive daily coins only once a day.</p>
          )}
        </div>

        {/* Button */}
        <div className="px-6 pb-5">
          {!claimed ? (
            <button
              onClick={handleClaim}
              className="w-full py-3 font-display text-base font-bold text-white rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(180deg, hsl(180, 100%, 40%) 0%, hsl(190, 100%, 30%) 100%)',
                boxShadow: '0 4px 20px hsla(180, 100%, 50%, 0.3)',
                border: '1px solid hsla(180, 100%, 60%, 0.4)',
              }}
            >
              CLAIM
            </button>
          ) : (
            <button
              onClick={() => onClose()}
              className="w-full py-3 font-display text-base font-bold text-white rounded-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(180deg, hsl(180, 100%, 40%) 0%, hsl(190, 100%, 30%) 100%)',
                border: '1px solid hsla(180, 100%, 60%, 0.4)',
              }}
            >
              Ok
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyRewards;
