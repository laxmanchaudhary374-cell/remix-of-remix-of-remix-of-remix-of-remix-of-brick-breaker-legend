// Master shape library - 57 base shapes with transformation system
// Generates 500+ unique brick patterns

import { ALL_LETTERS, LETTER_NAMES } from './letters';
import { ALL_NUMBERS, NUMBER_NAMES } from './numbers';
import { ALL_GEOMETRIC, GEOMETRIC_NAMES } from './geometric';
import { transformShape, getTransformForLevel, TransformConfig } from './transforms';

// Re-export transforms
export { transformShape, getTransformForLevel } from './transforms';
export type { TransformConfig } from './transforms';

// All 57 base shapes combined
export const ALL_BASE_SHAPES: number[][][] = [
  ...ALL_LETTERS,    // 26 letters
  ...ALL_NUMBERS,    // 10 numbers  
  ...ALL_GEOMETRIC,  // 21 geometric/patterns
];

export const ALL_BASE_SHAPE_NAMES: string[] = [
  ...LETTER_NAMES.map(n => `LETTER ${n}`),
  ...NUMBER_NAMES.map(n => `NUMBER ${n}`),
  ...GEOMETRIC_NAMES,
];

/**
 * Get a unique transformed shape for a given level number.
 * Each level gets a different base shape + transformation combo.
 * With 57 shapes × 4 rotations × 3 mirrors × 6 variants × 3 densities = 12,312 combos
 */
export function getShapeForLevel(level: number): { shape: number[][]; name: string } {
  const baseIndex = level % ALL_BASE_SHAPES.length;
  const baseShape = ALL_BASE_SHAPES[baseIndex];
  const baseName = ALL_BASE_SHAPE_NAMES[baseIndex];
  
  const config = getTransformForLevel(level);
  const transformed = transformShape(baseShape, config, level);
  
  // Build descriptive name
  const parts = [baseName];
  if (config.rotation !== 0) parts.push(`R${config.rotation}`);
  if (config.mirror !== 'none') parts.push(config.mirror === 'horizontal' ? 'MH' : 'MV');
  if (config.density !== 'medium') parts.push(config.density.toUpperCase());
  
  return { shape: transformed, name: parts.join(' ') };
}

// Total unique combinations available
export const TOTAL_SHAPE_COMBINATIONS = ALL_BASE_SHAPES.length * 4 * 3 * 6 * 3;
