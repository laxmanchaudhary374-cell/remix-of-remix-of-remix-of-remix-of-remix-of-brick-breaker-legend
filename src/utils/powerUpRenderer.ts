// Premium Power-Up Renderer
// All power-ups use uniform blue glowing circle background with white/colored icons

import { PowerUp, PowerUpType } from '@/types/game';

// Power-up pill dimensions - made bigger for mobile visibility
const POWERUP_WIDTH = 50;
const POWERUP_HEIGHT = 26;

// ============ SHARED HELPER ============

// Draw blue glowing circle background (used by ALL power-ups)
const drawBlueCircleBackground = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const circleRadius = size * 0.42;
  
  // Outer glow
  const outerGlow = ctx.createRadialGradient(x, y, circleRadius * 0.7, x, y, circleRadius * 1.4);
  outerGlow.addColorStop(0, 'hsla(200, 100%, 60%, 0.5)');
  outerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(x, y, circleRadius * 1.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Main blue circle
  const circleGrad = ctx.createRadialGradient(x - circleRadius * 0.3, y - circleRadius * 0.3, 0, x, y, circleRadius);
  circleGrad.addColorStop(0, 'hsl(200, 90%, 65%)');
  circleGrad.addColorStop(0.5, 'hsl(205, 85%, 50%)');
  circleGrad.addColorStop(1, 'hsl(210, 80%, 40%)');
  
  ctx.fillStyle = circleGrad;
  ctx.beginPath();
  ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner highlight ring
  ctx.strokeStyle = 'hsla(195, 100%, 75%, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, circleRadius - 2, 0, Math.PI * 2);
  ctx.stroke();
  
  // Outer bright edge
  ctx.strokeStyle = 'hsla(190, 100%, 80%, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, circleRadius + 1, 0, Math.PI * 2);
  ctx.stroke();
  
  // Highlight arc on top
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, circleRadius - 4, -Math.PI * 0.8, -Math.PI * 0.2);
  ctx.stroke();
};

// ============ ICON DRAWING FUNCTIONS ============

// Draw shiny blue horseshoe magnet (exact style from your image)
const drawMagnetIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);

  const s = size * 0.42;
  ctx.save();
  ctx.translate(x, y + s * 0.05);

  // Soft blue glow
  ctx.shadowColor = 'rgba(80, 180, 255, 0.95)';
  ctx.shadowBlur = 16;

  // Main horseshoe path
  ctx.beginPath();
  ctx.moveTo(-s * 0.58, s * 0.58);
  ctx.lineTo(-s * 0.58, -s * 0.12);
  ctx.quadraticCurveTo(-s * 0.58, -s * 0.62, 0, -s * 0.62);
  ctx.quadraticCurveTo(s * 0.58, -s * 0.62, s * 0.58, -s * 0.12);
  ctx.lineTo(s * 0.58, s * 0.58);
  ctx.lineTo(s * 0.32, s * 0.58);
  ctx.lineTo(s * 0.32, -s * 0.02);
  ctx.quadraticCurveTo(s * 0.32, -s * 0.32, 0, -s * 0.32);
  ctx.quadraticCurveTo(-s * 0.32, -s * 0.32, -s * 0.32, -s * 0.02);
  ctx.lineTo(-s * 0.32, s * 0.58);
  ctx.closePath();

  // Beautiful blue gradient matching your image
  const grad = ctx.createLinearGradient(-s * 0.6, -s * 0.4, s * 0.6, s * 0.5);
  grad.addColorStop(0, '#4fc3f7');
  grad.addColorStop(0.3, '#29b6f6');
  grad.addColorStop(0.65, '#0288d1');
  grad.addColorStop(1, '#01579b');
  ctx.fillStyle = grad;
  ctx.fill();

  // Bright edge
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(180, 230, 255, 0.95)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Silver poles
  ctx.fillStyle = '#e8f5ff';
  ctx.beginPath();
  ctx.roundRect(-s * 0.58, s * 0.32, s * 0.26, s * 0.26, 5);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(s * 0.32, s * 0.32, s * 0.26, s * 0.26, 5);
  ctx.fill();

  // Soft shadow on poles
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.roundRect(-s * 0.58, s * 0.48, s * 0.26, s * 0.10, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(s * 0.32, s * 0.48, s * 0.26, s * 0.10, 3);
  ctx.fill();

  ctx.restore();
};

