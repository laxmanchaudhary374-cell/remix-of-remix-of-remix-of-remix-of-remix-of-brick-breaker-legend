import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RATE_KEY = 'neon_breaker_rate_prompted';

export const shouldShowRatePrompt = (level: number): boolean => {
  if (level < 10) return false;
  try { return localStorage.getItem(RATE_KEY) !== '1'; } catch { return false; }
};

export const markRatePrompted = () => {
  try { localStorage.setItem(RATE_KEY, '1'); } catch {}
};

interface Props {
  onClose: () => void;
}

const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.neonbrickbreaker.ball';

const RateUsPopup: React.FC<Props> = ({ onClose }) => {
  const handleRate = () => {
    markRatePrompted();
    try { window.open(PLAY_URL, '_blank'); } catch {}
    onClose();
  };
  const handleLater = () => {
    markRatePrompted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="max-w-xs w-full p-6 rounded-2xl border border-neon-yellow/40 text-center"
        style={{ background: 'linear-gradient(135deg, hsl(220,60%,8%), hsl(240,50%,14%))' }}
      >
        <div className="flex justify-center gap-1 mb-3">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="w-7 h-7 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
          ))}
        </div>
        <h2 className="font-display text-xl text-neon-yellow mb-2">Enjoying the game?</h2>
        <p className="text-sm text-foreground/80 mb-5">Rate us! ⭐ Your support helps us improve.</p>
        <div className="flex flex-col gap-2">
          <Button onClick={handleRate} className="w-full bg-gradient-to-r from-neon-yellow to-neon-orange text-black font-display">
            Rate Now
          </Button>
          <Button onClick={handleLater} variant="outline" className="w-full">Later</Button>
        </div>
      </div>
    </div>
  );
};

export default RateUsPopup;
