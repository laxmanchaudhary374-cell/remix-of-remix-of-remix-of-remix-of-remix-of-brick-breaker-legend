import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { showRewardedAd } from '@/utils/admob';

interface LuckyWheelProps {
  onClose: (reward?: { type: string; amount: number; label: string }) => void;
}

const SEGMENTS = [
  { label: '🪙 10', type: 'coins', amount: 10, color1: 'hsl(340, 70%, 55%)', color2: 'hsl(340, 60%, 45%)' },
  { label: '🎯 AUTO x1', type: 'auto', amount: 1, color1: 'hsl(270, 55%, 50%)', color2: 'hsl(270, 50%, 40%)' },
  { label: '🪙 20', type: 'coins', amount: 20, color1: 'hsl(150, 55%, 45%)', color2: 'hsl(150, 50%, 35%)' },
  { label: '⚡ Multi x1', type: 'multi', amount: 1, color1: 'hsl(210, 70%, 50%)', color2: 'hsl(210, 65%, 40%)' },
  { label: '⚡ Shock x1', type: 'shock', amount: 1, color1: 'hsl(280, 55%, 50%)', color2: 'hsl(280, 50%, 40%)' },
  { label: '🪙 5', type: 'coins', amount: 5, color1: 'hsl(190, 65%, 50%)', color2: 'hsl(190, 60%, 40%)' },
  { label: '🎯 AUTO x2', type: 'auto', amount: 2, color1: 'hsl(340, 70%, 55%)', color2: 'hsl(340, 60%, 45%)' },
  { label: '⚡ Multi x1', type: 'multi', amount: 1, color1: 'hsl(210, 70%, 50%)', color2: 'hsl(210, 65%, 40%)' },
  { label: '🪙 30', type: 'coins', amount: 30, color1: 'hsl(280, 55%, 50%)', color2: 'hsl(280, 50%, 40%)' },
  { label: '💰 50', type: 'coins', amount: 50, color1: 'hsl(45, 90%, 55%)', color2: 'hsl(45, 85%, 42%)' },
];

const STORAGE_KEYS = {
  lastSpin: 'lucky_wheel_last_spin',
};

const SPIN_COOLDOWN_MS = 6 * 60 * 60 * 1000;

export const canSpin = (): { can: boolean; timeLeft: string } => {
  try {
    const lastSpin = localStorage.getItem(STORAGE_KEYS.lastSpin);
    if (!lastSpin) return { can: true, timeLeft: '' };
    const diff = Date.now() - parseInt(lastSpin, 10);
    if (diff >= SPIN_COOLDOWN_MS) return { can: true, timeLeft: '' };
    const remaining = SPIN_COOLDOWN_MS - diff;
    const h = Math.floor(remaining / (1000 * 60 * 60));
    const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return { can: false, timeLeft: `${h}h ${m}m` };
  } catch {
    return { can: true, timeLeft: '' };
  }
};

const recordSpin = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.lastSpin, Date.now().toString());
  } catch {}
};

