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

// Draw fiery ball icon (ball engulfed in flames inside blue circle)
const drawFireballIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  // Flame tongues around the ball
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
  
  // Core ball
  const ballGrad = ctx.createRadialGradient(x - size*0.05, y - size*0.05, 0, x, y, size * 0.14);
  ballGrad.addColorStop(0, 'hsl(50, 100%, 80%)');
  ballGrad.addColorStop(0.6, 'hsl(30, 100%, 55%)');
  ballGrad.addColorStop(1, 'hsl(10, 100%, 40%)');
  ctx.fillStyle = ballGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
};

// Draw multi-ball icon
const drawMultiBallIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  const r = size * 0.11;
  const positions = [
    { dx: -size * 0.14, dy: -size * 0.08 },
    { dx:  size * 0.14, dy: -size * 0.08 },
    { dx:  0,           dy:  size * 0.12 },
  ];
  
  positions.forEach((p, i) => {
    const grad = ctx.createRadialGradient(x + p.dx - r*0.3, y + p.dy - r*0.3, 0, x + p.dx, y + p.dy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, i === 2 ? '#88ccff' : '#aaddff');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x + p.dx, y + p.dy, r, 0, Math.PI * 2);
    ctx.fill();
  });
};

// Draw laser icon
const drawLaserIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  // Laser beam
  const laserGrad = ctx.createLinearGradient(x, y - size*0.25, x, y + size*0.25);
  laserGrad.addColorStop(0, '#ff2222');
  laserGrad.addColorStop(0.5, '#ff6666');
  laserGrad.addColorStop(1, '#ff2222');
  
  ctx.strokeStyle = laserGrad;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22);
  ctx.lineTo(x, y + size * 0.22);
  ctx.stroke();
  
  // Glow
  ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22);
  ctx.lineTo(x, y + size * 0.22);
  ctx.stroke();
  
  // Tip
  ctx.fillStyle = '#ffaaaa';
  ctx.beginPath();
  ctx.arc(x, y - size * 0.22, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
};

// Draw big ball icon
const drawBigBallIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  const grad = ctx.createRadialGradient(x - size*0.1, y - size*0.1, 0, x, y, size * 0.24);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#dddddd');
  grad.addColorStop(1, '#888888');
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.24, 0, Math.PI * 2);
  ctx.fill();
  
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(x - size*0.08, y - size*0.08, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
};

// Draw shock / electric icon
const drawShockIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  ctx.strokeStyle = '#ffff00';
  ctx.fillStyle = '#ffff00';
  ctx.lineWidth = 2.8;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  
  // Lightning bolt
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.24);
  ctx.lineTo(x + size * 0.08, y - size * 0.04);
  ctx.lineTo(x - size * 0.02, y - size * 0.04);
  ctx.lineTo(x + size * 0.06, y + size * 0.24);
  ctx.lineTo(x - size * 0.08, y + size * 0.02);
  ctx.lineTo(x + size * 0.02, y + size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

// Draw expand / wide paddle icon
const drawExpandIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  ctx.fillStyle = '#00e676';
  ctx.shadowColor = '#00e676';
  ctx.shadowBlur = 6;
  
  // Wide paddle shape
  ctx.beginPath();
  ctx.roundRect(x - size * 0.26, y - size * 0.09, size * 0.52, size * 0.18, 6);
  ctx.fill();
  ctx.shadowBlur = 0;
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

// Draw clear horseshoe magnet (old good version)
const drawMagnetIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);

  const s = size * 0.38;
  ctx.save();
  ctx.translate(x, y + s * 0.08);

  // Horseshoe shape
  ctx.beginPath();
  ctx.moveTo(-s * 0.55, s * 0.55);
  ctx.lineTo(-s * 0.55, -s * 0.15);
  ctx.quadraticCurveTo(-s * 0.55, -s * 0.55, 0, -s * 0.55);
  ctx.quadraticCurveTo(s * 0.55, -s * 0.55, s * 0.55, -s * 0.15);
  ctx.lineTo(s * 0.55, s * 0.55);
  ctx.lineTo(s * 0.28, s * 0.55);
  ctx.lineTo(s * 0.28, -s * 0.05);
  ctx.quadraticCurveTo(s * 0.28, -s * 0.28, 0, -s * 0.28);
  ctx.quadraticCurveTo(-s * 0.28, -s * 0.28, -s * 0.28, -s * 0.05);
  ctx.lineTo(-s * 0.28, s * 0.55);
  ctx.closePath();

  // Classic red-blue magnet gradient
  const grad = ctx.createLinearGradient(-s * 0.55, 0, s * 0.55, 0);
  grad.addColorStop(0, '#e53935');
  grad.addColorStop(0.48, '#e53935');
  grad.addColorStop(0.52, '#1e88e5');
  grad.addColorStop(1, '#1e88e5');
  ctx.fillStyle = grad;
  ctx.fill();

  // White poles
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-s * 0.55, s * 0.35, s * 0.27, s * 0.22);
  ctx.fillRect(s * 0.28, s * 0.35, s * 0.27, s * 0.22);

  // Small "N" and "S"
  ctx.fillStyle = '#111';
  ctx.font = `bold ${s * 0.22}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', -s * 0.415, s * 0.46);
  ctx.fillText('S', s * 0.415, s * 0.46);

  ctx.restore();
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
