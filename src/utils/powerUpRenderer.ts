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
  
  // Main ball (hot core - white/yellow)
  const ballGrad = ctx.createRadialGradient(x - size * 0.05, y - size * 0.05, 0, x, y, size * 0.12);
  ballGrad.addColorStop(0, 'white');
  ballGrad.addColorStop(0.5, 'hsl(45, 100%, 70%)');
  ballGrad.addColorStop(1, 'hsl(30, 100%, 55%)');
  
  ctx.fillStyle = ballGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
};

// Draw multi-ball icon (2 white balls in blue circle)
const drawMultiballIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  const ballRadius = size * 0.12;
  const spacing = size * 0.15;
  
  [x - spacing, x + spacing].forEach(bx => {
    const ballGrad = ctx.createRadialGradient(bx - ballRadius * 0.3, y - ballRadius * 0.3, 0, bx, y, ballRadius);
    ballGrad.addColorStop(0, 'white');
    ballGrad.addColorStop(0.5, 'hsl(0, 0%, 90%)');
    ballGrad.addColorStop(1, 'hsl(0, 0%, 75%)');
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(bx, y, ballRadius, 0, Math.PI * 2);
    ctx.fill();
  });
};

// Draw 7-ball icon (3 white balls in triangle pattern inside blue circle)
const drawSevenballIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  const ballRadius = size * 0.09;
  const positions = [
    { dx: 0, dy: -0.12 },
    { dx: -0.13, dy: 0.1 },
    { dx: 0.13, dy: 0.1 },
  ];
  
  positions.forEach(pos => {
    const bx = x + pos.dx * size;
    const by = y + pos.dy * size;
    const ballGrad = ctx.createRadialGradient(bx - ballRadius * 0.3, by - ballRadius * 0.3, 0, bx, by, ballRadius);
    ballGrad.addColorStop(0, 'white');
    ballGrad.addColorStop(0.5, 'hsl(0, 0%, 90%)');
    ballGrad.addColorStop(1, 'hsl(0, 0%, 75%)');
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(bx, by, ballRadius, 0, Math.PI * 2);
    ctx.fill();
  });
};

// Draw big ball icon (large steel ball in blue circle)
const drawBigballIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  const ballRadius = size * 0.25;
  
  // Main steel ball
  const ballGrad = ctx.createRadialGradient(x - ballRadius * 0.3, y - ballRadius * 0.3, 0, x, y, ballRadius);
  ballGrad.addColorStop(0, 'hsl(210, 15%, 95%)');
  ballGrad.addColorStop(0.2, 'hsl(210, 10%, 80%)');
  ballGrad.addColorStop(0.5, 'hsl(215, 12%, 60%)');
  ballGrad.addColorStop(0.8, 'hsl(220, 15%, 45%)');
  ballGrad.addColorStop(1, 'hsl(225, 20%, 30%)');
  
  ctx.fillStyle = ballGrad;
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(x - ballRadius * 0.3, y - ballRadius * 0.3, ballRadius * 0.25, 0, Math.PI * 2);
  ctx.fill();
};

// Draw slow icon (arrow pointing DOWN in blue circle)
const drawSlowIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  // White arrow pointing DOWN
  ctx.fillStyle = 'white';
  ctx.beginPath();
  const s = size * 0.15;
  ctx.moveTo(x, y + s * 1.2);              // Bottom point
  ctx.lineTo(x + s * 0.9, y - s * 0.1);    // Top right of head
  ctx.lineTo(x + s * 0.35, y - s * 0.1);   // Inner right
  ctx.lineTo(x + s * 0.35, y - s * 1.0);   // Top right of stem
  ctx.lineTo(x - s * 0.35, y - s * 1.0);   // Top left of stem
  ctx.lineTo(x - s * 0.35, y - s * 0.1);   // Inner left
  ctx.lineTo(x - s * 0.9, y - s * 0.1);    // Top left of head
  ctx.closePath();
  ctx.fill();
};

