import { BrickColor, BrickType } from '@/types/game';

// Smaller bricks for more variety and denser patterns
export const BRICK_WIDTH = 45;
export const BRICK_HEIGHT = 26;
export const BRICK_PADDING = 0;
export const GAME_WIDTH = 400;

export interface BrickDef {
  color: BrickColor;
  hits?: number;
  type?: BrickType;
  moveSpeed?: number;
  moveRange?: number;
}

export interface LevelBrickConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  hits: number;
  maxHits: number;
  color: BrickColor;
  type: BrickType;
  moveSpeed?: number;
  moveRange?: number;
  originalX?: number;
}

// Helper functions to create brick definitions
export const B = (color: BrickColor, hits: number = 1): BrickDef => ({ color, hits, type: 'normal' });
export const EX = (color: BrickColor): BrickDef => ({ color, type: 'explosive', hits: 1 });
export const IN = (): BrickDef => ({ color: 'purple', type: 'indestructible' });
export const ST = (): BrickDef => ({ color: 'purple', type: 'steel', hits: 2 }); // Steel brick - 2 hits to break
export const MV = (color: BrickColor, speed = 60, range = 30): BrickDef => ({ 
  color, type: 'moving', hits: 1, moveSpeed: speed, moveRange: range 
});
export const CH = (color: BrickColor): BrickDef => ({ color, type: 'chain', hits: 1 });
export const CO = (): BrickDef => ({ color: 'gold', type: 'coin', hits: 1 });
export const RB = (): BrickDef => ({ color: 'magenta', type: 'rainbow', hits: 1 });
export const GH = (color: BrickColor): BrickDef => ({ color, type: 'ghost', hits: 1 });

// Standard row creator
export const createBrickRow = (
  row: number,
  pattern: (BrickDef | BrickColor | null)[],
  defaultHits: number = 1
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - (pattern.length * (BRICK_WIDTH + BRICK_PADDING))) / 2;
  
  pattern.forEach((item, col) => {
    if (item) {
      const def: BrickDef = typeof item === 'string' ? { color: item, hits: defaultHits } : item;
      const hits = def.type === 'indestructible' ? 999 : (def.hits ?? defaultHits);
      
      bricks.push({
        x: startX + col * (BRICK_WIDTH + BRICK_PADDING),
        y: 30 + row * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits,
        maxHits: hits,
        color: def.color,
        type: def.type || 'normal',
        moveSpeed: def.moveSpeed,
        moveRange: def.moveRange,
        originalX: startX + col * (BRICK_WIDTH + BRICK_PADDING),
      });
    }
  });
  
  return bricks;
};

// Create diamond pattern
export const createDiamond = (row: number, col: number, color: BrickColor): LevelBrickConfig[] => {
  const startX = (GAME_WIDTH - 6 * (BRICK_WIDTH + BRICK_PADDING)) / 2;
  const patterns = [
    [null, null, color, null, null],
    [null, color, null, color, null],
    [color, null, null, null, color],
    [null, color, null, color, null],
    [null, null, color, null, null],
  ];
  
  const bricks: LevelBrickConfig[] = [];
  patterns.forEach((patternRow, r) => {
    patternRow.forEach((item, c) => {
      if (item) {
        bricks.push({
          x: startX + (col + c) * (BRICK_WIDTH + BRICK_PADDING),
          y: 30 + (row + r) * (BRICK_HEIGHT + BRICK_PADDING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          hits: 1,
          maxHits: 1,
          color: item,
          type: 'normal',
          originalX: startX + (col + c) * (BRICK_WIDTH + BRICK_PADDING),
        });
      }
    });
  });
  
  return bricks;
};

// Create checker pattern
export const createCheckerboard = (startRow: number, rows: number, cols: number, color1: BrickColor, color2: BrickColor): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - cols * (BRICK_WIDTH + BRICK_PADDING)) / 2;
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = (r + c) % 2 === 0 ? color1 : color2;
      bricks.push({
        x: startX + c * (BRICK_WIDTH + BRICK_PADDING),
        y: 30 + (startRow + r) * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits: 1,
        maxHits: 1,
        color,
        type: 'normal',
        originalX: startX + c * (BRICK_WIDTH + BRICK_PADDING),
      });
    }
  }
  
  return bricks;
};

// Create pyramid pattern
export const createPyramid = (startRow: number, baseWidth: number, color: BrickColor, hits: number = 1): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  
  for (let row = 0; row < baseWidth; row++) {
    const colsInRow = baseWidth - row;
    const startX = (GAME_WIDTH - colsInRow * (BRICK_WIDTH + BRICK_PADDING)) / 2;
    
    for (let col = 0; col < colsInRow; col++) {
      bricks.push({
        x: startX + col * (BRICK_WIDTH + BRICK_PADDING),
        y: 30 + (startRow + row) * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits,
        maxHits: hits,
        color,
        type: 'normal',
        originalX: startX + col * (BRICK_WIDTH + BRICK_PADDING),
      });
    }
  }
  
  return bricks;
};

// Create V shape
export const createVShape = (startRow: number, width: number, color: BrickColor): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - width * (BRICK_WIDTH + BRICK_PADDING)) / 2;
  
  for (let row = 0; row < Math.ceil(width / 2); row++) {
    // Left arm
    bricks.push({
      x: startX + row * (BRICK_WIDTH + BRICK_PADDING),
      y: 30 + (startRow + row) * (BRICK_HEIGHT + BRICK_PADDING),
      width: BRICK_WIDTH,
      height: BRICK_HEIGHT,
      hits: 1,
      maxHits: 1,
      color,
      type: 'normal',
      originalX: startX + row * (BRICK_WIDTH + BRICK_PADDING),
    });
    
    // Right arm
    if (row < Math.floor(width / 2)) {
      bricks.push({
        x: startX + (width - 1 - row) * (BRICK_WIDTH + BRICK_PADDING),
        y: 30 + (startRow + row) * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits: 1,
        maxHits: 1,
        color,
        type: 'normal',
        originalX: startX + (width - 1 - row) * (BRICK_WIDTH + BRICK_PADDING),
      });
    }
  }
  
  return bricks;
};

// Colors array for random selection
export const COLORS: BrickColor[] = ['cyan', 'magenta', 'yellow', 'green', 'orange', 'purple', 'red', 'gold'];

export const getRandomColor = (): BrickColor => {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
};
