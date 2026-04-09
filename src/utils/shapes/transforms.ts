// Shape transformation utilities for generating 500+ unique patterns

/**
 * Rotate a grid 90° clockwise
 */
export function rotate90(grid: number[][]): number[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const result: number[][] = [];
  for (let c = 0; c < cols; c++) {
    const newRow: number[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      newRow.push(grid[r][c]);
    }
    result.push(newRow);
  }
  return result;
}

/**
 * Rotate 180°
 */
export function rotate180(grid: number[][]): number[][] {
  return grid.slice().reverse().map(row => row.slice().reverse());
}

/**
 * Rotate 270° (or 90° counter-clockwise)
 */
export function rotate270(grid: number[][]): number[][] {
  return rotate90(rotate180(grid));
}

/**
 * Mirror horizontally (flip left-right)
 */
export function mirrorH(grid: number[][]): number[][] {
  return grid.map(row => row.slice().reverse());
}

/**
 * Mirror vertically (flip top-bottom)
 */
export function mirrorV(grid: number[][]): number[][] {
  return grid.slice().reverse();
}

/**
 * Pad/resize a grid to exactly 8 columns, keeping content centered
 */
export function normalizeToGrid(grid: number[][], targetCols: number = 8): number[][] {
  return grid.map(row => {
    if (row.length === targetCols) return row;
    if (row.length > targetCols) return row.slice(0, targetCols);
    const pad = Math.floor((targetCols - row.length) / 2);
    const result = new Array(targetCols).fill(0);
    for (let i = 0; i < row.length; i++) {
      result[pad + i] = row[i];
    }
    return result;
  });
}

/**
 * Apply brick type variation to a shape
 * variant 0: all normal (1)
 * variant 1: edges become steel (2)
 * variant 2: center becomes explosive (3)
 * variant 3: alternating rows steel
 * variant 4: checkerboard steel/normal
 * variant 5: random steel scatter
 */
export function applyBrickVariant(grid: number[][], variant: number): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 8;
  
  return grid.map((row, r) => row.map((cell, c) => {
    if (cell === 0) return 0;
    
    switch (variant) {
      case 0: return 1; // all normal
      case 1: { // steel edges
        const isEdgeRow = r === 0 || r === rows - 1;
        const isEdgeCol = c === 0 || c === cols - 1;
        return (isEdgeRow || isEdgeCol) ? 2 : 1;
      }
      case 2: { // explosive center
        const centerR = Math.abs(r - rows / 2) < rows * 0.25;
        const centerC = Math.abs(c - cols / 2) < cols * 0.25;
        return (centerR && centerC) ? 3 : 1;
      }
      case 3: // alternating steel rows
        return (r % 3 === 0) ? 2 : 1;
      case 4: // checkerboard steel
        return ((r + c) % 2 === 0) ? 2 : 1;
      case 5: // scattered steel
        return ((r * 7 + c * 13) % 5 === 0) ? 2 : 1;
      default: return cell;
    }
  }));
}

/**
 * Adjust density: 
 * 'sparse' removes ~30% of bricks
 * 'dense' fills some gaps
 */
export function adjustDensity(grid: number[][], density: 'sparse' | 'medium' | 'dense', seed: number): number[][] {
  return grid.map((row, r) => row.map((cell, c) => {
    const hash = ((seed * 31 + r * 17 + c * 13) % 100);
    if (density === 'sparse' && cell > 0 && hash < 25) return 0;
    if (density === 'dense' && cell === 0 && hash < 15) return 1;
    return cell;
  }));
}

export type TransformConfig = {
  rotation: 0 | 90 | 180 | 270;
  mirror: 'none' | 'horizontal' | 'vertical';
  brickVariant: number;
  density: 'sparse' | 'medium' | 'dense';
};

/**
 * Apply all transformations to a base shape
 */
export function transformShape(grid: number[][], config: TransformConfig, seed: number = 0): number[][] {
  let result = grid;
  
  // Apply rotation
  if (config.rotation === 90) result = rotate90(result);
  else if (config.rotation === 180) result = rotate180(result);
  else if (config.rotation === 270) result = rotate270(result);
  
  // Apply mirror
  if (config.mirror === 'horizontal') result = mirrorH(result);
  else if (config.mirror === 'vertical') result = mirrorV(result);
  
  // Normalize to 8 columns
  result = normalizeToGrid(result, 8);
  
  // Apply brick variant
  result = applyBrickVariant(result, config.brickVariant);
  
  // Apply density
  result = adjustDensity(result, config.density, seed);
  
  return result;
}

/**
 * Generate a unique transform config for a given level number
 * This ensures each level gets a different combination
 */
export function getTransformForLevel(level: number): TransformConfig {
  const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
  const mirrors: ('none' | 'horizontal' | 'vertical')[] = ['none', 'horizontal', 'vertical'];
  const densities: ('sparse' | 'medium' | 'dense')[] = ['sparse', 'medium', 'dense'];
  
  // Use different prime multipliers to ensure variety
  const rotIdx = level % 4;
  const mirIdx = Math.floor(level / 4) % 3;
  const varIdx = Math.floor(level / 12) % 6;
  const denIdx = Math.floor(level / 72) % 3;
  
  return {
    rotation: rotations[rotIdx],
    mirror: mirrors[mirIdx],
    brickVariant: varIdx,
    density: densities[denIdx],
  };
}