// Draw speed up icon (arrow pointing UP in blue circle)
const drawSpeedupIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  // White arrow pointing UP
  ctx.fillStyle = 'white';
  ctx.beginPath();
  const s = size * 0.15;
  ctx.moveTo(x, y - s * 1.2);              // Top point
  ctx.lineTo(x + s * 0.9, y + s * 0.1);    // Bottom right of head
  ctx.lineTo(x + s * 0.35, y + s * 0.1);   // Inner right
  ctx.lineTo(x + s * 0.35, y + s * 1.0);   // Bottom right of stem
  ctx.lineTo(x - s * 0.35, y + s * 1.0);   // Bottom left of stem
  ctx.lineTo(x - s * 0.35, y + s * 0.1);   // Inner left
  ctx.lineTo(x - s * 0.9, y + s * 0.1);    // Bottom left of head
  ctx.closePath();
  ctx.fill();
};

// Draw widen paddle icon (BIG paddle with outward arrows in blue circle)
const drawWidenIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  const paddleWidth = size * 0.50;
  const paddleHeight = size * 0.14;
  
  // Big white paddle
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.roundRect(x - paddleWidth/2, y - paddleHeight/2, paddleWidth, paddleHeight, paddleHeight/2);
  ctx.fill();
  
  // Outward arrows
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  
  // Left arrow
  ctx.beginPath();
  ctx.moveTo(x - paddleWidth/2 - size * 0.03, y);
  ctx.lineTo(x - paddleWidth/2 - size * 0.18, y);
  ctx.moveTo(x - paddleWidth/2 - size * 0.18, y);
  ctx.lineTo(x - paddleWidth/2 - size * 0.12, y - size * 0.07);
  ctx.moveTo(x - paddleWidth/2 - size * 0.18, y);
  ctx.lineTo(x - paddleWidth/2 - size * 0.12, y + size * 0.07);
  ctx.stroke();
  
  // Right arrow
  ctx.beginPath();
  ctx.moveTo(x + paddleWidth/2 + size * 0.03, y);
  ctx.lineTo(x + paddleWidth/2 + size * 0.18, y);
  ctx.moveTo(x + paddleWidth/2 + size * 0.18, y);
  ctx.lineTo(x + paddleWidth/2 + size * 0.12, y - size * 0.07);
  ctx.moveTo(x + paddleWidth/2 + size * 0.18, y);
  ctx.lineTo(x + paddleWidth/2 + size * 0.12, y + size * 0.07);
  ctx.stroke();
};

// Draw shrink paddle icon (SMALL paddle with inward arrows in blue circle)
const drawShrinkIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  const paddleWidth = size * 0.18;
  const paddleHeight = size * 0.09;
  
  // Small white paddle
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.roundRect(x - paddleWidth/2, y - paddleHeight/2, paddleWidth, paddleHeight, paddleHeight/2);
  ctx.fill();
  
  // Inward arrows
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  
  // Left arrow (pointing right/inward)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y);
  ctx.lineTo(x - paddleWidth/2 - size * 0.03, y);
  ctx.moveTo(x - paddleWidth/2 - size * 0.03, y);
  ctx.lineTo(x - paddleWidth/2 - size * 0.09, y - size * 0.06);
  ctx.moveTo(x - paddleWidth/2 - size * 0.03, y);
  ctx.lineTo(x - paddleWidth/2 - size * 0.09, y + size * 0.06);
  ctx.stroke();
  
  // Right arrow (pointing left/inward)
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y);
  ctx.lineTo(x + paddleWidth/2 + size * 0.03, y);
  ctx.moveTo(x + paddleWidth/2 + size * 0.03, y);
  ctx.lineTo(x + paddleWidth/2 + size * 0.09, y - size * 0.06);
  ctx.moveTo(x + paddleWidth/2 + size * 0.03, y);
  ctx.lineTo(x + paddleWidth/2 + size * 0.09, y + size * 0.06);
  ctx.stroke();
};

