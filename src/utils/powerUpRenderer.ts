// Premium Power-Up Renderer V2
// Bright saturated backgrounds + SILVER metallic icons = high contrast
// No text labels

import { PowerUp, PowerUpType } from '@/types/game';

const POWERUP_WIDTH = 50;
const POWERUP_HEIGHT = 26;

// ============ SHARED HELPERS ============

// Draw a silver/metallic small sphere (used for icons inside power-ups)
const drawSilverSphere = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(240, 245, 250, 1)');
  grad.addColorStop(0.5, 'rgba(180, 195, 215, 1)');
  grad.addColorStop(0.8, 'rgba(120, 140, 165, 1)');
  grad.addColorStop(1, 'rgba(80, 100, 130, 1)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // Bright highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
};

// Draw glossy 3D circle background — BRIGHT saturated colors
const drawGlossyBackground = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  innerColor: string,
  outerColor: string,
  borderColor: string
) => {
  const r = size * 0.42;

  // Outer glow
  ctx.shadowColor = borderColor;
  ctx.shadowBlur = 14;

  // Main circle — bright gradient
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.7, outerColor);
  grad.addColorStop(1, outerColor);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Glossy highlight (top half — simulates 3D sphere)
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  const glossGrad = ctx.createLinearGradient(x, y - r, x, y + r * 0.3);
  glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
  glossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glossGrad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Bright glowing border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
};

// Bright color config — each power-up has a DISTINCT bright color
const POWERUP_COLOR_CONFIG: Record<string, {
  inner: string; outer: string; border: string;
}> = {
  fireball:   { inner: 'hsl(20, 100%, 60%)',  outer: 'hsl(15, 100%, 45%)',  border: 'hsl(35, 100%, 60%)' },
  multiball:  { inner: 'hsl(45, 100%, 60%)',  outer: 'hsl(35, 100%, 45%)',  border: 'hsl(50, 100%, 55%)' },
  sevenball:  { inner: 'hsl(280, 90%, 65%)',  outer: 'hsl(270, 85%, 50%)',  border: 'hsl(290, 90%, 65%)' },
  bigball:    { inner: 'hsl(200, 80%, 55%)',  outer: 'hsl(210, 85%, 40%)',  border: 'hsl(195, 100%, 60%)' },
  slow:       { inner: 'hsl(160, 80%, 50%)',  outer: 'hsl(165, 80%, 38%)',  border: 'hsl(150, 100%, 50%)' },
  widen:      { inner: 'hsl(120, 70%, 50%)',  outer: 'hsl(130, 80%, 38%)',  border: 'hsl(100, 100%, 50%)' },
  shrink:     { inner: 'hsl(0, 80%, 55%)',    outer: 'hsl(0, 80%, 40%)',    border: 'hsl(10, 100%, 55%)' },
  extralife:  { inner: 'hsl(340, 90%, 60%)',  outer: 'hsl(340, 85%, 45%)',  border: 'hsl(350, 100%, 60%)' },
  laser:      { inner: 'hsl(0, 90%, 55%)',    outer: 'hsl(0, 85%, 40%)',    border: 'hsl(15, 100%, 55%)' },
  magnet:     { inner: 'hsl(200, 80%, 55%)',  outer: 'hsl(210, 85%, 40%)',  border: 'hsl(190, 100%, 60%)' },
  shield:     { inner: 'hsl(195, 80%, 55%)',  outer: 'hsl(200, 80%, 40%)',  border: 'hsl(190, 100%, 60%)' },
  speedup:    { inner: 'hsl(280, 80%, 60%)',  outer: 'hsl(270, 80%, 45%)',  border: 'hsl(290, 90%, 60%)' },
  autopaddle: { inner: 'hsl(180, 70%, 50%)',  outer: 'hsl(180, 75%, 38%)',  border: 'hsl(170, 100%, 50%)' },
  shock:      { inner: 'hsl(50, 100%, 55%)',  outer: 'hsl(40, 100%, 42%)',  border: 'hsl(55, 100%, 60%)' },
  ghost:      { inner: 'hsl(270, 60%, 55%)',  outer: 'hsl(260, 55%, 40%)',  border: 'hsl(280, 60%, 60%)' },
};

