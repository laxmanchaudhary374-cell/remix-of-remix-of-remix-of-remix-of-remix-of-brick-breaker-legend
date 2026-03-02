// Premium 3D Textured Brick Renderer
// Creates realistic material-based bricks like copper, ice, metal, wood, diamond

import { Brick, BrickColor, BrickType } from '@/types/game';

// Material types that match the reference image
type MaterialType = 'copper' | 'ice' | 'metal' | 'wood' | 'glass' | 'diamond';

// Map brick colors to material types for varied look
const getMaterialType = (color: BrickColor, type: BrickType): MaterialType => {
  if (type === 'indestructible') return 'metal';
  
  const materialMap: Record<BrickColor, MaterialType> = {
    orange: 'copper',
    cyan: 'ice',
    purple: 'metal',
    yellow: 'wood',
    green: 'glass',
    magenta: 'diamond',
    red: 'copper',
    gold: 'wood', // Gold bricks use wood material as base, then get gold overlay from coin indicator
  };
  return materialMap[color] || 'glass';
};

// Get material colors for rendering
const getMaterialColors = (material: MaterialType) => {
  const materials = {
    copper: {
      base: 'hsl(20, 65%, 45%)',
      light: 'hsl(25, 70%, 60%)',
      dark: 'hsl(15, 60%, 30%)',
      accent: 'hsl(160, 50%, 45%)', // Patina
      highlight: 'hsl(30, 80%, 75%)',
      shadow: 'hsl(10, 55%, 20%)',
    },
    ice: {
      base: 'hsl(195, 40%, 70%)',
      light: 'hsl(195, 50%, 85%)',
      dark: 'hsl(200, 50%, 50%)',
      accent: 'hsl(200, 30%, 60%)',
      highlight: 'hsl(195, 60%, 95%)',
      shadow: 'hsl(205, 45%, 40%)',
    },
    metal: {
      base: 'hsl(220, 5%, 35%)',
      light: 'hsl(220, 5%, 50%)',
      dark: 'hsl(220, 8%, 22%)',
      accent: 'hsl(220, 3%, 40%)',
      highlight: 'hsl(220, 5%, 65%)',
      shadow: 'hsl(220, 10%, 15%)',
    },
    wood: {
      base: 'hsl(25, 55%, 40%)',
      light: 'hsl(30, 50%, 55%)',
      dark: 'hsl(20, 60%, 28%)',
      accent: 'hsl(22, 45%, 35%)',
      highlight: 'hsl(35, 45%, 65%)',
      shadow: 'hsl(18, 55%, 18%)',
    },
    glass: {
      base: 'hsl(200, 80%, 50%)',
      light: 'hsl(195, 90%, 70%)',
      dark: 'hsl(210, 85%, 35%)',
      accent: 'hsl(205, 75%, 45%)',
      highlight: 'hsl(190, 95%, 85%)',
      shadow: 'hsl(215, 80%, 25%)',
    },
    diamond: {
      base: 'hsl(200, 20%, 80%)',
      light: 'hsl(200, 30%, 95%)',
      dark: 'hsl(210, 25%, 60%)',
      accent: 'hsl(195, 35%, 85%)',
      highlight: 'hsl(0, 0%, 100%)',
      shadow: 'hsl(215, 20%, 50%)',
    },
  };
  return materials[material];
};