const LuckyWheel: React.FC<LuckyWheelProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<(typeof SEGMENTS)[0] | null>(null);
  const [adWatched, setAdWatched] = useState(false);
  const rotationRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const { can, timeLeft } = canSpin();

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 20;
    const segAngle = (2 * Math.PI) / SEGMENTS.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer decorative ring with light dots
    ctx.beginPath();
    ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'hsl(45, 80%, 55%)';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Light dots around the edge
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const dotX = cx + Math.cos(angle) * (r + 14);
      const dotY = cy + Math.sin(angle) * (r + 14);
      const isLit = Math.floor(Date.now() / 300 + i) % 3 === 0;
      ctx.fillStyle = isLit ? 'hsl(45, 100%, 75%)' : 'hsl(45, 30%, 30%)';
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Inner gold ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ringGrad.addColorStop(0, 'hsl(40, 80%, 50%)');
    ringGrad.addColorStop(0.5, 'hsl(45, 90%, 65%)');
    ringGrad.addColorStop(1, 'hsl(40, 80%, 50%)');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw segments with gradient fills
    SEGMENTS.forEach((seg, i) => {
      const startAngle = rot + i * segAngle;
      const endAngle = startAngle + segAngle;

      // Gradient for each segment
      const midAngle = startAngle + segAngle / 2;
      const gx = cx + Math.cos(midAngle) * r * 0.5;
      const gy = cy + Math.sin(midAngle) * r * 0.5;
      const segGrad = ctx.createRadialGradient(cx, cy, r * 0.1, gx, gy, r);
      segGrad.addColorStop(0, seg.color1);
      segGrad.addColorStop(1, seg.color2);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segGrad;
      ctx.fill();

      // Bright segment border
      ctx.strokeStyle = 'hsla(45, 80%, 60%, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text with shadow
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + segAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 11px Orbitron, sans-serif';
      ctx.fillText(seg.label, r - 14, 4);
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Center hub - premium metallic look
    const hubGrad = ctx.createRadialGradient(cx - 4, cy - 4, 0, cx, cy, 28);
    hubGrad.addColorStop(0, 'hsl(45, 90%, 75%)');
    hubGrad.addColorStop(0.3, 'hsl(40, 80%, 55%)');
    hubGrad.addColorStop(0.7, 'hsl(35, 70%, 40%)');
    hubGrad.addColorStop(1, 'hsl(30, 60%, 30%)');
    ctx.fillStyle = hubGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();
    
    // Hub ring
    ctx.strokeStyle = 'hsl(45, 90%, 65%)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.stroke();

    // Center gem
    const gemGrad = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, 12);
    gemGrad.addColorStop(0, 'hsl(45, 100%, 85%)');
    gemGrad.addColorStop(0.5, 'hsl(40, 90%, 60%)');
    gemGrad.addColorStop(1, 'hsl(35, 80%, 45%)');
    ctx.fillStyle = gemGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // SPIN text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 8px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', cx, cy);
  };

  useEffect(() => {
    drawWheel(0);
  }, []);

  const handleSpin = () => {
    if (isSpinning || !can) return;
    setIsSpinning(true);
    setResult(null);

    const targetIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segAngle = (2 * Math.PI) / SEGMENTS.length;
    const targetAngle = -Math.PI / 2 - (targetIndex * segAngle + segAngle / 2);
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const finalRotation = targetAngle + extraSpins * Math.PI * 2;

    const startTime = performance.now();
    const duration = 4500;
    const startRot = rotationRef.current;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const currentRot = startRot + (finalRotation - startRot) * eased;
      rotationRef.current = currentRot;
      drawWheel(currentRot);

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setResult(SEGMENTS[targetIndex]);
        recordSpin();
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const handleSpinClick = async () => {
    if (isSpinning || !can) return;
    if (!adWatched) {
      const result = await showRewardedAd();
      if (result.ok && result.reward > 0) {
        setAdWatched(true);
        handleSpin();
      } else {
        alert(!result.ok ? result.error : 'Please watch the full ad to spin the wheel!');
      }
      return;
    }
    handleSpin();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full rounded-2xl overflow-hidden p-5"
        style={{
          background: 'linear-gradient(160deg, hsl(230, 45%, 15%) 0%, hsl(240, 55%, 8%) 100%)',
          border: '2px solid hsla(45, 80%, 50%, 0.4)',
          boxShadow: '0 0 80px hsla(45, 100%, 50%, 0.1), inset 0 1px 0 hsla(45, 80%, 60%, 0.2)',
          maxWidth: '360px',
        }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-black flex items-center gap-2"
            style={{ 
              background: 'linear-gradient(180deg, hsl(45, 100%, 70%), hsl(40, 90%, 50%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px hsla(45, 100%, 50%, 0.3))',
            }}
          >
            🎡 LUCKY WHEEL
          </h2>
          <button
            onClick={() => onClose()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Wheel container */}
        <div className="relative flex justify-center mb-4">
          {/* Pointer - premium golden triangle */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10"
            style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))' }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '28px solid hsl(0, 85%, 55%)',
              }}
            />
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '20px solid hsl(0, 80%, 65%)',
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          </div>
          <canvas ref={canvasRef} width={320} height={320} className="rounded-full" 
            style={{ filter: 'drop-shadow(0 4px 20px hsla(260, 50%, 30%, 0.5))' }}
          />
        </div>

        {/* Result */}
        {result && (
          <div
            className="mb-4 py-3 px-4 rounded-xl text-center animate-scale-in"
            style={{
              background: 'linear-gradient(135deg, hsl(50, 100%, 35%) 0%, hsl(40, 100%, 25%) 100%)',
              border: '2px solid hsl(50, 100%, 55%)',
              boxShadow: '0 0 30px hsla(50, 100%, 50%, 0.3)',
            }}
          >
            <p className="font-display text-lg text-neon-yellow font-bold">🎉 You won {result.label}!</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {!result ? (
            <>
              <button
                onClick={handleSpinClick}
                disabled={isSpinning || !can}
                className="flex-1 py-3.5 font-display text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: can 
                    ? 'linear-gradient(180deg, hsl(45, 100%, 55%) 0%, hsl(40, 90%, 40%) 100%)' 
                    : 'hsl(220, 20%, 20%)',
                  color: can ? 'hsl(30, 50%, 15%)' : 'white',
                  boxShadow: can ? '0 4px 20px hsla(45, 100%, 50%, 0.4), inset 0 1px 0 hsla(45, 100%, 80%, 0.4)' : 'none',
                  border: '1px solid hsla(45, 100%, 60%, 0.6)',
                }}
              >
                {isSpinning ? '🌀 Spinning...' : !can ? `⏳ ${timeLeft}` : !adWatched ? '🎬 Watch Ad to Spin' : '🎡 SPIN!'}
              </button>
            </>
          ) : (
            <button
              onClick={() => onClose(result)}
              className="flex-1 py-3.5 font-display text-sm font-bold rounded-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(180deg, hsl(45, 100%, 55%) 0%, hsl(40, 90%, 40%) 100%)',
                color: 'hsl(30, 50%, 15%)',
                boxShadow: '0 4px 20px hsla(45, 100%, 50%, 0.4)',
              }}
            >
              🎉 COLLECT REWARD!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LuckyWheel;
