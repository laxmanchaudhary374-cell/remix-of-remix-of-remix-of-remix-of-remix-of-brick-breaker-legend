import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const TUTORIAL_KEY = 'neon_breaker_tutorial_seen_v1';

export const hasSeenTutorial = (): boolean => {
  try { return localStorage.getItem(TUTORIAL_KEY) === '1'; } catch { return false; }
};
export const markTutorialSeen = () => {
  try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch {}
};

interface Step {
  title: string;
  body: string;
  visual: React.ReactNode;
}

const steps: Step[] = [
  {
    title: 'MOVE THE PADDLE',
    body: 'Drag your finger left and right anywhere on the screen to move the paddle and bounce the ball. Don\'t let the ball fall!',
    visual: (
      <div className="relative w-full h-32 flex items-end justify-center">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)]" />
        <div className="w-20 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(0,200,255,0.7)]" />
      </div>
    ),
  },
  {
    title: 'BREAK THE BRICKS',
    body: 'Hit every brick with the ball to clear the level. Some bricks are tough and need multiple hits. Clear them all to advance!',
    visual: (
      <div className="grid grid-cols-5 gap-1 p-2">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="h-5 rounded" style={{
            background: ['hsl(0,80%,55%)','hsl(180,80%,50%)','hsl(280,80%,55%)','hsl(50,90%,55%)','hsl(120,70%,50%)'][i%5],
            boxShadow: '0 0 8px currentColor, inset 0 -2px 0 rgba(0,0,0,0.3)'
          }} />
        ))}
      </div>
    ),
  },
  {
    title: 'COLLECT POWER-UPS',
    body: 'Falling capsules give you boosts: bigger paddle, multi-balls, lasers, sticky paddle and more. Catch them with your paddle!',
    visual: (
      <div className="flex justify-around items-center h-24">
        {['hsl(50,100%,55%)','hsl(280,100%,60%)','hsl(180,100%,55%)','hsl(120,80%,55%)'].map((c,i)=>(
          <div key={i} className="w-8 h-4 rounded-full animate-pulse" style={{ background: c, boxShadow: `0 0 12px ${c}` }} />
        ))}
      </div>
    ),
  },
  {
    title: 'EMERGENCY POWER-UPS',
    body: 'Three buttons on the right side can save you anytime!\n\n• AUTO – paddle plays itself for a few seconds\n• ⚡ SHOCK – destroys nearby bricks\n• 3-BALLS – splits into multiple balls',
    visual: (
      <div className="flex justify-center gap-3">
        {['AUTO','⚡','●●●'].map((label, i)=>(
          <div key={i} className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white"
            style={{
              background: 'radial-gradient(circle at 40% 35%, hsl(200, 100%, 72%), hsl(210, 85%, 50%))',
              boxShadow: '0 0 15px hsla(200,100%,60%,0.6), inset 0 -3px 8px hsla(210,100%,25%,0.5)',
              border: '2px solid hsla(195,100%,75%,0.6)',
              fontSize: i === 1 ? '22px' : '12px',
              color: i === 0 ? 'hsl(50,100%,55%)' : 'white',
            }}>
            {label}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'RUN OUT? BUY MORE!',
    body: 'When an emergency power-up runs out, tapping it lets you instantly BUY one with coins — even mid-level. Never get stuck again!',
    visual: (
      <div className="flex flex-col items-center gap-2">
        <div className="px-4 py-2 rounded-lg border border-cyan-400/40 bg-black/60">
          <div className="text-cyan-300 text-xs font-bold mb-1">BUY POWER-UP</div>
          <div className="text-yellow-300 font-bold">🪙 75 Coins</div>
        </div>
      </div>
    ),
  },
  {
    title: 'EARN COINS & LIVES',
    body: 'Complete levels to earn 🪙 coins. Spend them in the Shop on power-ups, extra balls, and special items. Watch your ❤️ lives — lose all 3 and it\'s game over!',
    visual: (
      <div className="flex justify-center gap-4 text-2xl">
        <span>🪙</span><span>❤️</span><span>⭐</span><span>🎁</span>
      </div>
    ),
  },
  {
    title: 'DAILY REWARDS & WHEEL',
    body: 'Open the app every day for free coins! Spin the Lucky Wheel from the menu for bonus power-ups and coins. Don\'t miss out!',
    visual: (
      <div className="w-24 h-24 mx-auto rounded-full border-4 border-yellow-400 animate-spin"
        style={{ background: 'conic-gradient(hsl(0,80%,55%), hsl(50,90%,55%), hsl(120,70%,50%), hsl(180,80%,50%), hsl(280,80%,55%), hsl(0,80%,55%))', animationDuration: '4s' }} />
    ),
  },
];

interface Props { onClose: () => void; }

const TutorialOverlay: React.FC<Props> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const s = steps[step];

  const finish = () => { markTutorialSeen(); onClose(); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl border border-cyan-400/40 p-6 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, hsl(220,60%,8%), hsl(240,55%,12%))' }}>
        <button onClick={finish} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80">
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-2 text-xs text-cyan-300/70 font-bold tracking-widest">
          HOW TO PLAY  ·  {step + 1}/{steps.length}
        </div>

        <h2 className="text-center font-display text-2xl font-bold text-cyan-300 mb-4" style={{ textShadow: '0 0 12px hsla(180,100%,60%,0.6)' }}>
          {s.title}
        </h2>

        <div className="rounded-xl bg-black/40 border border-white/5 p-4 mb-4 min-h-[140px] flex items-center justify-center">
          {s.visual}
        </div>

        <p className="text-white/85 text-sm leading-relaxed text-center whitespace-pre-line min-h-[88px]">
          {s.body}
        </p>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 my-4">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-cyan-400' : 'w-1.5 bg-white/25'}`} />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold flex items-center justify-center gap-1">
              <ChevronLeft className="w-4 h-4" /> BACK
            </button>
          )}
          <button onClick={isLast ? finish : () => setStep(step + 1)}
            className="flex-[2] py-3 rounded-lg font-display font-bold text-black flex items-center justify-center gap-1"
            style={{ background: 'linear-gradient(135deg, hsl(180,100%,55%), hsl(190,100%,45%))', boxShadow: '0 4px 15px hsla(180,100%,50%,0.4)' }}>
            {isLast ? "LET'S PLAY!" : <>NEXT <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