// Draw copper brick with oxidation patches
const drawCopperBrick = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, colors: ReturnType<typeof getMaterialColors>) => {
  const borderRadius = 4;
  const borderWidth = 3;
  
  // Dark border/frame
  ctx.fillStyle = colors.shadow;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, borderRadius);
  ctx.fill();
  
  // Main copper surface
  const mainGrad = ctx.createLinearGradient(x, y, x, y + h);
  mainGrad.addColorStop(0, colors.light);
  mainGrad.addColorStop(0.3, colors.base);
  mainGrad.addColorStop(0.7, colors.base);
  mainGrad.addColorStop(1, colors.dark);
  
  ctx.fillStyle = mainGrad;
  ctx.beginPath();
  ctx.roundRect(x + borderWidth, y + borderWidth, w - borderWidth * 2, h - borderWidth * 2, borderRadius - 1);
  ctx.fill();
  
  // Oxidation/patina patches
  ctx.fillStyle = colors.accent;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(x + w * 0.3, y + h * 0.4, w * 0.15, h * 0.2, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + w * 0.7, y + h * 0.6, w * 0.12, h * 0.15, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Top highlight
  ctx.fillStyle = colors.highlight;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.roundRect(x + borderWidth + 2, y + borderWidth + 2, w - borderWidth * 2 - 4, h * 0.25, 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

// Draw ice brick with cracks
const drawIceBrick = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, colors: ReturnType<typeof getMaterialColors>) => {
  const borderRadius = 4;
  const borderWidth = 3;
  
  // Teal border
  ctx.fillStyle = colors.dark;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, borderRadius);
  ctx.fill();
  
  // Ice surface with gradient
  const iceGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  iceGrad.addColorStop(0, colors.light);
  iceGrad.addColorStop(0.3, colors.base);
  iceGrad.addColorStop(0.6, colors.accent);
  iceGrad.addColorStop(1, colors.light);
  
  ctx.fillStyle = iceGrad;
  ctx.beginPath();
  ctx.roundRect(x + borderWidth, y + borderWidth, w - borderWidth * 2, h - borderWidth * 2, borderRadius - 1);
  ctx.fill();
  
  // Crack lines
  ctx.strokeStyle = colors.highlight;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.2, y + h * 0.3);
  ctx.lineTo(x + w * 0.4, y + h * 0.5);
  ctx.lineTo(x + w * 0.35, y + h * 0.7);
  ctx.moveTo(x + w * 0.4, y + h * 0.5);
  ctx.lineTo(x + w * 0.6, y + h * 0.45);
  ctx.moveTo(x + w * 0.6, y + h * 0.2);
  ctx.lineTo(x + w * 0.75, y + h * 0.5);
  ctx.lineTo(x + w * 0.7, y + h * 0.8);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // Highlight
  ctx.fillStyle = colors.highlight;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(x + w * 0.25, y + h * 0.3, w * 0.12, h * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

// Draw steel brick (for indestructible bricks) with rivets and industrial look - more rounded
const drawSteelBrick = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  const borderRadius = 8;
  
  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 2, w, h, borderRadius);
  ctx.fill();
  
  // Main steel body with brushed metal gradient
  const steelGrad = ctx.createLinearGradient(x, y, x, y + h);
  steelGrad.addColorStop(0, 'hsl(220, 10%, 55%)');
  steelGrad.addColorStop(0.15, 'hsl(220, 8%, 45%)');
  steelGrad.addColorStop(0.5, 'hsl(220, 6%, 35%)');
  steelGrad.addColorStop(0.85, 'hsl(220, 8%, 40%)');
  steelGrad.addColorStop(1, 'hsl(220, 5%, 25%)');
  
  ctx.fillStyle = steelGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, borderRadius);
  ctx.fill();
  
  // Horizontal brushed lines texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 6; i++) {
    const lineY = y + 3 + (h - 6) * (i / 5);
    ctx.beginPath();
    ctx.moveTo(x + 3, lineY);
    ctx.lineTo(x + w - 3, lineY);
    ctx.stroke();
  }
  
  // Industrial border frame - more rounded
  ctx.strokeStyle = 'hsl(220, 10%, 25%)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x + 1, y + 1, w - 2, h - 2, borderRadius - 1);
  ctx.stroke();
  
  // Rivet/bolts at corners
  const rivetRadius = 2.5;
  const rivetOffset = 7;
  const rivetPositions = [
    { rx: x + rivetOffset, ry: y + rivetOffset },
    { rx: x + w - rivetOffset, ry: y + rivetOffset },
    { rx: x + rivetOffset, ry: y + h - rivetOffset },
    { rx: x + w - rivetOffset, ry: y + h - rivetOffset },
  ];
  
  rivetPositions.forEach(({ rx, ry }) => {
    // Rivet shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(rx + 0.5, ry + 0.5, rivetRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Rivet body
    const rivetGrad = ctx.createRadialGradient(rx - 1, ry - 1, 0, rx, ry, rivetRadius);
    rivetGrad.addColorStop(0, 'hsl(220, 5%, 60%)');
    rivetGrad.addColorStop(0.5, 'hsl(220, 5%, 45%)');
    rivetGrad.addColorStop(1, 'hsl(220, 8%, 30%)');
    ctx.fillStyle = rivetGrad;
    ctx.beginPath();
    ctx.arc(rx, ry, rivetRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Rivet highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(rx - 0.5, ry - 0.5, rivetRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Top highlight edge
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + borderRadius, y + 1);
  ctx.lineTo(x + w - borderRadius, y + 1);
  ctx.stroke();
};

// Draw steel crack overlay when steel brick is damaged
const drawSteelCracks = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void => {
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  
  // Main crack from center
  ctx.beginPath();
  ctx.moveTo(centerX - 2, centerY - 1);
  ctx.lineTo(centerX - w * 0.35, centerY - h * 0.3);
  ctx.lineTo(centerX - w * 0.45, centerY - h * 0.15);
  ctx.stroke();
  
  // Branch crack
  ctx.beginPath();
  ctx.moveTo(centerX - w * 0.25, centerY - h * 0.2);
  ctx.lineTo(centerX - w * 0.15, centerY + h * 0.25);
  ctx.stroke();
  
  // Right side crack
  ctx.beginPath();
  ctx.moveTo(centerX + 3, centerY + 2);
  ctx.lineTo(centerX + w * 0.3, centerY + h * 0.35);
  ctx.lineTo(centerX + w * 0.4, centerY + h * 0.2);
  ctx.stroke();
  
  // Secondary crack
  ctx.beginPath();
  ctx.moveTo(centerX + w * 0.2, centerY + h * 0.15);
  ctx.lineTo(centerX + w * 0.35, centerY - h * 0.1);
  ctx.stroke();
  
  // White highlight along cracks (to show depth)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 1, centerY);
  ctx.lineTo(centerX - w * 0.33, centerY - h * 0.28);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(centerX + 4, centerY + 3);
  ctx.lineTo(centerX + w * 0.28, centerY + h * 0.33);
  ctx.stroke();
}

// Draw metal brick with matte texture (original)
const drawMetalBrick = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, colors: ReturnType<typeof getMaterialColors>) => {
  const borderRadius = 4;
  const borderWidth = 2;
  
  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 2, w, h, borderRadius);
  ctx.fill();
  
  // Main metal body
  const metalGrad = ctx.createLinearGradient(x, y, x, y + h);
  metalGrad.addColorStop(0, colors.light);
  metalGrad.addColorStop(0.3, colors.base);
  metalGrad.addColorStop(0.7, colors.dark);
  metalGrad.addColorStop(1, colors.shadow);
  
  ctx.fillStyle = metalGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, borderRadius);
  ctx.fill();
  
  // Subtle texture noise
  ctx.fillStyle = colors.accent;
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 8; i++) {
    const dotX = x + Math.random() * w;
    const dotY = y + Math.random() * h;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  
  // Highlight edge
  ctx.strokeStyle = colors.highlight;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(x + borderRadius, y + 1);
  ctx.lineTo(x + w - borderRadius, y + 1);
  ctx.stroke();
  ctx.globalAlpha = 1;
};

