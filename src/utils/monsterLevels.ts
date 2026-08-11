// Monster (boss) levels — every 10th level.
// A tight cluster of bricks shaped like a danger creature that slides
// left <-> right as one solid body and has a shared HP bar.
//
// Grid codes: 0 empty | 1 body | 2 steel armor | 3 explosive core
//             5 ice   | 6 copper | 7 gold

import { BrickColor, BrickType, LevelConfig } from '@/types/game';

export const MONSTER_BRICK_WIDTH = 34;
export const MONSTER_BRICK_HEIGHT = 22;
const GAME_WIDTH = 400;

export const isMonsterLevel = (level: number): boolean => level % 10 === 0;

type MonsterDef = { name: string; grid: number[][] };

const MONSTERS: MonsterDef[] = [
  {
    name: 'SKULL BOSS',
    grid: [
      [0, 2, 2, 2, 2, 2, 2, 0],
      [2, 2, 6, 1, 1, 6, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 5, 5, 2, 2, 5, 5, 2],
      [2, 5, 5, 2, 2, 5, 5, 2],
      [2, 2, 2, 6, 6, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [0, 7, 7, 7, 7, 7, 7, 0],
      [0, 2, 3, 2, 2, 3, 2, 0],
      [6, 6, 0, 2, 2, 0, 6, 6],
    ],
  },
  {
    name: 'DANGER SHIP',
    grid: [
      [0, 0, 2, 2, 2, 2, 0, 0],
      [0, 2, 6, 7, 7, 6, 2, 0],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 5, 2, 3, 3, 2, 5, 2],
      [2, 5, 2, 2, 2, 2, 5, 2],
      [2, 2, 6, 6, 6, 6, 2, 2],
      [7, 2, 2, 2, 2, 2, 2, 7],
      [7, 7, 0, 2, 2, 0, 7, 7],
      [5, 5, 0, 6, 6, 0, 5, 5],
    ],
  },
  {
    name: 'ALIEN INVADER',
    grid: [
      [0, 2, 0, 0, 0, 0, 2, 0],
      [0, 0, 2, 0, 0, 2, 0, 0],
      [0, 2, 2, 2, 2, 2, 2, 0],
      [2, 2, 5, 2, 2, 5, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 0, 2, 6, 6, 2, 0, 2],
      [2, 0, 2, 3, 3, 2, 0, 2],
      [0, 7, 2, 2, 2, 2, 7, 0],
      [7, 7, 0, 0, 0, 0, 7, 7],
    ],
  },
  {
    name: 'WAR ROBOT',
    grid: [
      [2, 0, 2, 2, 2, 2, 0, 2],
      [2, 2, 6, 6, 6, 6, 2, 2],
      [0, 2, 5, 2, 2, 5, 2, 0],
      [0, 2, 2, 3, 3, 2, 2, 0],
      [0, 2, 7, 7, 7, 7, 2, 0],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 6, 2, 2, 2, 2, 6, 2],
      [2, 6, 0, 2, 2, 0, 6, 2],
      [2, 2, 0, 7, 7, 0, 2, 2],
    ],
  },
  {
    name: 'DEMON CORE',
    grid: [
      [0, 6, 2, 0, 0, 2, 6, 0],
      [6, 6, 2, 2, 2, 2, 6, 6],
      [2, 2, 5, 2, 2, 5, 2, 2],
      [2, 5, 5, 3, 3, 5, 5, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 7, 2, 6, 6, 2, 7, 2],
      [0, 7, 7, 2, 2, 7, 7, 0],
      [0, 2, 2, 2, 2, 2, 2, 0],
      [0, 0, 6, 2, 2, 6, 0, 0],
    ],
  },
  {
    name: 'SPIDER QUEEN',
    grid: [
      [2, 0, 0, 2, 2, 0, 0, 2],
      [0, 2, 2, 2, 2, 2, 2, 0],
      [0, 2, 5, 2, 2, 5, 2, 0],
      [2, 2, 2, 3, 3, 2, 2, 2],
      [2, 6, 2, 2, 2, 2, 6, 2],
      [2, 6, 6, 7, 7, 6, 6, 2],
      [0, 2, 6, 6, 6, 6, 2, 0],
      [0, 2, 2, 2, 2, 2, 2, 0],
      [2, 0, 5, 0, 0, 5, 0, 2],
    ],
  },
  {
    name: 'UFO DESTROYER',
    grid: [
      [0, 0, 5, 5, 5, 5, 0, 0],
      [0, 5, 5, 2, 2, 5, 5, 0],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 7, 6, 3, 3, 6, 7, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [0, 6, 6, 6, 6, 6, 6, 0],
      [0, 2, 0, 7, 7, 0, 2, 0],
      [2, 2, 0, 2, 2, 0, 2, 2],
      [5, 0, 0, 6, 6, 0, 0, 5],
    ],
  },
  {
    name: 'DRAGON HEAD',
    grid: [
      [0, 2, 2, 0, 0, 2, 2, 0],
      [2, 2, 6, 2, 2, 6, 2, 2],
      [2, 5, 5, 2, 2, 5, 5, 2],
      [2, 2, 2, 3, 3, 2, 2, 2],
      [6, 6, 2, 2, 2, 2, 6, 6],
      [7, 7, 7, 6, 6, 7, 7, 7],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [0, 2, 7, 2, 2, 7, 2, 0],
      [0, 0, 2, 2, 2, 2, 0, 0],
    ],
  },
];