// Draw magnet icon (LARGE horseshoe magnet inside blue circle - like reference)
const drawMagnetIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  // Horseshoe magnet - MUCH BIGGER to fill the circle
  const magnetSize = size * 0.40;
  
  ctx.save();
  ctx.translate(x, y + magnetSize * 0.05);
  
  const armWidth = magnetSize * 0.5;
  const innerRadius = magnetSize * 0.4;
  const outerRadius = innerRadius + armWidth;
  const armHeight = magnetSize * 0.6;
  
  // Draw the horseshoe (U shape)
  ctx.beginPath();
  ctx.moveTo(-outerRadius, -armHeight);
  ctx.lineTo(-outerRadius, magnetSize * 0.1);
  ctx.arc(0, magnetSize * 0.1, outerRadius, Math.PI, 0, false);
  ctx.lineTo(outerRadius, -armHeight);
  ctx.lineTo(innerRadius, -armHeight);
  ctx.lineTo(innerRadius, magnetSize * 0.1);
  ctx.arc(0, magnetSize * 0.1, innerRadius, 0, Math.PI, true);
  ctx.lineTo(-innerRadius, -armHeight);
  ctx.closePath();
  
  // Classic red/blue magnet
  const magnetGrad = ctx.createLinearGradient(-outerRadius, 0, outerRadius, 0);
  magnetGrad.addColorStop(0, 'hsl(0, 85%, 55%)');
  magnetGrad.addColorStop(0.45, 'hsl(0, 85%, 50%)');
  magnetGrad.addColorStop(0.55, 'hsl(210, 85%, 50%)');
  magnetGrad.addColorStop(1, 'hsl(210, 100%, 55%)');
  ctx.fillStyle = magnetGrad;
  ctx.fill();
  
  // Pole tips (white/silver caps)
  ctx.fillStyle = 'hsl(0, 0%, 85%)';
  ctx.fillRect(-outerRadius, -armHeight - 4, armWidth, 7);
  ctx.fillRect(innerRadius, -armHeight - 4, armWidth, 7);
  
  // Lightning sparks
  ctx.fillStyle = 'hsl(50, 100%, 55%)';
  ctx.font = `bold ${magnetSize * 0.5}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡', outerRadius + 2, -armHeight + 2);
  ctx.fillText('⚡', -outerRadius - 2, -armHeight + 2);
  
  ctx.restore();
};

// Draw auto paddle icon ("AUTO" text in blue circle)
const drawAutoPaddleIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  // Yellow "AUTO" text
  ctx.fillStyle = 'hsl(50, 100%, 55%)';
  ctx.font = `bold ${size * 0.2}px Orbitron, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'hsl(50, 100%, 40%)';
  ctx.shadowBlur = 3;
  ctx.fillText('AUTO', x, y);
  ctx.shadowBlur = 0;
};

// Draw shock/lightning icon (white bolt in blue circle)
const drawShockIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  // White lightning bolt
  ctx.fillStyle = 'white';
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

// Draw laser icon (paddle with laser beams in blue circle)
const drawLaserIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  const paddleWidth = size * 0.4;
  const paddleHeight = size * 0.1;
  
  // White paddle
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.roundRect(x - paddleWidth/2, y + size * 0.1, paddleWidth, paddleHeight, paddleHeight/2);
  ctx.fill();
  
  // Red laser beams
  ctx.fillStyle = 'hsl(0, 85%, 55%)';
  ctx.fillRect(x - paddleWidth * 0.35, y - size * 0.2, size * 0.04, size * 0.28);
  ctx.fillRect(x + paddleWidth * 0.35 - size * 0.04, y - size * 0.2, size * 0.04, size * 0.28);
  
  // Laser tips
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

// Draw shield icon (barrier in blue circle)
const drawShieldIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  // Shield shape
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25);
  ctx.lineTo(x - size * 0.18, y - size * 0.12);
  ctx.lineTo(x - size * 0.18, y + size * 0.05);
  ctx.quadraticCurveTo(x - size * 0.15, y + size * 0.2, x, y + size * 0.25);
  ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.2, x + size * 0.18, y + size * 0.05);
  ctx.lineTo(x + size * 0.18, y - size * 0.12);
  ctx.closePath();
  ctx.fill();
  
  // Inner shield detail
  ctx.strokeStyle = 'hsl(200, 80%, 50%)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.15);
  ctx.lineTo(x - size * 0.1, y - size * 0.05);
  ctx.lineTo(x - size * 0.1, y + size * 0.05);
  ctx.quadraticCurveTo(x - size * 0.08, y + size * 0.12, x, y + size * 0.15);
  ctx.quadraticCurveTo(x + size * 0.08, y + size * 0.12, x + size * 0.1, y + size * 0.05);
  ctx.lineTo(x + size * 0.1, y - size * 0.05);
  ctx.closePath();
  ctx.stroke();
};