// Draw wood brick with grain
const drawWoodBrick = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, colors: ReturnType<typeof getMaterialColors>) => {
  const borderRadius = 3;
  const borderWidth = 3;
  
  // Dark frame
  ctx.fillStyle = colors.shadow;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, borderRadius);
  ctx.fill();
  
  // Wood surface
  const woodGrad = ctx.createLinearGradient(x, y, x, y + h);
  woodGrad.addColorStop(0, colors.light);
  woodGrad.addColorStop(0.5, colors.base);
  woodGrad.addColorStop(1, colors.dark);
  
  ctx.fillStyle = woodGrad;
  ctx.beginPath();
  ctx.roundRect(x + borderWidth, y + borderWidth, w - borderWidth * 2, h - borderWidth * 2, 1);
  ctx.fill();
  
  // Wood grain lines
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 3; i++) {
    const lineY = y + borderWidth + (h - borderWidth * 2) * (0.25 + i * 0.25);
    ctx.beginPath();
    ctx.moveTo(x + borderWidth + 2, lineY);
    ctx.lineTo(x + w - borderWidth - 2, lineY);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  
  // Top highlight
  ctx.fillStyle = colors.highlight;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.roundRect(x + borderWidth + 2, y + borderWidth + 1, w - borderWidth * 2 - 4, h * 0.2, 1);
  ctx.fill();
  ctx.globalAlpha = 1;
};