// Draw auto paddle icon
const drawAutoPaddleIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  ctx.fillStyle = 'hsl(50, 100%, 55%)';
  ctx.font = `bold ${size * 0.2}px Orbitron, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'hsl(50, 100%, 40%)';
  ctx.shadowBlur = 3;
  ctx.fillText('AUTO', x, y);
  ctx.shadowBlur = 0;
};

// Draw fireball icon
const drawFireballIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  ctx.fillStyle = 'hsl(30, 100%, 55%)';
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const flameLen = size * (0.18 + Math.sin(i * 1.5) * 0.05);
    const tipX = x + Math.cos(angle) * flameLen;
    const tipY = y + Math.sin(angle) * flameLen;
    const base1X = x + Math.cos(angle - 0.3) * size * 0.1;
    const base1Y = y + Math.sin(angle - 0.3) * size * 0.1;
    const base2X = x + Math.cos(angle + 0.3) * size * 0.1;
    const base2Y = y + Math.sin(angle + 0.3) * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(base1X, base1Y);
    ctx.quadraticCurveTo(tipX, tipY, base2X, base2Y);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, size * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = 'hsl(50, 100%, 70%)';
  ctx.fill();
};

// Draw multi ball icon
const drawMultiBallIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  const r = size * 0.11;
  const positions = [
    { dx: -size * 0.14, dy: -size * 0.08 },
    { dx: size * 0.14, dy: -size * 0.08 },
    { dx: 0, dy: size * 0.12 },
  ];
  positions.forEach(p => {
    ctx.beginPath();
    ctx.arc(x + p.dx, y + p.dy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });
};

// Draw laser icon
const drawLaserIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22);
  ctx.lineTo(x, y + size * 0.22);
  ctx.stroke();
  ctx.fillStyle = '#ff6666';
  ctx.beginPath();
  ctx.arc(x, y - size * 0.18, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
};

// Draw big ball icon
const drawBigBallIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  ctx.beginPath();
  ctx.arc(x, y, size * 0.22, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(x - size * 0.08, y - size * 0.08, 0, x, y, size * 0.22);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, '#aaaaaa');
  ctx.fillStyle = grad;
  ctx.fill();
};

// Draw shock / electric icon
const drawShockIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  ctx.strokeStyle = '#ffff00';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.22);
  ctx.lineTo(x + size * 0.05, y - size * 0.05);
  ctx.lineTo(x - size * 0.05, y - size * 0.05);
  ctx.lineTo(x + size * 0.08, y + size * 0.22);
  ctx.stroke();
};

// Draw expand paddle icon
const drawExpandIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  ctx.fillStyle = '#00e676';
  ctx.fillRect(x - size * 0.22, y - size * 0.08, size * 0.44, size * 0.16);
};

// ============ MAIN DRAW FUNCTION ============

const drawPowerUpIcon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: PowerUpType
) => {
  switch (type) {
    case 'magnet':
      drawMagnetIcon(ctx, x, y, size);
      break;
    case 'auto':
    case 'autopaddle':
      drawAutoPaddleIcon(ctx, x, y, size);
      break;
    case 'fireball':
    case 'fire':
      drawFireballIcon(ctx, x, y, size);
      break;
    case 'multi':
    case 'multiball':
      drawMultiBallIcon(ctx, x, y, size);
      break;
    case 'laser':
      drawLaserIcon(ctx, x, y, size);
      break;
    case 'bigball':
    case 'big':
      drawBigBallIcon(ctx, x, y, size);
      break;
    case 'shock':
    case 'electric':
      drawShockIcon(ctx, x, y, size);
      break;
    case 'expand':
    case 'wide':
      drawExpandIcon(ctx, x, y, size);
      break;
    default:
      drawBlueCircleBackground(ctx, x, y, size);
      break;
  }
};

export const drawPowerUp = (
  ctx: CanvasRenderingContext2D,
  powerUp: PowerUp
) => {
  const x = powerUp.x;
  const y = powerUp.y;
  const size = Math.max(POWERUP_WIDTH, POWERUP_HEIGHT);

  drawPowerUpIcon(ctx, x, y, size, powerUp.type);
};