// Draw extra life icon (large heart in blue circle)
const drawExtraLifeIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  const heartSize = size * 0.30;
  
  // Red heart - BIGGER
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
  
  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(x - heartSize * 0.25, y - heartSize * 0.2, heartSize * 0.2, 0, Math.PI * 2);
  ctx.fill();
};

// Draw ghost icon (white ghost in blue circle)
const drawGhostIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  drawBlueCircleBackground(ctx, x, y, size);
  
  const gs = size * 0.28;
  
  // Ghost body (white)
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(x - gs, y + gs * 0.6);
  ctx.lineTo(x - gs, y - gs * 0.3);
  ctx.quadraticCurveTo(x - gs, y - gs, x, y - gs);
  ctx.quadraticCurveTo(x + gs, y - gs, x + gs, y - gs * 0.3);
  ctx.lineTo(x + gs, y + gs * 0.6);
  // Wavy bottom
  ctx.lineTo(x + gs * 0.6, y + gs * 0.3);
  ctx.lineTo(x + gs * 0.3, y + gs * 0.6);
  ctx.lineTo(x, y + gs * 0.3);
  ctx.lineTo(x - gs * 0.3, y + gs * 0.6);
  ctx.lineTo(x - gs * 0.6, y + gs * 0.3);
  ctx.closePath();
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = 'hsl(220, 30%, 15%)';
  ctx.beginPath();
  ctx.ellipse(x - gs * 0.3, y - gs * 0.2, gs * 0.15, gs * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + gs * 0.3, y - gs * 0.2, gs * 0.15, gs * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Mouth
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
  
  // Animated pulse
  const pulse = 1 + Math.sin(gameTime * 5) * 0.08;
  
  // Get glow color
  const { glowColor } = getPowerUpColors(type);
  
  // Subtle glow
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 15 * pulse;
  
  ctx.shadowBlur = 0;
  
  // Draw the icon
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
    case 'fireball':
      drawFireballIcon(ctx, x, y, size);
      break;
    case 'multiball':
      drawMultiballIcon(ctx, x, y, size);
      break;
    case 'sevenball':
      drawSevenballIcon(ctx, x, y, size);
      break;
    case 'bigball':
      drawBigballIcon(ctx, x, y, size);
      break;
    case 'slow':
      drawSlowIcon(ctx, x, y, size);
      break;
    case 'widen':
      drawWidenIcon(ctx, x, y, size);
      break;
    case 'shrink':
      drawShrinkIcon(ctx, x, y, size);
      break;
    case 'extralife':
      drawExtraLifeIcon(ctx, x, y, size);
      break;
    case 'laser':
      drawLaserIcon(ctx, x, y, size);
      break;
    case 'magnet':
      drawMagnetIcon(ctx, x, y, size);
      break;
    case 'shield':
      drawShieldIcon(ctx, x, y, size);
      break;
    case 'speedup':
      drawSpeedupIcon(ctx, x, y, size);
      break;
    case 'autopaddle':
      drawAutoPaddleIcon(ctx, x, y, size);
      break;
    case 'shock':
      drawShockIcon(ctx, x, y, size);
      break;
    case 'ghost':
      drawGhostIcon(ctx, x, y, size);
      break;
  }
};

const getPowerUpColors = (type: PowerUpType): { bgColor: string; glowColor: string; isNegative: boolean } => {
  const configs: Record<PowerUpType, { bgColor: string; glowColor: string; isNegative: boolean }> = {
    fireball: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    multiball: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    sevenball: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    bigball: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    slow: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    widen: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    shrink: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: true },
    extralife: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    laser: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    magnet: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    shield: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    speedup: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: true },
    autopaddle: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    shock: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: false },
    ghost: { bgColor: 'hsl(200, 85%, 50%)', glowColor: 'hsla(200, 100%, 60%, 0.7)', isNegative: true },
  };
  return configs[type];
};

// Export power-up dimensions for game utils
export const POWERUP_DIMENSIONS = { width: POWERUP_WIDTH, height: POWERUP_HEIGHT };