// Draw glass/gem brick
const drawGlassBrick = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, colors: ReturnType<typeof getMaterialColors>) => {
  const borderRadius = 4;
  const bevelSize = 4;
  
  // Drop shadow
  ctx.shadowColor = colors.shadow;
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  
  // Main body
  ctx.fillStyle = colors.base;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, borderRadius);
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Top bevel (light)
  const topGrad = ctx.createLinearGradient(x, y, x, y + bevelSize);
  topGrad.addColorStop(0, colors.highlight);
  topGrad.addColorStop(1, colors.light);
  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.moveTo(x + borderRadius, y);
  ctx.lineTo(x + w - borderRadius, y);
  ctx.lineTo(x + w - borderRadius - bevelSize, y + bevelSize);
  ctx.lineTo(x + borderRadius + bevelSize, y + bevelSize);
  ctx.closePath();
  ctx.fill();
  
  // Bottom bevel (dark)
  const bottomGrad = ctx.createLinearGradient(x, y + h - bevelSize, x, y + h);
  bottomGrad.addColorStop(0, colors.base);
  bottomGrad.addColorStop(1, colors.dark);
  ctx.fillStyle = bottomGrad;
  ctx.beginPath();
  ctx.moveTo(x + borderRadius + bevelSize, y + h - bevelSize);
  ctx.lineTo(x + w - borderRadius - bevelSize, y + h - bevelSize);
  ctx.lineTo(x + w - borderRadius, y + h);
  ctx.lineTo(x + borderRadius, y + h);
  ctx.closePath();
  ctx.fill();
  
  // Inner surface gradient
  const innerGrad = ctx.createLinearGradient(x, y + bevelSize, x, y + h - bevelSize);
  innerGrad.addColorStop(0, colors.light);
  innerGrad.addColorStop(0.4, colors.base);
  innerGrad.addColorStop(1, colors.dark);
  ctx.fillStyle = innerGrad;
  ctx.fillRect(x + bevelSize, y + bevelSize, w - bevelSize * 2, h - bevelSize * 2);
  
  // Glossy highlight
  const glossGrad = ctx.createRadialGradient(x + w * 0.25, y + h * 0.25, 0, x + w * 0.25, y + h * 0.25, w * 0.5);
  glossGrad.addColorStop(0, 'rgba(255,255,255,0.5)');
  glossGrad.addColorStop(0.5, 'rgba(255,255,255,0.15)');
  glossGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glossGrad;
  ctx.fillRect(x + bevelSize, y + bevelSize, w - bevelSize * 2, (h - bevelSize * 2) * 0.6);
  
  // Outer glow
  ctx.shadowColor = colors.light;
  ctx.shadowBlur = 8;
  ctx.strokeStyle = colors.highlight;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.roundRect(x + 1, y + 1, w - 2, h - 2, borderRadius - 1);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
};

