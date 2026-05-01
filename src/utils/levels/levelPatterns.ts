import { BrickColor, BrickType } from '@/types/game';

// Bigger bricks for better visibility and denser patterns
export const BRICK_WIDTH = 43;  // 48 × 0.9 = 43.2 ≈ 43
export const BRICK_HEIGHT = 23; // 26 × 0.9 = 23.4 ≈ 23
export const BRICK_PADDING = 1;

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
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 6 * (BRICK_WIDTH + BRICK_PADDING)) / 2;
  const patterns = [
    [null, null, color, null, null],
    [null, color, null, color, null],
    [color, null, null, null, color],
    [null, color, null, color, null],
    [null, null, color, null, null],
  ];
  
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
// SPACE OUTLAW INSPIRED BRICK PATTERNS - Add to levelPatterns.ts
// COMPLEX SPACE OUTLAW STYLE PATTERNS

/**
 * HEART SHAPE - Like the heart pattern in Space Outlaw
 */
export const createHeart = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  // Heart grid layout (1=color1, 2=color2, 3=color3, 0=empty)
  const layout = [
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 1, 1, 1, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[(layout[r][c] - 1) % colors.length];
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
  }
  return bricks;
};

/**
 * H SHAPE - Like the H pattern in Space Outlaw
 */
export const createHShape = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[r % colors.length];
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
  }
  return bricks;
};

/**
 * SPACESHIP SHAPE - Like the spaceship pattern in Space Outlaw
 */
export const createSpaceship = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 2, 2, 1, 1, 0],
    [1, 1, 1, 2, 2, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[(layout[r][c] - 1) % colors.length];
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
  }
  return bricks;
};

/**
 * BAR CHART SHAPE - Vertical bars of varying heights
 */
export const createBarChart = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [1, 1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[c % colors.length];
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
  }
  return bricks;
};

/**
 * ARROW UP SHAPE - Pointing upwards
 */
export const createArrowUp = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[r % colors.length];
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
  }
  return bricks;
};

/**
 * DIAMOND FRAME SHAPE - Outline of a diamond
 */
export const createDiamondFrame = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[r % colors.length];
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
  }
  return bricks;
};

/**
 * TWIN TOWERS SHAPE - Two tall columns
 */
export const createTwinTowers = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[r % colors.length];
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
  }
  return bricks;
};

/**
 * WAVE ROWS SHAPE - Alternating rows shifted to create a wave effect
 */
export const createWaveRows = (
  startRow: number,
  rows: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  for (let r = 0; r < rows; r++) {
    const color = colors[r % colors.length];
    const offset = r % 2 === 0 ? 0 : 1; // Shift every other row
    for (let c = 0; c < 8; c++) {
      if (c >= offset && c < 8 - (rows - 1 - r) % 2) { // Adjust end for wave effect
        bricks.push({
          x: startX + (c + offset) * (BRICK_WIDTH + BRICK_PADDING),
          y: 30 + (startRow + r) * (BRICK_HEIGHT + BRICK_PADDING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          hits: 1,
          maxHits: 1,
          color,
          type: 'normal',
          originalX: startX + (c + offset) * (BRICK_WIDTH + BRICK_PADDING),
        });
      }
    }
  }
  return bricks;
};

/**
 * STAR SHAPE - Like a star/asterisk
 */
export const createStar = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [1, 0, 0, 1, 1, 0, 0, 1],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 2, 2, 1, 1, 1],
    [1, 1, 1, 2, 2, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [1, 0, 0, 1, 1, 0, 0, 1],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[(layout[r][c] - 1) % colors.length];
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
  }
  return bricks;
};

// 10 NEW SPACE OUTLAW-INSPIRED COMPLEX PATTERNS
// Based on research of Space Outlaw game brick layouts



/**
 * MAZE PATTERN - Complex L-shaped maze corridors
 * Like the maze pattern visible in Space Outlaw
 */
export const createMazeComplex = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] === 1) {
        const color = colors[r % colors.length];
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
  }
  return bricks;
};

/**
 * L-SHAPE PATTERN - Large L-shaped structure
 */
export const createLShape = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] === 1) {
        const color = colors[(r + c) % colors.length];
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
  }
  return bricks;
};

/**
 * T-SHAPE PATTERN - Large T-shaped structure
 */
export const createTShape = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] === 1) {
        const color = colors[r % colors.length];
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
  }
  return bricks;
};

/**
 * U-SHAPE PATTERN - U-shaped structure with open top
 */
export const createUShape = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] === 1) {
        const color = colors[c % colors.length];
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
  }
  return bricks;
};

/**
 * E-SHAPE PATTERN - E-shaped structure
 */
