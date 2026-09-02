import React from 'react';

export const EM_TUTORIAL_KEY = 'emergency_powerup_tutorial_seen_v1';

export const hasSeenEmergencyTutorial = (): boolean => {
  try { return localStorage.getItem(EM_TUTORIAL_KEY) === '1'; } catch { return false; }
};

export const markEmergencyTutorialSeen = () => {
  try { localStorage.setItem(EM_TUTORIAL_KEY, '1'); } catch {}
};

interface Props {
  coins: number;
  cost: number;
  onDismiss: () => void;
}

/**
 * Non-blocking coach mark for the FIRST Level 1 play only.
 * Points at the top-most emergency power-up button (AUTO) on the right rail.
 * Gameplay continues underneath: the wrapper is pointer-events-none and only
 * the SKIP button accepts taps, so the ball, paddle, banner and controls stay usable.
 */
const EmergencyTutorialCoach: React.FC<Props> = ({ coins, cost, onDismiss }) => {
  const enough = coins >= cost;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Ring highlight over the first emergency button (right: 6px, bottom: 80px, 44px) */}
      <div
        className="absolute rounded-full animate-ping"
        style={{
          right: '2px',
          bottom: '76px',
          width: '52px',
          height: '52px',
          border: '2px solid hsla(50, 100%, 60%, 0.9)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          right: '2px',
          bottom: '76px',
          width: '52px',
          height: '52px',
          border: '2px solid hsla(50, 100%, 65%, 0.95)',
          boxShadow: '0 0 18px hsla(50,100%,55%,0.7)',
        }}
      />

      {/* Animated pointing finger */}
      <div
        className="absolute text-2xl"
        style={{ right: '56px', bottom: '84px', animation: 'em-poke 1s ease-in-out infinite' }}
      >
        👉
      </div>

      {/* Tip card — sits above the buttons, clear of paddle and banner */}
      <div
        className="absolute rounded-xl px-3 py-2 pointer-events-auto"
        style={{
          right: '8px',
          bottom: '250px',
          maxWidth: '210px',
          background: 'linear-gradient(135deg, hsl(220,60%,10%), hsl(220,55%,16%))',
          border: '1px solid hsla(180,100%,60%,0.5)',
          boxShadow: '0 0 18px hsla(180,100%,50%,0.25)',
        }}
      >
        <div className="font-display text-[11px] mb-1" style={{ color: 'hsl(180,100%,65%)' }}>
          EMERGENCY POWER-UP
        </div>
        <p className="text-white/85 text-[11px] leading-snug">
          Tap here to buy one during a level.
        </p>
        <p className="text-[10px] mt-1" style={{ color: enough ? 'hsl(50,100%,60%)' : 'hsl(0,80%,65%)' }}>
          {enough
            ? `Costs 🪙 ${cost} — you have ${coins}.`
            : `Needs 🪙 ${cost} coins — you have ${coins}. Earn more first.`}
        </p>
        <button
          onClick={onDismiss}
          className="mt-2 w-full py-1.5 rounded-lg font-display text-[11px] text-black"
          style={{ background: 'linear-gradient(135deg, hsl(180,100%,55%), hsl(190,100%,45%))' }}
        >
          GOT IT
        </button>
      </div>

      <style>{`@keyframes em-poke { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-7px); } }`}</style>
    </div>
  );
};

export default EmergencyTutorialCoach;