// ============ ICON DRAWING FUNCTIONS ============

const drawFireballIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.fireball;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  // Silver ball with orange flames
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
  drawSilverSphere(ctx, x, y, size * 0.12);
};

const drawMultiballIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.multiball;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  const ballRadius = size * 0.12;
  const spacing = size * 0.15;
  drawSilverSphere(ctx, x - spacing, y, ballRadius);
  drawSilverSphere(ctx, x + spacing, y, ballRadius);
};

const drawSevenballIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.sevenball;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  const ballRadius = size * 0.09;
  const positions = [
    { dx: 0, dy: -0.12 },
    { dx: -0.13, dy: 0.1 },
    { dx: 0.13, dy: 0.1 },
  ];
  positions.forEach(pos => {
    drawSilverSphere(ctx, x + pos.dx * size, y + pos.dy * size, ballRadius);
  });
};

const drawBigballIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.bigball;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  drawSilverSphere(ctx, x, y, size * 0.25);
};

const drawSlowIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.slow;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  // Silver arrow pointing DOWN
  ctx.fillStyle = 'rgba(220, 230, 240, 1)';
  ctx.beginPath();
  const s = size * 0.15;
  ctx.moveTo(x, y + s * 1.2);
  ctx.lineTo(x + s * 0.9, y - s * 0.1);
  ctx.lineTo(x + s * 0.35, y - s * 0.1);
  ctx.lineTo(x + s * 0.35, y - s * 1.0);
  ctx.lineTo(x - s * 0.35, y - s * 1.0);
  ctx.lineTo(x - s * 0.35, y - s * 0.1);
  ctx.lineTo(x - s * 0.9, y - s * 0.1);
  ctx.closePath();
  ctx.fill();
};

const drawSpeedupIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.speedup;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  // Silver arrow pointing UP
  ctx.fillStyle = 'rgba(220, 230, 240, 1)';
  ctx.beginPath();
  const s = size * 0.15;
  ctx.moveTo(x, y - s * 1.2);
  ctx.lineTo(x + s * 0.9, y + s * 0.1);
  ctx.lineTo(x + s * 0.35, y + s * 0.1);
  ctx.lineTo(x + s * 0.35, y + s * 1.0);
  ctx.lineTo(x - s * 0.35, y + s * 1.0);
  ctx.lineTo(x - s * 0.35, y + s * 0.1);
  ctx.lineTo(x - s * 0.9, y + s * 0.1);
  ctx.closePath();
  ctx.fill();
};

const drawWidenIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.widen;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  const paddleWidth = size * 0.50;
  const paddleHeight = size * 0.14;
  // Silver paddle
  const grad = ctx.createLinearGradient(x, y - paddleHeight/2, x, y + paddleHeight/2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.5, 'rgba(200, 215, 230, 1)');
  grad.addColorStop(1, 'rgba(140, 155, 175, 1)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x - paddleWidth/2, y - paddleHeight/2, paddleWidth, paddleHeight, paddleHeight/2);
  ctx.fill();
  // Silver arrows
  ctx.strokeStyle = 'rgba(220, 230, 240, 1)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - paddleWidth/2 - size * 0.03, y);
  ctx.lineTo(x - paddleWidth/2 - size * 0.18, y);
  ctx.moveTo(x - paddleWidth/2 - size * 0.18, y);
  ctx.lineTo(x - paddleWidth/2 - size * 0.12, y - size * 0.07);
  ctx.moveTo(x - paddleWidth/2 - size * 0.18, y);
  ctx.lineTo(x - paddleWidth/2 - size * 0.12, y + size * 0.07);
  ctx.moveTo(x + paddleWidth/2 + size * 0.03, y);
  ctx.lineTo(x + paddleWidth/2 + size * 0.18, y);
  ctx.moveTo(x + paddleWidth/2 + size * 0.18, y);
  ctx.lineTo(x + paddleWidth/2 + size * 0.12, y - size * 0.07);
  ctx.moveTo(x + paddleWidth/2 + size * 0.18, y);
  ctx.lineTo(x + paddleWidth/2 + size * 0.12, y + size * 0.07);
  ctx.stroke();
};

const drawShrinkIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.shrink;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  const paddleWidth = size * 0.18;
  const paddleHeight = size * 0.09;
  const grad = ctx.createLinearGradient(x, y - paddleHeight/2, x, y + paddleHeight/2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.5, 'rgba(200, 215, 230, 1)');
  grad.addColorStop(1, 'rgba(140, 155, 175, 1)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x - paddleWidth/2, y - paddleHeight/2, paddleWidth, paddleHeight, paddleHeight/2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(220, 230, 240, 1)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y);
  ctx.lineTo(x - paddleWidth/2 - size * 0.03, y);
  ctx.moveTo(x - paddleWidth/2 - size * 0.03, y);
  ctx.lineTo(x - paddleWidth/2 - size * 0.09, y - size * 0.06);
  ctx.moveTo(x - paddleWidth/2 - size * 0.03, y);
  ctx.lineTo(x - paddleWidth/2 - size * 0.09, y + size * 0.06);
  ctx.moveTo(x + size * 0.28, y);
  ctx.lineTo(x + paddleWidth/2 + size * 0.03, y);
  ctx.moveTo(x + paddleWidth/2 + size * 0.03, y);
  ctx.lineTo(x + paddleWidth/2 + size * 0.09, y - size * 0.06);
  ctx.moveTo(x + paddleWidth/2 + size * 0.03, y);
  ctx.lineTo(x + paddleWidth/2 + size * 0.09, y + size * 0.06);
  ctx.stroke();
};

const drawMagnetIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.magnet;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  const s = size * 0.38;
  ctx.save();
  ctx.translate(x, y + s * 0.08);
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
  // Silver/red-blue magnet
  const grad = ctx.createLinearGradient(-s * 0.55, 0, s * 0.55, 0);
  grad.addColorStop(0, '#e53935');
  grad.addColorStop(0.48, '#e53935');
  grad.addColorStop(0.52, '#1e88e5');
  grad.addColorStop(1, '#1e88e5');
  ctx.fillStyle = grad;
  ctx.fill();
  // Silver poles
  ctx.fillStyle = '#e0e8f0';
  ctx.fillRect(-s * 0.55, s * 0.35, s * 0.27, s * 0.22);
  ctx.fillRect(s * 0.28, s * 0.35, s * 0.27, s * 0.22);
  ctx.fillStyle = '#111';
  ctx.font = `bold ${s * 0.22}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', -s * 0.415, s * 0.46);
  ctx.fillText('S', s * 0.415, s * 0.46);
  ctx.restore();
};

const drawAutoPaddleIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.autopaddle;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  // Silver "A" icon
  ctx.fillStyle = 'rgba(230, 240, 250, 1)';
  ctx.font = `bold ${size * 0.28}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', x, y);
};

const drawShockIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.shock;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  // Silver lightning bolt
  ctx.fillStyle = 'rgba(230, 240, 250, 1)';
  ctx.beginPath();
  const s = size * 0.2;
  ctx.moveTo(x + s * 0.15, y - s * 1.1);
  ctx.lineTo(x - s * 0.4, y - s * 0.1);
  ctx.lineTo(x + s * 0.1, y - s * 0.1);
  ctx.lineTo(x - s * 0.15, y + s * 1.1);
  ctx.lineTo(x + s * 0.4, y + s * 0.1);
  ctx.lineTo(x - s * 0.1, y + s * 0.1);
  ctx.closePath();
  ctx.fill();
};

const drawLaserIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.laser;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  const paddleWidth = size * 0.4;
  const paddleHeight = size * 0.1;
  // Silver paddle
  const grad = ctx.createLinearGradient(x, y + size * 0.1, x, y + size * 0.1 + paddleHeight);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(1, 'rgba(140, 155, 175, 1)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x - paddleWidth/2, y + size * 0.1, paddleWidth, paddleHeight, paddleHeight/2);
  ctx.fill();
  // Red laser beams
  ctx.fillStyle = 'hsl(0, 90%, 60%)';
  ctx.fillRect(x - paddleWidth * 0.35, y - size * 0.2, size * 0.04, size * 0.28);
  ctx.fillRect(x + paddleWidth * 0.35 - size * 0.04, y - size * 0.2, size * 0.04, size * 0.28);
  ctx.beginPath();
  ctx.moveTo(x - paddleWidth * 0.35, y - size * 0.2);
  ctx.lineTo(x - paddleWidth * 0.35 + size * 0.02, y - size * 0.28);
  ctx.lineTo(x - paddleWidth * 0.35 + size * 0.04, y - size * 0.2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + paddleWidth * 0.35 - size * 0.04, y - size * 0.2);
  ctx.lineTo(x + paddleWidth * 0.35 - size * 0.02, y - size * 0.28);
  ctx.lineTo(x + paddleWidth * 0.35, y - size * 0.2);
  ctx.fill();
};

const drawShieldIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.shield;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  // Silver shield
  const grad = ctx.createRadialGradient(x - size * 0.05, y - size * 0.15, 0, x, y, size * 0.25);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.5, 'rgba(200, 215, 230, 1)');
  grad.addColorStop(1, 'rgba(130, 150, 175, 1)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25);
  ctx.lineTo(x - size * 0.18, y - size * 0.12);
  ctx.lineTo(x - size * 0.18, y + size * 0.05);
  ctx.quadraticCurveTo(x - size * 0.15, y + size * 0.2, x, y + size * 0.25);
  ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.2, x + size * 0.18, y + size * 0.05);
  ctx.lineTo(x + size * 0.18, y - size * 0.12);
  ctx.closePath();
  ctx.fill();
};

const drawExtraLifeIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.extralife;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  const heartSize = size * 0.30;
  const heartGrad = ctx.createRadialGradient(x - heartSize * 0.2, y - heartSize * 0.3, 0, x, y, heartSize);
  heartGrad.addColorStop(0, 'hsl(350, 100%, 75%)');
  heartGrad.addColorStop(0.5, 'hsl(350, 90%, 55%)');
  heartGrad.addColorStop(1, 'hsl(340, 80%, 40%)');
  ctx.fillStyle = heartGrad;
  ctx.beginPath();
  ctx.moveTo(x, y + heartSize * 0.5);
  ctx.bezierCurveTo(x - heartSize * 1.2, y - heartSize * 0.2, x - heartSize * 0.6, y - heartSize * 0.9, x, y - heartSize * 0.3);
  ctx.bezierCurveTo(x + heartSize * 0.6, y - heartSize * 0.9, x + heartSize * 1.2, y - heartSize * 0.2, x, y + heartSize * 0.5);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(x - heartSize * 0.25, y - heartSize * 0.2, heartSize * 0.2, 0, Math.PI * 2);
  ctx.fill();
};

const drawGhostIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const c = POWERUP_COLOR_CONFIG.ghost;
  drawGlossyBackground(ctx, x, y, size, c.inner, c.outer, c.border);
  const gs = size * 0.28;
  ctx.fillStyle = 'rgba(240, 245, 250, 0.95)';
  ctx.beginPath();
  ctx.moveTo(x - gs, y + gs * 0.6);
  ctx.lineTo(x - gs, y - gs * 0.3);
  ctx.quadraticCurveTo(x - gs, y - gs, x, y - gs);
  ctx.quadraticCurveTo(x + gs, y - gs, x + gs, y - gs * 0.3);
  ctx.lineTo(x + gs, y + gs * 0.6);
  ctx.lineTo(x + gs * 0.6, y + gs * 0.3);
  ctx.lineTo(x + gs * 0.3, y + gs * 0.6);
  ctx.lineTo(x, y + gs * 0.3);
  ctx.lineTo(x - gs * 0.3, y + gs * 0.6);
  ctx.lineTo(x - gs * 0.6, y + gs * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'hsl(220, 30%, 15%)';
  ctx.beginPath();
  ctx.ellipse(x - gs * 0.3, y - gs * 0.2, gs * 0.15, gs * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + gs * 0.3, y - gs * 0.2, gs * 0.15, gs * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y + gs * 0.05, gs * 0.2, gs * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
};

// ============ MAIN RENDERER ============

export const drawPowerUp = (
  ctx: CanvasRenderingContext2D,
  powerUp: PowerUp,
  gameTime: number
): void => {
  const { x, y, width, height, type } = powerUp;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const iconSize = Math.min(width, height) * 1.3;

  ctx.save();
  const pulse = 1 + Math.sin(gameTime * 5) * 0.08;
  const { glowColor } = getPowerUpColors(type);
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 15 * pulse;
  ctx.shadowBlur = 0;
  drawPowerUpIcon(ctx, type, centerX, centerY, iconSize);
  ctx.restore();
};

const drawPowerUpIcon = (
  ctx: CanvasRenderingContext2D,
  type: PowerUpType,
  x: number,
  y: number,
  size: number
): void => {
  switch (type) {
    case 'fireball': drawFireballIcon(ctx, x, y, size); break;
    case 'multiball': drawMultiballIcon(ctx, x, y, size); break;
    case 'sevenball': drawSevenballIcon(ctx, x, y, size); break;
    case 'bigball': drawBigballIcon(ctx, x, y, size); break;
    case 'slow': drawSlowIcon(ctx, x, y, size); break;
    case 'widen': drawWidenIcon(ctx, x, y, size); break;
    case 'shrink': drawShrinkIcon(ctx, x, y, size); break;
    case 'extralife': drawExtraLifeIcon(ctx, x, y, size); break;
    case 'laser': drawLaserIcon(ctx, x, y, size); break;
    case 'magnet': drawMagnetIcon(ctx, x, y, size); break;
    case 'shield': drawShieldIcon(ctx, x, y, size); break;
    case 'speedup': drawSpeedupIcon(ctx, x, y, size); break;
    case 'autopaddle': drawAutoPaddleIcon(ctx, x, y, size); break;
    case 'shock': drawShockIcon(ctx, x, y, size); break;
    case 'ghost': drawGhostIcon(ctx, x, y, size); break;
  }
};

const getPowerUpColors = (type: PowerUpType): { bgColor: string; glowColor: string; isNegative: boolean } => {
  const configs: Record<PowerUpType, { bgColor: string; glowColor: string; isNegative: boolean }> = {
    fireball: { bgColor: 'hsl(20, 100%, 50%)', glowColor: 'hsla(20, 100%, 60%, 0.7)', isNegative: false },
    multiball: { bgColor: 'hsl(45, 100%, 50%)', glowColor: 'hsla(45, 100%, 60%, 0.7)', isNegative: false },
    sevenball: { bgColor: 'hsl(280, 80%, 50%)', glowColor: 'hsla(280, 80%, 60%, 0.7)', isNegative: false },
    bigball: { bgColor: 'hsl(210, 80%, 45%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    slow: { bgColor: 'hsl(160, 80%, 40%)', glowColor: 'hsla(160, 100%, 50%, 0.7)', isNegative: false },
    widen: { bgColor: 'hsl(120, 70%, 40%)', glowColor: 'hsla(100, 100%, 50%, 0.7)', isNegative: false },
    shrink: { bgColor: 'hsl(0, 80%, 45%)', glowColor: 'hsla(0, 100%, 55%, 0.7)', isNegative: true },
    extralife: { bgColor: 'hsl(340, 80%, 45%)', glowColor: 'hsla(350, 100%, 60%, 0.7)', isNegative: false },
    laser: { bgColor: 'hsl(0, 90%, 45%)', glowColor: 'hsla(15, 100%, 55%, 0.7)', isNegative: false },
    magnet: { bgColor: 'hsl(210, 80%, 45%)', glowColor: 'hsla(190, 100%, 60%, 0.7)', isNegative: false },
    shield: { bgColor: 'hsl(200, 80%, 45%)', glowColor: 'hsla(195, 100%, 60%, 0.7)', isNegative: false },
    speedup: { bgColor: 'hsl(280, 80%, 45%)', glowColor: 'hsla(290, 90%, 60%, 0.7)', isNegative: true },
    autopaddle: { bgColor: 'hsl(180, 70%, 40%)', glowColor: 'hsla(170, 100%, 50%, 0.7)', isNegative: false },
    shock: { bgColor: 'hsl(50, 100%, 45%)', glowColor: 'hsla(55, 100%, 60%, 0.7)', isNegative: false },
    ghost: { bgColor: 'hsl(270, 50%, 40%)', glowColor: 'hsla(280, 60%, 60%, 0.7)', isNegative: true },
  };
  return configs[type];
};

export const POWERUP_DIMENSIONS = { width: POWERUP_WIDTH, height: POWERUP_HEIGHT };

