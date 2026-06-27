import React, { useState } from 'react';

interface DailyRewardsProps {
  onClose: (reward?: { type: string; amount: number }) => void;
}

const REWARDS = [
  { day: 1, amount: 20 },
  { day: 2, amount: 40 },
  { day: 3, amount: 60 },
  { day: 4, amount: 80 },
  { day: 5, amount: 100 },
  { day: 6, amount: 150 },
  { day: 7, amount: 300 },
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-[340px] rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0d1b3a 0%, #060d1f 100%)',
          border: '2px solid rgba(60, 100, 200, 0.4)',
          boxShadow: '0 0 60px rgba(50, 80, 200, 0.15)',
        }}
      >
        {/* Header banner */}
        <div 
          className="relative px-6 py-5 text-center overflow-hidden"
          style={{ 
            background: 'linear-gradient(180deg, #2255bb 0%, #1a3388 100%)',
            borderBottom: '1px solid rgba(60, 120, 200, 0.5)',
          }}
        >
          <h2 className="font-display text-2xl font-black text-white" style={{ textShadow: '0 0 15px rgba(0, 200, 255, 0.5)' }}>
            DAILY BONUS
          </h2>
          <p className="text-xs mt-1" style={{ color: '#88aacc' }}>Day {day} of 7</p>
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
                    className="w-20 h-20 rounded-lg flex flex-col items-center justify-center transition-all"
                    style={{
                      background: isPast || isActive
                        ? 'linear-gradient(135deg, rgba(0, 150, 80, 0.3), rgba(0, 80, 40, 0.2))'
                        : 'linear-gradient(135deg, #0d1f3a, #081428)',
                      border: isActive 
                        ? '2px solid #00ff88' 
                        : isPast 
                          ? '1.5px solid rgba(0, 200, 100, 0.4)' 
                          : '1.5px solid rgba(40, 60, 100, 0.4)',
                      boxShadow: isActive ? '0 0 15px rgba(0, 255, 100, 0.3)' : 'none',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <span className="font-display text-sm font-bold" style={{ color: '#ffdd44' }}>{r.amount}</span>
                    <span className="text-2xl mt-0.5">🪙</span>
                  </div>
                  <span className="text-[10px] mt-1" style={{ color: '#5577aa' }}>Day {r.day}</span>
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
                    className="w-[72px] h-20 rounded-lg flex flex-col items-center justify-center transition-all"
                    style={{
                      background: isPast || isActive
                        ? 'linear-gradient(135deg, rgba(0, 150, 80, 0.3), rgba(0, 80, 40, 0.2))'
                        : 'linear-gradient(135deg, #0d1f3a, #081428)',
                      border: isActive 
                        ? '2px solid #00ff88' 
                        : isPast 
                          ? '1.5px solid rgba(0, 200, 100, 0.4)' 
                          : '1.5px solid rgba(40, 60, 100, 0.4)',
                      boxShadow: isActive ? '0 0 15px rgba(0, 255, 100, 0.3)' : 'none',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <span className="font-display text-sm font-bold" style={{ color: '#ffdd44' }}>{r.amount}</span>
                    <span className="text-2xl mt-0.5">{r.amount >= 200 ? '💰' : '🪙'}</span>
                  </div>
                  <span className="text-[10px] mt-1" style={{ color: '#5577aa' }}>Day {r.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status message */}
        <div className="px-6 pb-2 text-center">
          {claimed ? (
            <p className="font-display text-sm" style={{ color: '#00ff88' }}>{reward.amount} Coins Received!</p>
          ) : (
            <p className="text-xs" style={{ color: '#5577aa' }}>Claim your daily reward!</p>
          )}
        </div>

        {/* Button */}
        <div className="px-6 pb-5">
          {!claimed ? (
            <button
              onClick={handleClaim}
              className="w-full py-3 font-display text-base font-bold text-white rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(180deg, #00bbcc 0%, #007788 100%)',
                border: '1.5px solid #00ddff',
                boxShadow: '0 4px 15px rgba(0, 200, 255, 0.3)',
              }}
            >
              CLAIM
            </button>
          ) : (
            <button
              onClick={() => onClose()}
              className="w-full py-3 font-display text-base font-bold text-white rounded-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(180deg, #2255bb 0%, #1a3388 100%)',
                border: '1.5px solid #4488dd',
                boxShadow: '0 4px 15px rgba(50, 100, 200, 0.3)',
              }}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyRewards;