export const createEShape = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] === 1) {
        const color = colors[r % colors.length];
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
  }
  return bricks;
};

/**
 * EXPLOSION BURST PATTERN - Bricks radiating from center like explosion
 */
export const createExplosionBurst = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 2, 2, 1, 1, 1],
    [1, 1, 1, 2, 2, 1, 1, 1],
    [1, 1, 1, 2, 2, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[(layout[r][c] - 1) % colors.length];
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
  }
  return bricks;
};

/**
 * CONSTELLATION PATTERN - Scattered bricks forming pattern
 */
export const createConstellation = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 1],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] === 1) {
        const color = colors[(r + c) % colors.length];
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
  }
  return bricks;
};

/**
 * SHIELD PATTERN - A protective shield shape
 */
export const createShield = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[r % colors.length];
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
  }
  return bricks;
};

/**
 * CASTLE WALL PATTERN - A crenellated wall
 */
export const createCastleWall = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[r % colors.length];
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
  }
  return bricks;
};

/**
 * ROCKET SHAPE - A rocket pointing upwards
 */
export const createRocketShape = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 1, 0, 0],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[(layout[r][c] - 1) % colors.length];
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
  }
  return bricks;
};

/**
 * RING PATTERN - A circular outline
 */
export const createRing = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[r % colors.length];
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
  }
  return bricks;
};

/**
 * GRID PATTERN - A simple grid of bricks with gaps
 */
export const createGridPattern = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  const layout = [
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
  ];

  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] !== 0) {
        const color = colors[(r + c) % colors.length];
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
  }
  return bricks;
};


// This is a seeded random number generator to ensure patterns are consistent across builds
let seed = 12345;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

// Define a type for the pattern functions for easier use in generateLevel
export type PatternFunction = (
  startRow: number,
  colors: BrickColor[],
  params: any // Difficulty parameters, if needed
) => LevelBrickConfig[];

// All available pattern functions
export const ALL_PATTERNS: Record<string, PatternFunction> = {
  createBrickRow: (startRow, colors) => createBrickRow(startRow, colors.map(c => B(c)), 1),
  createPyramid: (startRow, colors) => createPyramid(startRow, 7, colors[0] || 'cyan', 1),
  createCheckerboard: (startRow, colors) => createCheckerboard(startRow, 5, 8, colors[0] || 'cyan', colors[1] || 'magenta'),
  createVShape: (startRow, colors) => createVShape(startRow, 8, colors[0] || 'cyan'),
  createHeart: (startRow, colors) => createHeart(startRow, colors),
  createHShape: (startRow, colors) => createHShape(startRow, colors),
  createSpaceship: (startRow, colors) => createSpaceship(startRow, colors),
  createBarChart: (startRow, colors) => createBarChart(startRow, colors),
  createArrowUp: (startRow, colors) => createArrowUp(startRow, colors),
  createDiamondFrame: (startRow, colors) => createDiamondFrame(startRow, colors),
  createTwinTowers: (startRow, colors) => createTwinTowers(startRow, colors),
  createWaveRows: (startRow, colors) => createWaveRows(startRow, 5, colors),
  createStar: (startRow, colors) => createStar(startRow, colors),
  createMazeComplex: (startRow, colors) => createMazeComplex(startRow, colors),
  createLShape: (startRow, colors) => createLShape(startRow, colors),
  createTShape: (startRow, colors) => createTShape(startRow, colors),
  createUShape: (startRow, colors) => createUShape(startRow, colors),
  createEShape: (startRow, colors) => createEShape(startRow, colors),
  createExplosionBurst: (startRow, colors) => createExplosionBurst(startRow, colors),
  createConstellation: (startRow, colors) => createConstellation(startRow, colors),
  createShield: (startRow, colors) => createShield(startRow, colors),
  createCastleWall: (startRow, colors) => createCastleWall(startRow, colors),
  createRocketShape: (startRow, colors) => createRocketShape(startRow, colors),
  createRing: (startRow, colors) => createRing(startRow, colors),
  createGridPattern: (startRow, colors) => createGridPattern(startRow, colors),
  createAlternatingRows: (startRow, colors) => createAlternatingRows(startRow, 5, colors),
};

export const generatePatternBricks = (
  level: number,
  patternName: string,
  params: any,
  seededRandom: () => number
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;
  const startY = 30;

  const availableColors: BrickColor[] = ['cyan', 'magenta', 'purple', 'yellow', 'green', 'orange', 'red', 'gold'];
  const levelColors: BrickColor[] = [];
  for (let i = 0; i < 5; i++) {
    levelColors.push(availableColors[Math.floor(seededRandom() * availableColors.length)]);
  }

  const patternFunction = ALL_PATTERNS[patternName];
  if (patternFunction) {
    // For patterns that expect colors directly
    if (['createBrickRow', 'createPyramid', 'createCheckerboard', 'createVShape', 'createStaircase', 'createReverseStaircase', 'createMaze'].includes(patternName)) {
      return patternFunction(0, levelColors, params);
    } else {
      // For patterns that expect an array of colors
      return patternFunction(0, levelColors);
    }
  }

  return bricks;
};

