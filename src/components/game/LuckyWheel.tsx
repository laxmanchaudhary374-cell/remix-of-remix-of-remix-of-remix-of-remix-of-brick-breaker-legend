import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { showRewardedAd } from '@/utils/admob';

interface LuckyWheelProps {
  onClose: (reward?: { type: string; amount: number; label: string }) => void;
}

const SEGMENTS = [
  { label: '1000', icon: '🪙', type: 'coins', amount: 1000, color1: '#e8a0d0', color2: '#d080b8' },
  { label: 'AUTO x2', icon: '🎯', type: 'auto', amount: 2, color1: '#80d0a0', color2: '#60b880' },
  { label: '500', icon: '🪙', type: 'coins', amount: 500, color1: '#80c8e8', color2: '#60b0d0' },
  { label: 'Multi x1', icon: '⚡', type: 'multi', amount: 1, color1: '#a080d8', color2: '#8060c0' },
  { label: 'Shock x2', icon: '⚡', type: 'shock', amount: 2, color1: '#80c8e8', color2: '#60b0d0' },
  { label: '2000', icon: '🪙', type: 'coins', amount: 2000, color1: '#e8a0d0', color2: '#d080b8' },
  { label: 'AUTO x1', icon: '🎯', type: 'auto', amount: 1, color1: '#a080d8', color2: '#8060c0' },
  { label: '300', icon: '🪙', type: 'coins', amount: 300, color1: '#80d0a0', color2: '#60b880' },
  { label: 'Multi x2', icon: '⚡', type: 'multi', amount: 2, color1: '#80c8e8', color2: '#60b0d0' },
  { label: 'Shock x1', icon: '⚡', type: 'shock', amount: 1, color1: '#a080d8', color2: '#8060c0' },
];

