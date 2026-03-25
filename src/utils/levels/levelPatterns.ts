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
// SPACE OUTLAW INSPIRED BRICK PATTERNS - Add to levelPatterns.ts

/**
 * STAIRCASE PATTERN
 * Steps going down from left to right
 * Like the staircase pattern seen in Space Outlaw
 */
export const createStaircase = (
  startRow: number,
  steps: number,
  color: BrickColor
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  for (let step = 0; step < steps; step++) {
    for (let col = step; col < 8; col++) {
      bricks.push({
        x: startX + col * (BRICK_WIDTH + BRICK_PADDING),
        y: 30 + (startRow + step) * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits: 1,
        maxHits: 1,
        color,
        type: 'normal',
        originalX: startX + col * (BRICK_WIDTH + BRICK_PADDING),
      });
    }
  }

  return bricks;
};

/**
 * REVERSE STAIRCASE PATTERN
 * Steps going down from right to left
 */
export const createReverseStaircase = (
  startRow: number,
  steps: number,
  color: BrickColor
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  for (let step = 0; step < steps; step++) {
    for (let col = 0; col < 8 - step; col++) {
      bricks.push({
        x: startX + col * (BRICK_WIDTH + BRICK_PADDING),
        y: 30 + (startRow + step) * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits: 1,
        maxHits: 1,
        color,
        type: 'normal',
        originalX: startX + col * (BRICK_WIDTH + BRICK_PADDING),
      });
    }
  }

  return bricks;
};

/**
 * WINGS PATTERN
 * Two symmetric wings on left and right sides with gap in middle
 * Like the wing shape seen in Space Outlaw
 */
export const createWings = (
  startRow: number,
  rows: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  for (let r = 0; r < rows; r++) {
    const color = colors[r % colors.length];
    const wingWidth = rows - r; // Wings get narrower as they go down

    // Left wing
    for (let c = 0; c < wingWidth && c < 3; c++) {
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

    // Right wing (mirror)
    for (let c = 0; c < wingWidth && c < 3; c++) {
      const rightCol = 7 - c;
      bricks.push({
        x: startX + rightCol * (BRICK_WIDTH + BRICK_PADDING),
        y: 30 + (startRow + r) * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits: 1,
        maxHits: 1,
        color,
        type: 'normal',
        originalX: startX + rightCol * (BRICK_WIDTH + BRICK_PADDING),
      });
    }
  }

  return bricks;
};

/**
 * COLUMNS WITH GAPS PATTERN
 * Separate columns with empty space between them
 * Like the column pattern in Space Outlaw
 */
export const createColumnsWithGaps = (
  startRow: number,
  rows: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;
  // Place columns at positions 0, 2, 4, 6 (skip odd columns)
  const columnPositions = [0, 2, 4, 6];

  for (let r = 0; r < rows; r++) {
    const color = colors[r % colors.length];
    for (const col of columnPositions) {
      bricks.push({
        x: startX + col * (BRICK_WIDTH + BRICK_PADDING),
        y: 30 + (startRow + r) * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits: 1,
        maxHits: 1,
        color,
        type: 'normal',
        originalX: startX + col * (BRICK_WIDTH + BRICK_PADDING),
      });
    }
  }

  return bricks;
};

/**
 * INVERTED PYRAMID PATTERN
 * Wide at top, narrow at bottom (opposite of pyramid)
 * Like top-heavy structures in Space Outlaw
 */
export const createInvertedPyramid = (
  startRow: number,
  rows: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const maxCols = 8;
  const startX = (GAME_WIDTH - maxCols * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  for (let r = 0; r < rows; r++) {
    const color = colors[r % colors.length];
    const cols = maxCols - r * 2;
    if (cols <= 0) break;
    const offset = r;

    for (let c = 0; c < cols; c++) {
      bricks.push({
        x: startX + (offset + c) * (BRICK_WIDTH + BRICK_PADDING),
        y: 30 + (startRow + r) * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits: 1,
        maxHits: 1,
        color,
        type: 'normal',
        originalX: startX + (offset + c) * (BRICK_WIDTH + BRICK_PADDING),
      });
    }
  }

  return bricks;
};

/**
 * MAZE PATTERN
 * L-shaped maze corridors
 * Like the maze/spiral pattern in bottom-right of Space Outlaw
 */
export const createMaze = (
  startRow: number,
  color: BrickColor
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  // Define maze layout as a grid (1 = brick, 0 = empty)
  const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  for (let r = 0; r < maze.length; r++) {
    for (let c = 0; c < maze[r].length; c++) {
      if (maze[r][c] === 1) {
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
 * DOUBLE TRIANGLE PATTERN
 * Two triangles pointing at each other (hourglass shape)
 */
export const createHourglass = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const maxCols = 8;
  const startX = (GAME_WIDTH - maxCols * (BRICK_WIDTH + BRICK_PADDING)) / 2;
  const rows = 4;

  // Top triangle (inverted pyramid)
  for (let r = 0; r < rows; r++) {
    const color = colors[r % colors.length];
    const cols = maxCols - r * 2;
    if (cols <= 0) break;
    const offset = r;
    for (let c = 0; c < cols; c++) {
      bricks.push({
        x: startX + (offset + c) * (BRICK_WIDTH + BRICK_PADDING),
        y: 30 + (startRow + r) * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits: 1,
        maxHits: 1,
        color,
        type: 'normal',
        originalX: startX + (offset + c) * (BRICK_WIDTH + BRICK_PADDING),
      });
    }
  }

  // Bottom triangle (pyramid)
  for (let r = 0; r < rows; r++) {
    const color = colors[(rows + r) % colors.length];
    const cols = (r + 1) * 2;
    const offset = rows - r - 1;
    for (let c = 0; c < cols; c++) {
      bricks.push({
        x: startX + (offset + c) * (BRICK_WIDTH + BRICK_PADDING),
        y: 30 + (startRow + rows + r) * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits: 1,
        maxHits: 1,
        color,
        type: 'normal',
        originalX: startX + (offset + c) * (BRICK_WIDTH + BRICK_PADDING),
      });
    }
  }

  return bricks;
};

/**
 * CROSS WITH WINGS PATTERN
 * A cross shape with extra bricks on the sides
 * Like the cross+wings pattern in Space Outlaw top-right
 */
export const createCrossWithWings = (
  startRow: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  // Layout grid (1=color1, 2=color2, 0=empty)
  const layout = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [0, 0, 1, 0, 0, 1, 0, 0],
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
 * ALTERNATING ROWS WITH GAPS PATTERN
 * Rows of bricks with gaps between each row
 * Like the alternating column pattern in Space Outlaw left side
 */
export const createAlternatingRows = (
  startRow: number,
  numRows: number,
  colors: BrickColor[]
): LevelBrickConfig[] => {
  const bricks: LevelBrickConfig[] = [];
  const startX = (GAME_WIDTH - 8 * (BRICK_WIDTH + BRICK_PADDING)) / 2;

  for (let r = 0; r < numRows; r++) {
    const color = colors[r % colors.length];
    // Alternate between full row and short row
    const isFullRow = r % 2 === 0;
    const colCount = isFullRow ? 8 : 4;
    const colOffset = isFullRow ? 0 : 2;

    for (let c = 0; c < colCount; c++) {
      bricks.push({
        x: startX + (colOffset + c) * (BRICK_WIDTH + BRICK_PADDING),
        y: 30 + (startRow + r) * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        hits: 1,
        maxHits: 1,
        color,
        type: 'normal',
        originalX: startX + (colOffset + c) * (BRICK_WIDTH + BRICK_PADDING),
      });
    }
  }

  return bricks;
};