export const generateComplexPatternBricks = (
  level: number,
  patternName: string,
  params: any,
  seededRandom: () => number
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;
  const startY = 30;

  const availableColors: BrickColor[] = ['cyan', 'magenta', 'blue', 'purple', 'white', 'yellow', 'green', 'orange', 'red', 'gold'];
  const levelColors: BrickColor[] = [];
  for (let i = 0; i < 5; i++) {
    levelColors.push(availableColors[Math.floor(seededRandom() * availableColors.length)]);
  }

  const patternFunction = ALL_PATTERNS[patternName];
  if (patternFunction) {
    return patternFunction(0, levelColors);
  }

  return bricks;
};


export const generatePattern = (
  patternLayout: number[][],
  startRow: number,
  colors: BrickColor[],
  params: any,
  seededRandom: () => number
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - patternLayout[0].length * (BRICK_WIDTH + BRICK_PADDING)) / 2;
  const explosivePositions: { row: number; col: number }[] = [];
  const maxExplosives = 2; // Limit explosive bricks per pattern

  const { explosiveChance, movingChance, chainChance, coinChance, ghostChance, rainbowChance, steelChance, maxHits: difficultyMaxHits } = params;

  patternLayout.forEach((row, rowIdx) => {
    row.forEach((cellValue, colIdx) => {
      if (cellValue !== 0) {
        let color: BrickColor = colors[(cellValue - 1) % colors.length];
        let hits = 1;
        let type: BrickType = 'normal';
        let moveSpeed: number | undefined;
        let moveRange: number | undefined;

        // Apply special brick types based on randomness
        const rand = seededRandom();
        let cumulative = 0;

        // Steel bricks
        cumulative += steelChance;
        if (rand < cumulative) {
          type = 'steel';
          color = 'purple';
          hits = 2;
        }
        // Explosive bricks (with spacing)
        else {
          cumulative += explosiveChance;
          const nearExplosive = explosivePositions.some(p =>
            Math.abs(p.row - rowIdx) <= 3 && Math.abs(p.col - colIdx) <= 3
          );
          if (rand < cumulative && !nearExplosive && explosivePositions.length < maxExplosives) {
            type = 'explosive';
            explosivePositions.push({ row: rowIdx, col: colIdx });
          }
          // Moving bricks
          else {
            cumulative += movingChance;
            if (rand < cumulative) {
              type = 'moving';
              moveSpeed = 50 + seededRandom() * 50;
              moveRange = 20 + seededRandom() * 30;
            }
            // Chain bricks
            else {
              cumulative += chainChance;
              if (rand < cumulative) {
                type = 'chain';
              }
              // Coin bricks
              else {
                cumulative += coinChance;
                if (rand < cumulative) {
                  type = 'coin';
                  color = 'gold';
                }
                // Ghost bricks
                else {
                  cumulative += ghostChance;
                  if (rand < cumulative) {
                    type = 'ghost';
                  }
                  // Rainbow bricks
                  else {
                    cumulative += rainbowChance;
                    if (rand < cumulative) {
                      type = 'rainbow';
                      color = 'magenta';
                    }
                    // Multi-hit normal bricks at higher levels
                    else if (difficultyMaxHits >= 1 && seededRandom() < 0.3) {
                      hits = Math.min(1 + Math.floor(seededRandom() * (1 + difficultyMaxHits)), 4);
                    }
                  }
                }
              }
            }
          }
        }

        bricks.push({
          x: startX + colIdx * (BRICK_WIDTH + BRICK_PADDING),
          y: 30 + (startRow + rowIdx) * (BRICK_HEIGHT + BRICK_PADDING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          hits,
          maxHits: hits,
          color,
          type,
          moveSpeed,
          moveRange,
          originalX: startX + colIdx * (BRICK_WIDTH + BRICK_PADDING),
        });
      }
    });
  });

  return bricks;
};

export const createAlternatingRows = (
  startRow: number,
  rows: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  for (let r = 0; r < rows; r++) {
    const color = colors[r % colors.length];
    for (let c = 0; c < 8; c++) {
      if ((r % 2 === 0 && c % 2 === 0) || (r % 2 !== 0 && c % 2 !== 0)) {
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
  }
  return bricks;
};


