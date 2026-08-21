// Premium Code-Based Brick Renderer
// Tries to get as close as possible to high-quality 3D style using pure Canvas

import { Brick, BrickColor, BrickType } from '@/types/game';

const brickSpriteCache = new Map<string, HTMLCanvasElement>();
const MAX_CACHE_SIZE = 250;

function getCachedBrickSprite(
  key: string,
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D) => void
): HTMLCanvasElement {
  let cached = brickSpriteCache.get(key);
  if (cached) return cached;

  if (brickSpriteCache.size >= MAX_CACHE_SIZE) {
    const firstKey = brickSpriteCache.keys().next().value;
    if (firstKey) brickSpriteCache.delete(firstKey);
  }

  const dpr = Math.max(window.devicePixelRatio || 1, 2);
  const offscreen = document.createElement('canvas');
  offscreen.width = (Math.ceil(width) + 8) * dpr;
  offscreen.height = (Math.ceil(height) + 8) * dpr;
  const offCtx = offscreen.getContext('2d')!;
  offCtx.scale(dpr, dpr);
  offCtx.translate(4, 4);
  drawFn(offCtx);
  brickSpriteCache.set(key, offscreen);
  return offscreen;
}

// ---------- Material Colors ----------
const getMaterial = (color: BrickColor, type: BrickType) => {
  if (type === 'indestructible') {
    return {
      top: '#9aa0a6',
      mid: '#5f6368',
      bot: '#3c4043',
      shine: 'rgba(255,255,255,0.55)',
      accent: '#c0c4c8',
    };
  }

  const materials: Record<string, any> = {
    orange: { // Copper
      top: '#ff9f43', mid: '#e67e22', bot: '#a0490f',
      shine: 'rgba(255,220,180,0.7)', accent: '#2ecc71'
    },
    cyan: { // Ice
      top: '#81ecec', mid: '#00cec9', bot: '#00838f',
      shine: 'rgba(220,250,255,0.75)', accent: '#74b9ff'
    },
    purple: { // Metal
      top: '#a29bfe', mid: '#6c5ce7', bot: '#4834d4',
      shine: 'rgba(220,210,255,0.6)', accent: '#dfe6e9'
    },
    yellow: { // Gold
      top: '#ffeaa7', mid: '#fdcb6e', bot: '#d4a017',
      shine: 'rgba(255,250,220,0.8)', accent: '#f1c40f'
    },
    green: { // Glass
      top: '#55efc4', mid: '#00b894', bot: '#007a5e',
      shine: 'rgba(200,255,240,0.7)', accent: '#81ecec'
    },
    magenta: { // Diamond
      top: '#fd79a8', mid: '#e84393', bot: '#c2185b',
      shine: 'rgba(255,220,240,0.75)', accent: '#ffeaa7'
    },
    red: {
      top: '#ff7675', mid: '#d63031', bot: '#b71c1c',
      shine: 'rgba(255,200,200,0.65)', accent: '#fab1a0'
    },
    gold: {
      top: '#ffeaa7', mid: '#f1c40f', bot: '#b7950b',
      shine: 'rgba(255,250,220,0.8)', accent: '#fdcb6e'
    },
  };

  return materials[color] || materials.orange;
};

// ---------- Main Draw Function ----------
export const drawPremiumBrick = (
  ctx: CanvasRenderingContext2D,
  brick: Brick
): void => {
  if (brick.destroyed) return;

  const { x, y, width: w, height: h, color, type, hits, maxHits } = brick;
  const cacheKey = `${color}_${type}_${w}_${h}_${hits}_${maxHits}`;

  const sprite = getCachedBrickSprite(cacheKey, w, h, (c) => {
    const m = getMaterial(color, type);
    const r = 7;

    // Soft glow
    c.shadowColor = m.mid;
    c.shadowBlur = 12;
    c.fillStyle = m.bot;
    c.beginPath();
    c.roundRect(0, 0, w, h, r);
    c.fill();
    c.shadowBlur = 0;

    // Main body gradient
    const body = c.createLinearGradient(0, 0, 0, h);
    body.addColorStop(0, m.top);
    body.addColorStop(0.45, m.mid);
    body.addColorStop(1, m.bot);
    c.fillStyle = body;
    c.beginPath();
    c.roundRect(0, 0, w, h, r);
    c.fill();

    // Strong top shine (glass effect)
    const shine = c.createLinearGradient(0, 0, 0, h * 0.5);
    shine.addColorStop(0, m.shine);
    shine.addColorStop(0.7, 'rgba(255,255,255,0.08)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = shine;
    c.beginPath();
    c.roundRect(3, 2, w - 6, h * 0.42, r - 2);
    c.fill();

    // Inner border
    c.strokeStyle = 'rgba(255,255,255,0.22)';
    c.lineWidth = 1.5;
    c.beginPath();
    c.roundRect(2, 2, w - 4, h - 4, r - 1);
    c.stroke();

    // Bottom dark edge
    c.strokeStyle = 'rgba(0,0,0,0.45)';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(r, h - 1.5);
    c.lineTo(w - r, h - 1.5);
    c.stroke();

    // ===== Special Icons =====
    c.save();
    c.translate(w / 2, h / 2);

    if (type === 'indestructible') {
      // Rivets
      c.fillStyle = m.accent;
      [[-w*0.32, -h*0.28], [w*0.32, -h*0.28], [-w*0.32, h*0.28], [w*0.32, h*0.28]].forEach(([rx, ry]) => {
        c.beginPath();
        c.arc(rx, ry, 2.8, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(255,255,255,0.6)';
        c.beginPath();
        c.arc(rx - 0.8, ry - 0.8, 1, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = m.accent;
      });
    } else if (type === 'explosive') {
      // Simple bomb / circle
      c.fillStyle = 'rgba(255,100,0,0.9)';
      c.beginPath();
      c.arc(0, 0, 5, 0, Math.PI * 2);
      c.fill();
    } else if (hits < maxHits) {
      // Crack
      c.strokeStyle = 'rgba(0,0,0,0.4)';
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(-w * 0.25, -h * 0.3);
      c.lineTo(-w * 0.05, 0);
      c.lineTo(-w * 0.2, h * 0.3);
      c.stroke();
    } else {
      // Small center detail for normal bricks
      c.fillStyle = 'rgba(255,255,255,0.25)';
      c.beginPath();
      c.arc(0, 0, 2.5, 0, Math.PI * 2);
      c.fill();
    }

    c.restore();
  });

  ctx.drawImage(sprite, x - 4, y - 4, w + 8, h + 8);
};

// Keep old export name working
export const drawBrick = drawPremiumBrick;
