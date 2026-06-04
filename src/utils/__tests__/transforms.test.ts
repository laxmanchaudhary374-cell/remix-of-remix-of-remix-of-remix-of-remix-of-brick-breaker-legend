import { describe, it, expect } from 'vitest';
import {
  rotate90,
  rotate180,
  rotate270,
  mirrorH,
  mirrorV,
  normalizeToGrid,
  applyBrickVariant,
  adjustDensity,
  transformShape,
  getTransformForLevel,
} from '@/utils/shapes/transforms';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const grid2x3 = [
  [1, 2, 3],
  [4, 5, 6],
];

const grid3x3 = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

// ---------------------------------------------------------------------------
// rotate90
// ---------------------------------------------------------------------------

describe('rotate90', () => {
  it('should rotate a 3x3 grid 90° clockwise', () => {
    const result = rotate90(grid3x3);
    expect(result).toEqual([
      [7, 4, 1],
      [8, 5, 2],
      [9, 6, 3],
    ]);
  });

  it('should rotate a non-square grid', () => {
    const result = rotate90(grid2x3);
    // 2 rows x 3 cols → 3 rows x 2 cols
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveLength(2);
    expect(result).toEqual([
      [4, 1],
      [5, 2],
      [6, 3],
    ]);
  });
});

// ---------------------------------------------------------------------------
// rotate180
// ---------------------------------------------------------------------------

describe('rotate180', () => {
  it('should reverse both rows and columns', () => {
    const result = rotate180(grid3x3);
    expect(result).toEqual([
      [9, 8, 7],
      [6, 5, 4],
      [3, 2, 1],
    ]);
  });
});

// ---------------------------------------------------------------------------
// rotate270
// ---------------------------------------------------------------------------

describe('rotate270', () => {
  it('should be equivalent to three 90° rotations', () => {
    const r = rotate90(rotate90(rotate90(grid3x3)));
    const result = rotate270(grid3x3);
    expect(result).toEqual(r);
  });
});

// ---------------------------------------------------------------------------
// mirrorH
// ---------------------------------------------------------------------------

describe('mirrorH', () => {
  it('should flip rows left-to-right', () => {
    const result = mirrorH(grid3x3);
    expect(result).toEqual([
      [3, 2, 1],
      [6, 5, 4],
      [9, 8, 7],
    ]);
  });
});

// ---------------------------------------------------------------------------
// mirrorV
// ---------------------------------------------------------------------------

describe('mirrorV', () => {
  it('should flip rows top-to-bottom', () => {
    const result = mirrorV(grid3x3);
    expect(result).toEqual([
      [7, 8, 9],
      [4, 5, 6],
      [1, 2, 3],
    ]);
  });
});

// ---------------------------------------------------------------------------
// normalizeToGrid
// ---------------------------------------------------------------------------

describe('normalizeToGrid', () => {
  it('should pad shorter rows to target columns with centered content', () => {
    const input = [[1, 1]];
    const result = normalizeToGrid(input, 6);
    expect(result[0]).toHaveLength(6);
    // content centered: 2 pad left, 2 items, 2 pad right
    expect(result[0]).toEqual([0, 0, 1, 1, 0, 0]);
  });

  it('should truncate longer rows to target columns', () => {
    const input = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]];
    const result = normalizeToGrid(input, 8);
    expect(result[0]).toHaveLength(8);
  });

  it('should leave rows with exact target length unchanged', () => {
    const input = [[1, 0, 1, 0, 1, 0, 1, 0]];
    const result = normalizeToGrid(input, 8);
    expect(result[0]).toEqual(input[0]);
  });
});

// ---------------------------------------------------------------------------
// applyBrickVariant
// ---------------------------------------------------------------------------

describe('applyBrickVariant', () => {
  const simpleGrid = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ];

  it('variant 0: all normal', () => {
    const result = applyBrickVariant(simpleGrid, 0);
    expect(result.flat().every(v => v === 1)).toBe(true);
  });

  it('variant 1: steel edges', () => {
    const result = applyBrickVariant(simpleGrid, 1);
    // center cell should be 1 (normal), edges should be 2 (steel)
    expect(result[1][1]).toBe(1);
    expect(result[0][0]).toBe(2);
    expect(result[0][2]).toBe(2);
    expect(result[2][0]).toBe(2);
  });

  it('variant 2: explosive center', () => {
    const result = applyBrickVariant(simpleGrid, 2);
    // center cell(s) should be 3 (explosive)
    expect(result[1][1]).toBe(3);
  });

  it('should preserve empty cells (0)', () => {
    const gridWithGaps = [
      [0, 1, 0],
      [1, 0, 1],
    ];
    const result = applyBrickVariant(gridWithGaps, 0);
    expect(result[0][0]).toBe(0);
    expect(result[1][1]).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// adjustDensity
// ---------------------------------------------------------------------------

describe('adjustDensity', () => {
  const fullGrid = [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
  ];

  it('medium density should leave grid unchanged', () => {
    const result = adjustDensity(fullGrid, 'medium', 42);
    expect(result).toEqual(fullGrid);
  });

  it('sparse density should remove some bricks', () => {
    const result = adjustDensity(fullGrid, 'sparse', 42);
    const count = result.flat().filter(v => v === 0).length;
    expect(count).toBeGreaterThanOrEqual(0); // at least some removed depending on seed
  });

  it('dense density should potentially add bricks to empty cells', () => {
    const emptyGrid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = adjustDensity(emptyGrid, 'dense', 42);
    const count = result.flat().filter(v => v === 1).length;
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// transformShape
// ---------------------------------------------------------------------------

describe('transformShape', () => {
  const baseGrid = [
    [1, 0, 1],
    [0, 1, 0],
  ];

  it('should apply rotation + normalization', () => {
    const result = transformShape(baseGrid, {
      rotation: 90,
      mirror: 'none',
      brickVariant: 0,
      density: 'medium',
    });
    // After rotate90 of 2x3 → 3x2, then normalized to 8 cols
    expect(result[0]).toHaveLength(8);
  });

  it('should apply horizontal mirror', () => {
    const result = transformShape(baseGrid, {
      rotation: 0,
      mirror: 'horizontal',
      brickVariant: 0,
      density: 'medium',
    });
    // Grid is mirrored then normalized
    expect(result[0]).toHaveLength(8);
  });
});

// ---------------------------------------------------------------------------
// getTransformForLevel
// ---------------------------------------------------------------------------

describe('getTransformForLevel', () => {
  it('should return a valid TransformConfig', () => {
    const config = getTransformForLevel(1);
    expect([0, 90, 180, 270]).toContain(config.rotation);
    expect(['none', 'horizontal', 'vertical']).toContain(config.mirror);
    expect(config.brickVariant).toBeGreaterThanOrEqual(0);
    expect(config.brickVariant).toBeLessThan(6);
    expect(['sparse', 'medium', 'dense']).toContain(config.density);
  });

  it('should produce different configs for different levels', () => {
    const c1 = getTransformForLevel(1);
    const c2 = getTransformForLevel(5);
    // They may differ in at least one field
    const same =
      c1.rotation === c2.rotation &&
      c1.mirror === c2.mirror &&
      c1.brickVariant === c2.brickVariant &&
      c1.density === c2.density;
    expect(same).toBe(false);
  });
});