export const getMonsterName = (level: number): string =>
  MONSTERS[(Math.floor(level / 10) - 1 + MONSTERS.length) % MONSTERS.length].name;

const colorFor = (code: number, level: number, row: number, col: number): { color: BrickColor; type: BrickType; hits: number } => {
  switch (code) {
    case 2:
      return { color: 'purple', type: 'steel', hits: 2 };
    case 3:
      return { color: 'red', type: 'explosive', hits: 1 };
    case 5:
      return { color: 'cyan', type: 'normal', hits: 2 };
    case 6:
      return { color: 'orange', type: 'normal', hits: 2 };
    case 7:
      return { color: 'yellow', type: 'normal', hits: 2 };
    default: {
      const pool: BrickColor[] = ['orange', 'cyan', 'yellow', 'magenta'];
      return { color: pool[(level + row + col) % pool.length], type: 'normal', hits: 1 };
    }
  }
};

/**
 * Build the brick body of a monster level.
 * All bricks touch each other and form one solid creature near the top.
 */
export const generateMonsterBricks = (level: number): LevelConfig['bricks'] => {
  const monster = MONSTERS[(Math.floor(level / 10) - 1 + MONSTERS.length) % MONSTERS.length];
  const grid = monster.grid;
  const cols = grid[0].length;
  const bodyWidth = cols * MONSTER_BRICK_WIDTH;
  const startX = (GAME_WIDTH - bodyWidth) / 2;
  const startY = 40;

  // Tougher monsters as the player progresses
  const extraHits = Math.min(2, Math.floor(level / 100));

  const bricks: LevelConfig['bricks'] = [];
  grid.forEach((rowArr, row) => {
    rowArr.forEach((code, col) => {
      if (!code) return;
      const { color, type, hits } = colorFor(code, level, row, col);
      const total = type === 'explosive' ? 1 : hits + extraHits;
      const x = startX + col * MONSTER_BRICK_WIDTH;
      bricks.push({
        x,
        y: startY + row * MONSTER_BRICK_HEIGHT,
        width: MONSTER_BRICK_WIDTH,
        height: MONSTER_BRICK_HEIGHT,
        hits: total,
        maxHits: total,
        color,
        type,
        originalX: x,
      });
    });
  });

  return bricks;
};

/** Horizontal drift speed (px/sec) of the whole monster body. */
export const getMonsterSpeed = (level: number): number =>
  Math.min(110, 40 + Math.floor(level / 10) * 4);
