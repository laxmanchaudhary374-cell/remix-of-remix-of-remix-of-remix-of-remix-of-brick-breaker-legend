// Curated "clean" structured 8-column patterns.
// Used as a quality fallback whenever a generated pattern is too dense,
// too empty, or too messy. All patterns here are symmetric, readable
// shapes with open space for the ball to travel.
// 0 = empty, 1 = normal, 2 = steel, 3 = explosive

export const CLEAN_PATTERNS: number[][][] = [
  // Hollow frame with inner box
  [
    [1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,2,2,2,2,0,1],
    [1,0,2,0,0,2,0,1],
    [1,0,2,2,2,2,0,1],
    [1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0],
  ],
  // Clean columns with open center
  [
    [1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,1,1],
    [1,1,0,2,2,0,1,1],
    [1,1,0,2,2,0,1,1],
    [1,1,0,0,0,0,1,1],
    [0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1],
  ],
  // Open diamond
  [
    [1,1,1,1,1,1,1,1],
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,0,0,1,1,0],
    [1,1,0,0,0,0,1,1],
    [0,1,1,0,0,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
  ],
  // Twin towers + base
  [
    [1,1,0,0,0,0,1,1],
    [1,1,0,0,0,0,1,1],
    [1,1,0,2,2,0,1,1],
    [1,1,0,2,2,0,1,1],
    [1,1,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  // Clean X
  [
    [1,1,0,0,0,0,1,1],
    [0,1,1,0,0,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,2,2,0,0,0],
    [0,0,0,2,2,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,0,0,1,1,0],
    [1,1,0,0,0,0,1,1],
  ],
  // Gateway / arch
  [
    [0,1,1,1,1,1,1,0],
    [1,1,0,0,0,0,1,1],
    [1,1,0,0,0,0,1,1],
    [1,1,0,3,3,0,1,1],
    [1,1,0,3,3,0,1,1],
    [1,1,0,0,0,0,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0],
  ],
  // Stepped pyramid (open sides)
  [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,2,2,1,1,0],
    [1,1,0,2,2,0,1,1],
    [1,1,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  // Ladder / bands with gaps
  [
    [1,1,1,0,0,1,1,1],
    [0,0,0,0,0,0,0,0],
    [1,1,1,0,0,1,1,1],
    [0,0,0,0,0,0,0,0],
    [1,1,1,0,0,1,1,1],
    [0,0,0,0,0,0,0,0],
    [1,1,1,0,0,1,1,1],
    [0,0,0,0,0,0,0,0],
  ],
  // Hollow circle
  [
    [0,0,1,1,1,1,0,0],
    [0,1,0,0,0,0,1,0],
    [1,0,0,0,0,0,0,1],
    [1,0,0,2,2,0,0,1],
    [1,0,0,2,2,0,0,1],
    [1,0,0,0,0,0,0,1],
    [0,1,0,0,0,0,1,0],
    [0,0,1,1,1,1,0,0],
  ],
  // Pillars with cap
  [
    [1,1,1,1,1,1,1,1],
    [1,0,1,0,0,1,0,1],
    [1,0,1,0,0,1,0,1],
    [1,0,1,0,0,1,0,1],
    [1,0,1,0,0,1,0,1],
    [1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  // Double chevron
  [
    [1,1,0,0,0,0,1,1],
    [1,1,1,0,0,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [1,1,0,0,0,0,1,1],
    [1,1,1,0,0,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
  ],
  // Open cross
  [
    [0,0,1,1,1,1,0,0],
    [0,0,1,0,0,1,0,0],
    [1,1,1,0,0,1,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1],
    [1,1,1,0,0,1,1,1],
    [0,0,1,0,0,1,0,0],
    [0,0,1,1,1,1,0,0],
  ],
];

/** Fill ratio of a grid (fraction of non-zero cells). */
export const getFillRatio = (grid: number[][]): number => {
  if (!grid || grid.length === 0) return 0;
  let total = 0;
  let filled = 0;
  for (const row of grid) {
    for (const cell of row) {
      total++;
      if (cell > 0) filled++;
    }
  }
  return total === 0 ? 0 : filled / total;
};

/**
 * Messiness heuristic: counts isolated bricks (no orthogonal neighbour).
 * Lots of isolated cells = noisy, random-looking pattern.
 */
export const getIsolationRatio = (grid: number[][]): number => {
  let filled = 0;
  let isolated = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 0) continue;
      filled++;
      const up = r > 0 && grid[r - 1][c] > 0;
      const down = r < grid.length - 1 && grid[r + 1][c] > 0;
      const left = c > 0 && grid[r][c - 1] > 0;
      const right = c < grid[r].length - 1 && grid[r][c + 1] > 0;
      if (!up && !down && !left && !right) isolated++;
    }
  }
  return filled === 0 ? 1 : isolated / filled;
};

/** A pattern is "good" if it is neither too dense, too empty, nor too noisy. */
export const isGoodPattern = (grid: number[][]): boolean => {
  if (!grid || grid.length === 0) return false;
  const fill = getFillRatio(grid);
  if (fill < 0.3 || fill > 0.7) return false;
  if (getIsolationRatio(grid) > 0.25) return false;
  return true;
};

/** Deterministic clean pattern for a level. */
export const getCleanPattern = (level: number): number[][] =>
  CLEAN_PATTERNS[Math.abs(level) % CLEAN_PATTERNS.length];