// Draw diamond brick with facets
const drawDiamondBrick = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, colors: ReturnType<typeof getMaterialColors>) => {
  const borderRadius = 3;
  const borderWidth = 3;
  
  // Dark border
  ctx.fillStyle = colors.shadow;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, borderRadius);
  ctx.fill();
  
  // Main diamond surface
  const diamondGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  diamondGrad.addColorStop(0, colors.light);
  diamondGrad.addColorStop(0.25, colors.base);
  diamondGrad.addColorStop(0.5, colors.highlight);
  diamondGrad.addColorStop(0.75, colors.base);
  diamondGrad.addColorStop(1, colors.light);
  
  ctx.fillStyle = diamondGrad;
  ctx.beginPath();
  ctx.roundRect(x + borderWidth, y + borderWidth, w - borderWidth * 2, h - borderWidth * 2, 1);
  ctx.fill();
  
  // Facet lines (diamond cuts)
  ctx.strokeStyle = colors.dark;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  
  // Diagonal facets
  ctx.beginPath();
  ctx.moveTo(x + w * 0.2, y + borderWidth);
  ctx.lineTo(x + w * 0.4, y + h - borderWidth);
  ctx.moveTo(x + w * 0.5, y + borderWidth);
  ctx.lineTo(x + w * 0.3, y + h - borderWidth);
  ctx.moveTo(x + w * 0.6, y + borderWidth);
  ctx.lineTo(x + w * 0.8, y + h - borderWidth);
  ctx.moveTo(x + w * 0.8, y + borderWidth);
  ctx.lineTo(x + w * 0.6, y + h - borderWidth);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // Highlight sparkles
  ctx.fillStyle = colors.highlight;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(x + w * 0.25, y + h * 0.35, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w * 0.6, y + h * 0.25, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w * 0.75, y + h * 0.6, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

// ============ MAIN BRICK RENDERER ============

export const drawPremiumBrick = (
  ctx: CanvasRenderingContext2D,
  brick: Brick,
  gameTime: number = 0
): void => {
  const { x, y, width, height, color, type, hits, maxHits } = brick;
  
  // Ghost bricks: flicker visible/invisible every 1 second
  if (type === 'ghost') {
    const phase = Math.floor(gameTime) % 2; // 0 = visible, 1 = invisible
    if (phase === 1) {
      // During invisible phase, show semi-transparent flicker
      const transition = gameTime % 1; // 0 to 1 within each second
      if (transition > 0.8) {
        // Transitioning to visible - show fading in
        ctx.save();
        ctx.globalAlpha = (transition - 0.8) * 5; // 0 to 1
      } else if (transition < 0.2) {
        // Just became invisible - show fading out
        ctx.save();
        ctx.globalAlpha = 1 - transition * 5; // 1 to 0
      } else {
        // Fully invisible - don't draw
        return;
      }
    }
  }
  
  const material = getMaterialType(color, type);
  const colors = getMaterialColors(material);
  const damageRatio = hits / maxHits;
  
  ctx.save();
  
  // Ghost brick: apply semi-transparent look when visible
  if (type === 'ghost') {
    const transition = gameTime % 1;
    const phase = Math.floor(gameTime) % 2;
    if (phase === 1 && transition > 0.8) {
      ctx.globalAlpha = (transition - 0.8) * 5;
    } else if (phase === 1 && transition < 0.2) {
      ctx.globalAlpha = 1 - transition * 5;
    }
  }
  
  // Apply damage effect
  if (damageRatio < 1 && maxHits > 1) {
    ctx.globalAlpha = Math.min(ctx.globalAlpha, 0.6 + damageRatio * 0.4);
  }
  
  // Draw based on brick type and material
  if (type === 'coin') {
    // Full gold brick - special golden rendering
    const borderRadius = 4;
    const borderWidth = 3;
    
    // Gold border
    ctx.fillStyle = 'hsl(35, 80%, 30%)';
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, borderRadius);
    ctx.fill();
    
    // Main gold surface
    const goldGrad = ctx.createLinearGradient(x, y, x + width, y + height);
    goldGrad.addColorStop(0, 'hsl(45, 100%, 75%)');
    goldGrad.addColorStop(0.2, 'hsl(42, 90%, 60%)');
    goldGrad.addColorStop(0.5, 'hsl(48, 100%, 70%)');
    goldGrad.addColorStop(0.8, 'hsl(40, 85%, 55%)');
    goldGrad.addColorStop(1, 'hsl(45, 100%, 65%)');
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.roundRect(x + borderWidth, y + borderWidth, width - borderWidth * 2, height - borderWidth * 2, borderRadius - 1);
    ctx.fill();
    
    // Top highlight
    ctx.fillStyle = 'rgba(255, 255, 200, 0.5)';
    ctx.beginPath();
    ctx.roundRect(x + borderWidth + 2, y + borderWidth + 1, width - borderWidth * 2 - 4, height * 0.25, 2);
    ctx.fill();
    
    // Gold shimmer glow
    ctx.shadowColor = 'hsl(45, 100%, 60%)';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = 'hsla(45, 100%, 70%, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, width - 2, height - 2, borderRadius);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (type === 'indestructible' || type === 'steel') {
    // Use special steel brick for indestructible and steel types
    drawSteelBrick(ctx, x, y, width, height);
    
    // Draw cracks on steel bricks when damaged (hits < maxHits)
    if (type === 'steel' && hits < maxHits && maxHits === 2) {
      drawSteelCracks(ctx, x, y, width, height);
    }
  } else {
    // Draw based on material type
    switch (material) {
      case 'copper':
        drawCopperBrick(ctx, x, y, width, height, colors);
        break;
      case 'ice':
        drawIceBrick(ctx, x, y, width, height, colors);
        break;
      case 'metal':
        drawMetalBrick(ctx, x, y, width, height, colors);
        break;
      case 'wood':
        drawWoodBrick(ctx, x, y, width, height, colors);
        break;
      case 'diamond':
        drawDiamondBrick(ctx, x, y, width, height, colors);
        break;
      default:
        drawGlassBrick(ctx, x, y, width, height, colors);
    }
  }
  
  // Draw special type indicators
  drawBrickTypeIndicator(ctx, brick, gameTime);
  
  // Damage cracks overlay
  if (damageRatio < 0.7 && maxHits > 1 && type !== 'steel') {
    drawDamageCracks(ctx, brick, damageRatio);
  }
  
  ctx.restore();
};

