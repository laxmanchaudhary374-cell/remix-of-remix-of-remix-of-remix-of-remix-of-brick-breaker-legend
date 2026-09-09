// Premium Power-Up Renderer V3 — Meta AI generated, adapted for game
// Bright saturated backgrounds + SILVER metallic icons = high contrast
// No text labels

import { PowerUp, PowerUpType } from '@/types/game';

const POWERUP_WIDTH = 50;
const POWERUP_HEIGHT = 26;

type Point = { x: number; y: number };

// ---------- HELPERS ----------
function silverGrad(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x - r*0.35, y - r*0.35, r*0.1, x, y, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.18, '#e8e8e8');
  g.addColorStop(0.4, '#a8a8a8');
  g.addColorStop(0.68, '#6e6e6e');
  g.addColorStop(0.9, '#3a3a3a');
  g.addColorStop(1, '#1e1e1e');
  return g;
}

function drawMetalSphere(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = silverGrad(ctx, cx, cy, r);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = Math.max(1, r*0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - r*0.3, cy - r*0.3, r*0.28, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fill();
}

// ---------- POWER-UP CONFIG ----------
const POWERUP_CFG: Record<string, { bg0: string; bg1: string; border: string; glow: string }> = {
  multiball: { bg0: '#ffe88a', bg1: '#ff9500', border: '#ffca28', glow: 'rgba(255,180,0,0.9)' },
  bigball: { bg0: '#ffb26e', bg1: '#ff5e00', border: '#ff8a2e', glow: 'rgba(255,100,0,0.9)' },
  magnet: { bg0: '#b3ecff', bg1: '#1e90ff', border: '#4fc3f7', glow: 'rgba(40,160,255,0.9)' },
  fireball: { bg0: '#ff8a65', bg1: '#d50000', border: '#ff3d00', glow: 'rgba(255,50,0,0.9)' },
  laser: { bg0: '#e8a0ff', bg1: '#7b1fa2', border: '#ce93d8', glow: 'rgba(180,60,255,0.9)' },
  shield: { bg0: '#8af0e8', bg1: '#00838f', border: '#4dd0e1', glow: 'rgba(0,200,200,0.9)' },
  shock: { bg0: '#fff59d', bg1: '#f9a825', border: '#ffee58', glow: 'rgba(255,230,0,0.9)' },
  ghost: { bg0: '#d5dde2', bg1: '#546e7a', border: '#90a4ae', glow: 'rgba(160,180,190,0.9)' },
  widen: { bg0: '#a5d6a7', bg1: '#2e7d32', border: '#81c784', glow: 'rgba(80,180,80,0.9)' },
  shrink: { bg0: '#f48fb1', bg1: '#ad1457', border: '#f06292', glow: 'rgba(255,60,120,0.9)' },
  slow: { bg0: '#c5e1a5', bg1: '#558b2f', border: '#aed581', glow: 'rgba(120,180,60,0.9)' },
  speedup: { bg0: '#e6ee9c', bg1: '#9e9d24', border: '#dce775', glow: 'rgba(200,200,0,0.9)' },
  autopaddle: { bg0: '#80cbc4', bg1: '#00695c', border: '#4db6ac', glow: 'rgba(0,180,160,0.9)' },
  extralife: { bg0: '#ef9a9a', bg1: '#b71c1c', border: '#ef5350', glow: 'rgba(255,60,60,0.9)' },
  sevenball: { bg0: '#ffe082', bg1: '#ff6f00', border: '#ffb300', glow: 'rgba(255,160,0,0.9)' },
};

// ---------- DRAW A SINGLE POWER-UP ICON ----------
function drawPowerUpIcon(
  ctx: CanvasRenderingContext2D,
  type: PowerUpType,
  x: number,
  y: number,
  size: number
): void {
  const cfg = POWERUP_CFG[type] || POWERUP_CFG.multiball;
  const r = size/2;
  const cx = x + r;
  const cy = y + r;
  const iconS = r * 1.15;

  ctx.save();
  // outer glow
  ctx.shadowColor = cfg.glow;
  ctx.shadowBlur = r * 0.55;
  ctx.beginPath();
  ctx.arc(cx, cy, r*0.92, 0, Math.PI*2);
  ctx.fillStyle = cfg.glow;
  ctx.fill();
  ctx.shadowBlur = 0;

  // bright 3D background
  const bgGrad = ctx.createRadialGradient(cx - r*0.32, cy - r*0.35, r*0.12, cx, cy, r*0.92);
  bgGrad.addColorStop(0, cfg.bg0);
  bgGrad.addColorStop(0.45, cfg.bg0);
  bgGrad.addColorStop(1, cfg.bg1);
  ctx.beginPath();
  ctx.arc(cx, cy, r*0.92, 0, Math.PI*2);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // glossy border
  ctx.beginPath();
  ctx.arc(cx, cy, r*0.92, 0, Math.PI*2);
  ctx.strokeStyle = cfg.border;
  ctx.lineWidth = r*0.14;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r*0.92, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = r*0.06;
  ctx.stroke();

  // top glossy highlight - sphere reflection
  const gloss = ctx.createRadialGradient(cx - r*0.18, cy - r*0.42, 0, cx, cy, r);
  gloss.addColorStop(0, 'rgba(255,255,255,0.68)');
  gloss.addColorStop(0.28, 'rgba(255,255,255,0.22)');
  gloss.addColorStop(0.62, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, r*0.92, 0, Math.PI*2);
  ctx.fillStyle = gloss;
  ctx.fill();

  // white curved streak top
  ctx.beginPath();
  ctx.ellipse(cx - r*0.12, cy - r*0.55, r*0.52, r*0.26, -0.18, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.fill();

  // ---- SILVER ICON ----
  ctx.translate(cx, cy);

  const S = (rad: number, px: number, py: number) => drawMetalSphere(ctx, px, py, rad);

  switch(type) {
    case 'multiball': {
      const sr = iconS * 0.26;
      S(sr, 0, -iconS*0.28);
      S(sr, -iconS*0.32, iconS*0.22);
      S(sr, iconS*0.32, iconS*0.22);
      break;
    }
    case 'bigball':
    case 'fireball': {
      S(iconS*0.52, 0, 0);
      break;
    }
    case 'sevenball': {
      const sr = iconS*0.17;
      S(sr, 0, 0);
      for(let i=0;i<6;i++){
        const a = (i/6)*Math.PI*2;
        S(sr, Math.cos(a)*iconS*0.38, Math.sin(a)*iconS*0.38);
      }
      break;
    }
    case 'magnet': {
      const mw = iconS*0.9, mh = iconS*0.95, mt = iconS*0.28;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const magGrad = ctx.createLinearGradient(-mw/2, 0, mw/2, 0);
      magGrad.addColorStop(0, '#1a4a8a');
      magGrad.addColorStop(0.5, '#3a9bff');
      magGrad.addColorStop(1, '#1a4a8a');
      ctx.beginPath();
      ctx.moveTo(-mw/2 + mt/2, -mh/2);
      ctx.lineTo(-mw/2 + mt/2, mh/2 - mw/2);
      ctx.arc(0, mh/2 - mw/2, mw/2 - mt/2, Math.PI, 0, false);
      ctx.lineTo(mw/2 - mt/2, -mh/2);
      ctx.strokeStyle = magGrad;
      ctx.lineWidth = mt;
      ctx.stroke();
      const capH = mt*0.55;
      ctx.fillStyle = silverGrad(ctx, -mw/2 + mt/2, -mh/2 + capH/2, mt*0.5);
      ctx.fillRect(-mw/2, -mh/2, mt, capH);
      ctx.fillStyle = silverGrad(ctx, mw/2 - mt/2, -mh/2 + capH/2, mt*0.5);
      ctx.fillRect(mw/2 - mt, -mh/2, mt, capH);
      ctx.restore();
      break;
    }
    case 'laser': {
      ctx.fillStyle = silverGrad(ctx, 0, 0, iconS*0.4);
      ctx.fillRect(-iconS*0.5, -iconS*0.12, iconS, iconS*0.24);
      ctx.fillRect(-iconS*0.15, -iconS*0.5, iconS*0.3, iconS);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(-iconS*0.6, -iconS*0.05, iconS*1.2, iconS*0.1);
      break;
    }
    case 'shield': {
      ctx.beginPath();
      ctx.moveTo(-iconS*0.45, -iconS*0.35);
      ctx.lineTo(iconS*0.45, -iconS*0.35);
      ctx.bezierCurveTo(iconS*0.55, iconS*0.05, iconS*0.2, iconS*0.55, 0, iconS*0.62);
      ctx.bezierCurveTo(-iconS*0.2, iconS*0.55, -iconS*0.55, iconS*0.05, -iconS*0.45, -iconS*0.35);
      ctx.closePath();
      ctx.fillStyle = silverGrad(ctx, 0, 0, iconS*0.5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      break;
    }
    case 'shock': {
      ctx.beginPath();
      ctx.moveTo(iconS*0.15, -iconS*0.55);
      ctx.lineTo(-iconS*0.15, -iconS*0.05);
      ctx.lineTo(iconS*0.15, -iconS*0.05);
      ctx.lineTo(-iconS*0.15, iconS*0.55);
      ctx.lineTo(iconS*0.25, iconS*0.05);
      ctx.lineTo(-iconS*0.1, iconS*0.05);
      ctx.closePath();
      ctx.fillStyle = silverGrad(ctx, 0, 0, iconS*0.4);
      ctx.fill();
      break;
    }
    case 'ghost': {
      ctx.beginPath();
      ctx.arc(0, -iconS*0.1, iconS*0.4, Math.PI, 0);
      ctx.lineTo(iconS*0.4, iconS*0.45);
      ctx.lineTo(iconS*0.2, iconS*0.25);
      ctx.lineTo(0, iconS*0.45);
      ctx.lineTo(-iconS*0.2, iconS*0.25);
      ctx.lineTo(-iconS*0.4, iconS*0.45);
      ctx.closePath();
      ctx.fillStyle = silverGrad(ctx, 0, 0, iconS*0.4);
      ctx.fill();
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(-iconS*0.15, -iconS*0.1, iconS*0.08, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(iconS*0.15, -iconS*0.1, iconS*0.08, 0, Math.PI*2); ctx.fill();
      break;
    }
    case 'widen': {
      ctx.fillStyle = silverGrad(ctx, 0, 0, iconS*0.2);
      ctx.fillRect(-iconS*0.35, -iconS*0.1, iconS*0.7, iconS*0.2);
      ctx.beginPath();
      ctx.moveTo(-iconS*0.65, 0); ctx.lineTo(-iconS*0.4, -iconS*0.18); ctx.lineTo(-iconS*0.4, iconS*0.18); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(iconS*0.65, 0); ctx.lineTo(iconS*0.4, -iconS*0.18); ctx.lineTo(iconS*0.4, iconS*0.18); ctx.closePath(); ctx.fill();
      break;
    }
    case 'shrink': {
      ctx.fillStyle = silverGrad(ctx, 0, 0, iconS*0.2);
      ctx.fillRect(-iconS*0.5, -iconS*0.1, iconS, iconS*0.2);
      ctx.beginPath(); ctx.moveTo(-iconS*0.2, 0); ctx.lineTo(-iconS*0.45, -iconS*0.18); ctx.lineTo(-iconS*0.45, iconS*0.18); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(iconS*0.2, 0); ctx.lineTo(iconS*0.45, -iconS*0.18); ctx.lineTo(iconS*0.45, iconS*0.18); ctx.closePath(); ctx.fill();
      break;
    }
    case 'slow': {
      ctx.beginPath(); ctx.arc(0,0, iconS*0.42, 0, Math.PI*2);
      ctx.strokeStyle = silverGrad(ctx,0,0,iconS*0.4) as any;
      ctx.lineWidth = iconS*0.08; ctx.stroke();
      ctx.fillStyle = silverGrad(ctx,0,0,iconS*0.1);
      ctx.fillRect(-iconS*0.04, -iconS*0.3, iconS*0.08, iconS*0.32);
      ctx.fillRect(-iconS*0.04, 0, iconS*0.28, iconS*0.08);
      break;
    }
    case 'speedup': {
      for(let k=0;k<3;k++){
        const off = (k-1)*iconS*0.28;
        ctx.beginPath();
        ctx.moveTo(off - iconS*0.18, -iconS*0.3);
        ctx.lineTo(off + iconS*0.12, 0);
        ctx.lineTo(off - iconS*0.18, iconS*0.3);
        ctx.lineTo(off - iconS*0.05, iconS*0.3);
        ctx.lineTo(off + iconS*0.25, 0);
        ctx.lineTo(off - iconS*0.05, -iconS*0.3);
        ctx.closePath();
        ctx.fillStyle = silverGrad(ctx, off, 0, iconS*0.2);
        ctx.fill();
      }
      break;
    }
    case 'autopaddle': {
      ctx.fillStyle = silverGrad(ctx,0,0,iconS*0.2);
      ctx.fillRect(-iconS*0.4, iconS*0.15, iconS*0.8, iconS*0.18);
      ctx.beginPath(); ctx.arc(0, -iconS*0.15, iconS*0.22, 0, Math.PI*2);
      ctx.fillStyle = silverGrad(ctx,0,-iconS*0.15,iconS*0.22); ctx.fill();
      break;
    }
    case 'extralife': {
      ctx.beginPath();
      ctx.moveTo(0, iconS*0.35);
      ctx.bezierCurveTo(iconS*0.5, iconS*0.05, iconS*0.35, -iconS*0.45, 0, -iconS*0.15);
      ctx.bezierCurveTo(-iconS*0.35, -iconS*0.45, -iconS*0.5, iconS*0.05, 0, iconS*0.35);
      ctx.fillStyle = silverGrad(ctx,0,0,iconS*0.4);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// ---------- MAIN EXPORT (matches existing interface) ----------
export const drawPowerUp = (
  ctx: CanvasRenderingContext2D,
  powerUp: PowerUp,
  gameTime: number
): void => {
  const { x, y, width, height, type } = powerUp;
  const size = Math.min(width, height) * 1.3;
  const pulse = 1 + Math.sin(gameTime * 5) * 0.08;
  const centerX = x + width / 2 - size / 2;
  const centerY = y + height / 2 - size / 2;

  ctx.save();
  ctx.scale(pulse, pulse);
  ctx.translate(
    (centerX * (1 - pulse)) / pulse + (1 - 1/pulse) * 0,
    (centerY * (1 - pulse)) / pulse + (1 - 1/pulse) * 0
  );
  drawPowerUpIcon(ctx, type, centerX, centerY, size);
  ctx.restore();
};

const getPowerUpColors = (type: PowerUpType): { bgColor: string; glowColor: string; isNegative: boolean } => {
  const cfg = POWERUP_CFG[type] || POWERUP_CFG.multiball;
  return {
    bgColor: cfg.bg1,
    glowColor: cfg.glow,
    isNegative: type === 'shrink' || type === 'speedup' || type === 'ghost',
  };
};

export const POWERUP_DIMENSIONS = { width: POWERUP_WIDTH, height: POWERUP_HEIGHT };