const STORAGE_KEYS = {
  lastSpin: 'lucky_wheel_last_spin',
  freeSpinUsed: 'lucky_wheel_free_spin_used',
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

const canFreeSpin = (): boolean => {
  try {
    const today = new Date().toDateString();
    const used = localStorage.getItem(STORAGE_KEYS.freeSpinUsed);
    return used !== today;
  } catch {
    return true;
  }
};

const recordFreeSpin = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.freeSpinUsed, new Date().toDateString());
  } catch {}
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
  const [hasFree, setHasFree] = useState(canFreeSpin());
  const rotationRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const { can, timeLeft } = canSpin();

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = cx - 30;
    const segAngle = (2 * Math.PI) / SEGMENTS.length;

    ctx.clearRect(0, 0, size, size);

    // Outer dark ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 22, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a3a';
    ctx.fill();
    ctx.strokeStyle = '#3344aa';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Light bulbs around the edge
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const dotX = cx + Math.cos(angle) * (r + 28);
      const dotY = cy + Math.sin(angle) * (r + 28);
      const isLit = Math.floor(Date.now() / 200 + i) % 3 === 0;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = isLit ? '#ffffff' : '#334466';
      ctx.fill();
      if (isLit) {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Inner blue ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#4466cc';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw segments
    SEGMENTS.forEach((seg, i) => {
      const startAngle = rot + i * segAngle;
      const endAngle = startAngle + segAngle;

      // Segment fill
      const midAngle = startAngle + segAngle / 2;
      const gx = cx + Math.cos(midAngle) * r * 0.6;
      const gy = cy + Math.sin(midAngle) * r * 0.6;
      const segGrad = ctx.createRadialGradient(cx, cy, r * 0.15, gx, gy, r);
      segGrad.addColorStop(0, seg.color1);
      segGrad.addColorStop(1, seg.color2);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segGrad;
      ctx.fill();

      // Segment border (silver)
      ctx.strokeStyle = 'rgba(200, 210, 230, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Icon and text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + segAngle / 2);
      
      // Icon
      ctx.font = '34px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(seg.icon, r * 0.62, 0);
      
      // Label - bigger and bolder for readability
      ctx.font = 'bold 20px Orbitron, sans-serif';
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'center';
      ctx.fillText(seg.label, r * 0.38, 0);
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Center hub - purple metallic
    const hubGrad = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 32);
    hubGrad.addColorStop(0, '#cc88ff');
    hubGrad.addColorStop(0.4, '#8844cc');
    hubGrad.addColorStop(0.8, '#442266');
    hubGrad.addColorStop(1, '#221133');
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    
    // Hub outer ring
    ctx.strokeStyle = '#6633aa';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner hub circle
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    const innerHub = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, 16);
    innerHub.addColorStop(0, '#ee99ff');
    innerHub.addColorStop(0.5, '#aa55dd');
    innerHub.addColorStop(1, '#6633aa');
    ctx.fillStyle = innerHub;
    ctx.fill();
  };

  useEffect(() => {
    drawWheel(0);
    // Animate light bulbs
    const interval = setInterval(() => {
      if (!isSpinning) drawWheel(rotationRef.current);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const targetIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segAngle = (2 * Math.PI) / SEGMENTS.length;
    const targetAngle = -Math.PI / 2 - (targetIndex * segAngle + segAngle / 2);
    const extraSpins = 6 + Math.floor(Math.random() * 4);
    const finalRotation = targetAngle + extraSpins * Math.PI * 2;

    const startTime = performance.now();
    const duration = 5000;
    const startRot = rotationRef.current;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Cubic ease-out for smooth deceleration
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

  const handleAdSpin = async () => {
    if (isSpinning) return;
    const result = await showRewardedAd(() => {});
    if (result.ok === false) {
      alert(result.error || 'Ad not available');
    } else if (result.reward > 0) {
      setAdWatched(true);
      handleSpin();
    } else {
      alert('Please watch the full ad to spin!');
    }
  };

  const handleFreeSpin = () => {
    if (isSpinning || !hasFree) return;
    recordFreeSpin();
    setHasFree(false);
    handleSpin();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full rounded-2xl overflow-hidden p-4"
        style={{
          background: 'linear-gradient(180deg, #0d1b3a 0%, #060d1f 100%)',
          border: '2px solid rgba(60, 100, 200, 0.4)',
          boxShadow: '0 0 60px rgba(50, 80, 200, 0.15), inset 0 1px 0 rgba(100, 150, 255, 0.1)',
          maxWidth: '380px',
        }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex-1 py-2 px-4 rounded-lg text-center"
            style={{
              background: 'linear-gradient(180deg, #2255bb 0%, #1a3388 100%)',
              border: '1px solid #4488dd',
              boxShadow: '0 2px 10px rgba(50, 100, 200, 0.3)',
            }}
          >
            <h2 className="font-display text-lg font-black tracking-wider"
              style={{ 
                color: '#ffffff',
                textShadow: '0 0 10px rgba(100, 200, 255, 0.5)',
              }}
            >
              LUCKY WHEEL
            </h2>
          </div>
          <button
            onClick={() => onClose()}
            className="ml-3 w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style={{
              background: 'linear-gradient(135deg, #cc3333, #aa2222)',
              border: '2px solid #ff6666',
            }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Wheel container */}
        <div className="relative flex justify-center mb-3">
          {/* Pointer - red triangle at top */}
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 z-10"
            style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.8))' }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '14px solid transparent',
                borderRight: '14px solid transparent',
                borderTop: '30px solid #ff3333',
              }}
            />
            {/* Red dot at tip */}
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#ff0000',
                border: '2px solid #ff6666',
                position: 'absolute',
                top: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                boxShadow: '0 0 8px #ff0000',
              }}
            />
          </div>
          <canvas ref={canvasRef} width={600} height={600} className="rounded-full" 
            style={{ width: '300px', height: '300px', filter: 'drop-shadow(0 4px 20px rgba(50, 50, 150, 0.4))' }}
          />
        </div>

        {/* Result */}
        {result && (
          <div
            className="mb-3 py-3 px-4 rounded-xl text-center animate-scale-in"
            style={{
              background: 'linear-gradient(135deg, #1a3366 0%, #0d1a33 100%)',
              border: '2px solid #4488dd',
              boxShadow: '0 0 20px rgba(50, 100, 200, 0.3)',
            }}
          >
            <p className="font-display text-lg text-white font-bold">
              You won <span style={{ color: '#00ddff' }}>{result.icon} {result.label}</span>!
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {!result ? (
            <>
              <button
                onClick={handleAdSpin}
                disabled={isSpinning}
                className="flex-1 py-3.5 font-display text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(180deg, #00cccc 0%, #008888 100%)',
                  color: '#ffffff',
                  boxShadow: '0 4px 15px rgba(0, 200, 200, 0.3)',
                  border: '1px solid #00ffff',
                }}
              >
                <span style={{ fontSize: '16px' }}>🎬</span>
                {isSpinning ? 'Spinning...' : 'Spin'}
              </button>
              <button
                onClick={handleFreeSpin}
                disabled={isSpinning || !hasFree}
                className="flex-1 py-3.5 font-display text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{
                  background: hasFree 
                    ? 'linear-gradient(180deg, #00cccc 0%, #008888 100%)'
                    : 'linear-gradient(180deg, #333 0%, #222 100%)',
                  color: '#ffffff',
                  boxShadow: hasFree ? '0 4px 15px rgba(0, 200, 200, 0.3)' : 'none',
                  border: hasFree ? '1px solid #00ffff' : '1px solid #444',
                }}
              >
                {hasFree ? 'Free' : !can ? `⏳ ${timeLeft}` : 'Used'}
              </button>
            </>
          ) : (
            <button
              onClick={() => onClose(result)}
              className="flex-1 py-3.5 font-display text-sm font-bold rounded-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(180deg, #00cccc 0%, #008888 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 15px rgba(0, 200, 200, 0.3)',
                border: '1px solid #00ffff',
              }}
            >
              COLLECT REWARD!
            </button>
          )}
        </div>

        {/* Power-up inventory display at bottom */}
        <div className="flex justify-center gap-6 mt-4 pt-3" style={{ borderTop: '1px solid rgba(60, 100, 200, 0.3)' }}>
          {[
            { icon: '🎯', label: 'AUTO' },
            { icon: '⚡', label: 'SHOCK' },
            { icon: '💫', label: 'MULTI' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, #2266cc 0%, #113366 100%)',
                  border: '2px solid #4488dd',
                  boxShadow: '0 0 10px rgba(50, 100, 200, 0.4)',
                }}
              >
                <span className="text-lg">{item.icon}</span>
              </div>
              <span className="text-[10px] text-cyan-300 font-display">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LuckyWheel;