// Draw special brick type indicators
const drawBrickTypeIndicator = (
  ctx: CanvasRenderingContext2D,
  brick: Brick,
  gameTime: number
): void => {
  const { x, y, width, height, type, hits, maxHits } = brick;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  switch (type) {
    case 'explosive':
      // Black bomb icon
      ctx.fillStyle = 'rgba(30, 30, 30, 0.95)';
      ctx.beginPath();
      ctx.arc(centerX, centerY + 2, 7, 0, Math.PI * 2);
      ctx.fill();
      // Bomb outline
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY + 2, 7, 0, Math.PI * 2);
      ctx.stroke();
      // Fuse
      ctx.strokeStyle = 'rgba(139, 90, 43, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 5);
      ctx.lineTo(centerX + 2, centerY - 9);
      ctx.stroke();
      // Spark/flame
      ctx.fillStyle = 'rgba(255, 200, 50, 0.95)';
      ctx.beginPath();
      ctx.arc(centerX + 2, centerY - 10, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 100, 50, 0.8)';
      ctx.beginPath();
      ctx.arc(centerX + 2, centerY - 10, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'indestructible':
    case 'steel':
      // Steel rivets only, no X mark
      break;
      
    case 'moving':
      // Arrows
      const arrowOffset = Math.sin(gameTime * 4) * 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX - 6 + arrowOffset, centerY);
      ctx.lineTo(centerX - 10 + arrowOffset, centerY);
      ctx.moveTo(centerX + 6 - arrowOffset, centerY);
      ctx.lineTo(centerX + 10 - arrowOffset, centerY);
      ctx.stroke();
      break;
      
    case 'chain':
      // Chain links
      ctx.strokeStyle = 'rgba(255, 220, 100, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX - 5, centerY, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX + 5, centerY, 4, 0, Math.PI * 2);
      ctx.stroke();
      break;
      
    case 'coin':
      // Full gold colored brick - draw gold overlay on entire brick
      ctx.fillStyle = 'hsla(45, 100%, 55%, 0.7)';
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, width - 4, height - 4, 3);
      ctx.fill();
      // Gold coin symbol
      ctx.fillStyle = 'rgba(255, 220, 80, 0.95)';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('$', centerX, centerY + 1);
      // Gold shimmer
      ctx.fillStyle = 'rgba(255, 255, 200, 0.4)';
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 2, width - 6, height * 0.3, 2);
      ctx.fill();
      break;
      
    case 'rainbow':
      // Shimmer
      const hue = (gameTime * 120) % 360;
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.5)`;
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, width - 8, height - 8, 2);
      ctx.fill();
      break;
      
    case 'ghost':
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('👻', centerX, centerY);
      break;
  }
  
  // No hit count numbers on normal bricks (removed per request)
};

// Draw star shape
const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void => {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
};

// Draw damage cracks
const drawDamageCracks = (ctx: CanvasRenderingContext2D, brick: Brick, damageRatio: number): void => {
  const { x, y, width, height } = brick;
  const crackIntensity = 1 - damageRatio;
  
  ctx.strokeStyle = `rgba(0, 0, 0, ${0.2 + crackIntensity * 0.3})`;
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const crackCount = Math.floor(crackIntensity * 3) + 1;
  
  for (let i = 0; i < crackCount; i++) {
    const angle = (Math.PI * 2 / crackCount) * i + 0.3;
    const length = width * 0.25 * (0.5 + crackIntensity * 0.5);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length * 0.6);
    ctx.stroke();
  }
};

// ============ PADDLE AND BALL RENDERERS ============

export const drawPremiumPaddle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  hasLaser: boolean = false,
  hasMagnet: boolean = false,
  hasShield: boolean = false,
  isGhost: boolean = false
): void => {
  ctx.save();
  
  const h = 22;
  const capR = 11;
  const cx = x;
  const centerY = y + height / 2;
  
  // Red left cap
  ctx.beginPath();
  ctx.arc(cx + capR, centerY, capR, 0, Math.PI * 2);
  ctx.fillStyle = '#cc2200';
  ctx.fill();
  
  // Red right cap
  ctx.beginPath();
  ctx.arc(cx + width - capR, centerY, capR, 0, Math.PI * 2);
  ctx.fillStyle = '#cc2200';
  ctx.fill();
  
  // Silver middle body
  const grad = ctx.createLinearGradient(cx + capR, centerY - h / 2, cx + capR, centerY + h / 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, '#999999');
  ctx.fillStyle = grad;
  ctx.fillRect(cx + capR, centerY - h / 2, width - capR * 2, h);
  
  // Cyan glow line
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#00ffff';
  ctx.fillRect(cx + capR, centerY - 1, width - capR * 2, 3);
  ctx.shadowBlur = 0;
  
  // Laser turrets
  if (hasLaser) {
    const turretW = 8;
    const turretH = 12;
    const turret1X = x + width * 0.25 - turretW / 2;
    const turret2X = x + width * 0.75 - turretW / 2;
    
    [turret1X, turret2X].forEach(tx => {
      const tTop = centerY - h / 2;
      // Turret base
      const tGrad = ctx.createLinearGradient(tx, tTop - turretH, tx, tTop);
      tGrad.addColorStop(0, 'hsl(210, 10%, 85%)');
      tGrad.addColorStop(0.5, 'hsl(210, 8%, 70%)');
      tGrad.addColorStop(1, 'hsl(215, 6%, 55%)');
      ctx.fillStyle = tGrad;
      ctx.beginPath();
      ctx.roundRect(tx, tTop - turretH, turretW, turretH + 2, [2, 2, 0, 0]);
      ctx.fill();
      // Barrel
      ctx.fillStyle = 'hsl(210, 5%, 50%)';
      ctx.fillRect(tx + turretW / 2 - 1.5, tTop - turretH - 3, 3, 5);
      // Rings
      ctx.strokeStyle = 'hsl(210, 5%, 60%)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, tTop - turretH + 3);
      ctx.lineTo(tx + turretW, tTop - turretH + 3);
      ctx.moveTo(tx, tTop - turretH + 7);
      ctx.lineTo(tx + turretW, tTop - turretH + 7);
      ctx.stroke();
    });
  }
  
  // Ghost effect - emoji floating ABOVE paddle
  if (isGhost) {
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const bobY = Math.sin(Date.now() / 300) * 3;
    ctx.fillText('👻', x + width / 2, centerY - h / 2 - 14 + bobY);
  }
  
  // Shield glow
  if (hasShield) {
    ctx.shadowColor = 'hsla(200, 100%, 60%, 0.8)';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = 'hsla(200, 100%, 70%, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - 2, centerY - h / 2 - 2, width + 4, h + 4, h / 2 + 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  
  ctx.restore();
};

export const drawPremiumBall = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  isFireball: boolean = false,
  isBigBall: boolean = false
): void => {
  ctx.save();
  
  if (isFireball) {
    // Fireball effect - glowing powerful orange/fire ball
    ctx.shadowColor = 'rgba(255, 100, 0, 0.8)';
    ctx.shadowBlur = 15;
    
    // Fire trail effect
    const outerGrad = ctx.createRadialGradient(x + radius * 0.3, y + radius * 0.3, 0, x, y, radius * 1.5);
    outerGrad.addColorStop(0, 'hsl(50, 100%, 90%)');
    outerGrad.addColorStop(0.3, 'hsl(35, 100%, 60%)');
    outerGrad.addColorStop(0.6, 'hsl(20, 100%, 50%)');
    outerGrad.addColorStop(1, 'hsla(0, 100%, 40%, 0)');
    
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner bright core
    const coreGrad = ctx.createRadialGradient(x - radius * 0.2, y - radius * 0.2, 0, x, y, radius);
    coreGrad.addColorStop(0, 'hsl(50, 100%, 95%)');
    coreGrad.addColorStop(0.4, 'hsl(40, 100%, 70%)');
    coreGrad.addColorStop(1, 'hsl(25, 100%, 55%)');
    
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

  } else if (isBigBall) {
    // Big ball - pure HD steel/chrome appearance (same as normal ball but bigger with stronger glow)
    ctx.shadowColor = 'rgba(150, 180, 220, 0.6)';
    ctx.shadowBlur = 20;
    
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x + 3, y + 3, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Main metallic gradient (steel gray - HD quality)
    const steelGrad = ctx.createRadialGradient(
      x - radius * 0.4, y - radius * 0.4, 0,
      x, y, radius
    );
    steelGrad.addColorStop(0, 'hsl(210, 20%, 98%)');   // Very bright highlight
    steelGrad.addColorStop(0.1, 'hsl(210, 15%, 90%)'); // Light steel
    steelGrad.addColorStop(0.3, 'hsl(215, 12%, 70%)'); // Mid light steel
    steelGrad.addColorStop(0.5, 'hsl(218, 14%, 55%)'); // Mid steel
    steelGrad.addColorStop(0.7, 'hsl(220, 16%, 42%)'); // Dark steel
    steelGrad.addColorStop(1, 'hsl(225, 22%, 28%)');   // Edge shadow
    
    ctx.fillStyle = steelGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    // Chrome reflection band (horizontal highlight)
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    
    const reflectGrad = ctx.createLinearGradient(x - radius, y - radius * 0.3, x + radius, y - radius * 0.1);
    reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    reflectGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)');
    reflectGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.75)');
    reflectGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
    reflectGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.5)');
    reflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = reflectGrad;
    ctx.fillRect(x - radius, y - radius * 0.5, radius * 2, radius * 0.55);
    ctx.restore();
    
    // Main highlight (top-left bright spot)
    const highlightGrad = ctx.createRadialGradient(
      x - radius * 0.35, y - radius * 0.35, 0,
      x - radius * 0.35, y - radius * 0.35, radius * 0.5
    );
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    highlightGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.8)');
    highlightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Secondary small highlight (adds depth)
    const secondaryHighlight = ctx.createRadialGradient(
      x + radius * 0.3, y + radius * 0.4, 0,
      x + radius * 0.3, y + radius * 0.4, radius * 0.3
    );
    secondaryHighlight.addColorStop(0, 'rgba(200, 215, 230, 0.5)');
    secondaryHighlight.addColorStop(1, 'rgba(200, 215, 230, 0)');
    
    ctx.fillStyle = secondaryHighlight;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Chrome rim highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, radius - 1, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();

  } else {
    // Shiny steel/chrome ball
    
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    
    // Main metallic gradient (steel gray)
    const steelGrad = ctx.createRadialGradient(
      x - radius * 0.4, y - radius * 0.4, 0,
      x, y, radius
    );
    steelGrad.addColorStop(0, 'hsl(210, 15%, 95%)');   // Bright highlight
    steelGrad.addColorStop(0.15, 'hsl(210, 10%, 80%)'); // Light steel
    steelGrad.addColorStop(0.4, 'hsl(215, 12%, 60%)');  // Mid steel
    steelGrad.addColorStop(0.7, 'hsl(220, 15%, 45%)');  // Dark steel
    steelGrad.addColorStop(1, 'hsl(225, 20%, 30%)');    // Edge shadow
    
    ctx.fillStyle = steelGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Chrome reflection band (horizontal highlight)
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    
    const reflectGrad = ctx.createLinearGradient(x - radius, y - radius * 0.3, x + radius, y - radius * 0.1);
    reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    reflectGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
    reflectGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
    reflectGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
    reflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = reflectGrad;
    ctx.fillRect(x - radius, y - radius * 0.5, radius * 2, radius * 0.6);
    ctx.restore();
    
    // Main highlight (top-left bright spot)
    const highlightGrad = ctx.createRadialGradient(
      x - radius * 0.35, y - radius * 0.35, 0,
      x - radius * 0.35, y - radius * 0.35, radius * 0.45
    );
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    highlightGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
    highlightGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Secondary small highlight (adds depth)
    const secondaryHighlight = ctx.createRadialGradient(
      x + radius * 0.3, y + radius * 0.4, 0,
      x + radius * 0.3, y + radius * 0.4, radius * 0.25
    );
    secondaryHighlight.addColorStop(0, 'rgba(200, 210, 220, 0.4)');
    secondaryHighlight.addColorStop(1, 'rgba(200, 210, 220, 0)');
    
    ctx.fillStyle = secondaryHighlight;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Chrome rim highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius - 0.5, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();
    
    // Subtle blue tint glow (steel reflection)
    ctx.shadowColor = 'hsla(210, 50%, 70%, 0.4)';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'hsla(210, 30%, 70%, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  ctx.restore();
};
