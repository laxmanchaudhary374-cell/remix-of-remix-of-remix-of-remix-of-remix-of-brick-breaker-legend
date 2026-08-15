// Monster (boss) levels — every 10th level.
// The boss is ONE big creature: a solid rectangular block of bricks that the
// uploaded monster artwork is painted onto. The whole body slides left <-> right
// and shares a single HP bar. Breaking bricks chips pieces off the artwork.

import { BrickColor, BrickType, LevelConfig } from '@/types/game';
import { getMonsterArt } from './monsterImages';

const GAME_WIDTH = 400;

// Big, clear boss body (matches the reference screenshot proportions)
export const MONSTER_COLS = 8;
export const MONSTER_ROWS = 8;
export const MONSTER_BRICK_WIDTH = 43;
export const MONSTER_BRICK_HEIGHT = 30;
export const MONSTER_BODY_WIDTH = MONSTER_COLS * MONSTER_BRICK_WIDTH; // 344
export const MONSTER_BODY_HEIGHT = MONSTER_ROWS * MONSTER_BRICK_HEIGHT; // 240
export const MONSTER_START_X = (GAME_WIDTH - MONSTER_BODY_WIDTH) / 2;
export const MONSTER_START_Y = 58;

export const isMonsterLevel = (level: number): boolean => level % 10 === 0;

export const getMonsterName = (level: number): string => getMonsterArt(level).name;

const COLOR_CYCLE: BrickColor[] = ['purple', 'cyan', 'orange', 'magenta'];

/**
 * Build the boss body: a full rectangle of bricks. The artwork is drawn on top
 * in GameCanvas, so every brick is a chunk of the monster.
 */
export const generateMonsterBricks = (level: number): LevelConfig['bricks'] => {
  // Tougher bosses as the player progresses
  const extraHits = Math.min(3, Math.floor(level / 60));

  const bricks: LevelConfig['bricks'] = [];
  for (let row = 0; row < MONSTER_ROWS; row++) {
    for (let col = 0; col < MONSTER_COLS; col++) {
      // Core bricks (center of the face) are tougher
      const isCore =
        row >= 2 && row <= MONSTER_ROWS - 3 && col >= 2 && col <= MONSTER_COLS - 3;
      const hits = (isCore ? 3 : 2) + extraHits;
      const x = MONSTER_START_X + col * MONSTER_BRICK_WIDTH;
      bricks.push({
        x,
        y: MONSTER_START_Y + row * MONSTER_BRICK_HEIGHT,
        width: MONSTER_BRICK_WIDTH,
        height: MONSTER_BRICK_HEIGHT,
        hits,
        maxHits: hits,
        color: COLOR_CYCLE[(row + col) % COLOR_CYCLE.length],
        type: 'normal' as BrickType,
        originalX: x,
      });
    }
  }

  return bricks;
};

/** Horizontal drift speed (px/sec) of the whole monster body. */
export const getMonsterSpeed = (level: number): number =>
  Math.min(90, 32 + Math.floor(level / 10) * 3);
