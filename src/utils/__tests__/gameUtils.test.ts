import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  generateId,
  checkBallPaddleCollision,
  checkBallBrickCollision,
  checkLaserBrickCollision,
  calculateBounceAngle,
  getBrickColor,
  getBrickTypeStyle,
  getBrickGradient,
  shouldDropPowerUp,
  getRandomPowerUpType,
  createPowerUp,
  getPowerUpColor,
  getPowerUpLabel,
  isNegativePowerUp,
  createCoin,
  createExplosion,
  getBricksInExplosionRadius,
  getChainedBricks,
  updateMovingBricks,
  updateGhostBricks,
} from '@/utils/gameUtils';
import type { Ball, Paddle, Brick, Laser } from '@/types/game';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeBall = (x: number, y: number, dx = 0, dy = -1, radius = BALL_RADIUS): Ball => ({
  id: 'ball-1',
  position: { x, y },
  velocity: { dx, dy },
  radius,
});

const makePaddle = (x = 160, y = 580, width = PADDLE_WIDTH, height = PADDLE_HEIGHT): Paddle => ({
  x,
  y,
  width,
  height,
});

const makeBrick = (
  overrides: Partial<Brick> = {},
): Brick => ({
  id: overrides.id ?? 'brick-1',
  x: 100,
  y: 100,
  width: 50,
  height: 20,
  hits: 1,
  maxHits: 1,
  color: 'cyan',
  destroyed: false,
  type: 'normal',
  ...overrides,
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('Game constants', () => {
  it('should have expected canvas dimensions', () => {
    expect(GAME_WIDTH).toBe(400);
    expect(GAME_HEIGHT).toBe(600);
  });

  it('should have expected paddle dimensions', () => {
    expect(PADDLE_WIDTH).toBe(80);
    expect(PADDLE_HEIGHT).toBe(12);
  });

  it('should have expected ball radius', () => {
    expect(BALL_RADIUS).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// generateId
// ---------------------------------------------------------------------------

describe('generateId', () => {
  it('should return a unique string each call', () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
  });

  it('should start with "id_"', () => {
    expect(generateId()).toMatch(/^id_/);
  });
});

// ---------------------------------------------------------------------------
// checkBallPaddleCollision
// ---------------------------------------------------------------------------

describe('checkBallPaddleCollision', () => {
  it('should detect collision when ball overlaps paddle', () => {
    const ball = makeBall(200, 575);
    const paddle = makePaddle(160, 580);
    expect(checkBallPaddleCollision(ball, paddle)).toBe(true);
  });

  it('should not detect collision when ball is far above paddle', () => {
    const ball = makeBall(200, 100);
    const paddle = makePaddle(160, 580);
    expect(checkBallPaddleCollision(ball, paddle)).toBe(false);
  });

  it('should not detect collision when ball is to the left', () => {
    const ball = makeBall(10, 580);
    const paddle = makePaddle(160, 580);
    expect(checkBallPaddleCollision(ball, paddle)).toBe(false);
  });

  it('should not detect collision when ball is to the right', () => {
    const ball = makeBall(350, 580);
    const paddle = makePaddle(160, 580);
    expect(checkBallPaddleCollision(ball, paddle)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkBallBrickCollision
// ---------------------------------------------------------------------------

describe('checkBallBrickCollision', () => {
  it('should detect collision when ball overlaps brick', () => {
    const ball = makeBall(120, 110);
    const brick = makeBrick();
    expect(checkBallBrickCollision(ball, brick)).toBe(true);
  });

  it('should not detect collision with destroyed brick', () => {
    const ball = makeBall(120, 110);
    const brick = makeBrick({ destroyed: true });
    expect(checkBallBrickCollision(ball, brick)).toBe(false);
  });

  it('should not detect collision when ball is far away', () => {
    const ball = makeBall(300, 300);
    const brick = makeBrick();
    expect(checkBallBrickCollision(ball, brick)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkLaserBrickCollision
// ---------------------------------------------------------------------------

describe('checkLaserBrickCollision', () => {
  const makeLaser = (x: number, y: number): Laser => ({
    id: 'laser-1',
    x,
    y,
    speed: 400,
  });

  it('should detect collision when laser is inside brick', () => {
    const laser = makeLaser(120, 110);
    const brick = makeBrick();
    expect(checkLaserBrickCollision(laser, brick)).toBe(true);
  });

  it('should not detect collision with destroyed brick', () => {
    const laser = makeLaser(120, 110);
    const brick = makeBrick({ destroyed: true });
    expect(checkLaserBrickCollision(laser, brick)).toBe(false);
  });

  it('should not detect collision when laser is outside brick', () => {
    const laser = makeLaser(300, 300);
    const brick = makeBrick();
    expect(checkLaserBrickCollision(laser, brick)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// calculateBounceAngle
// ---------------------------------------------------------------------------

describe('calculateBounceAngle', () => {
  it('should return 0 when ball hits paddle center', () => {
    const paddle = makePaddle(100, 580);
    const ball = makeBall(140, 575); // center of 100-width paddle
    const angle = calculateBounceAngle(ball, paddle);
    expect(angle).toBeCloseTo(0, 1);
  });

  it('should return negative angle when ball hits left of paddle', () => {
    const paddle = makePaddle(100, 580);
    const ball = makeBall(100, 575); // left edge
    const angle = calculateBounceAngle(ball, paddle);
    expect(angle).toBeLessThan(0);
  });

  it('should return positive angle when ball hits right of paddle', () => {
    const paddle = makePaddle(100, 580);
    const ball = makeBall(180, 575); // right edge
    const angle = calculateBounceAngle(ball, paddle);
    expect(angle).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// getBrickColor
// ---------------------------------------------------------------------------

describe('getBrickColor', () => {
  it('should return an HSL color for each brick color', () => {
    const colors = ['cyan', 'magenta', 'yellow', 'green', 'orange', 'purple', 'red', 'gold'] as const;
    for (const c of colors) {
      const result = getBrickColor(c);
      expect(result).toMatch(/^hsl\(/);
    }
  });
});

// ---------------------------------------------------------------------------
// getBrickTypeStyle
// ---------------------------------------------------------------------------

describe('getBrickTypeStyle', () => {
  it('should return glow and pattern for explosive', () => {
    const style = getBrickTypeStyle('explosive');
    expect(style.glow).toBeDefined();
    expect(style.pattern).toBe('explosive');
  });

  it('should return glow and pattern for indestructible', () => {
    const style = getBrickTypeStyle('indestructible');
    expect(style.pattern).toBe('metal');
  });

  it('should return only glow for normal brick', () => {
    const style = getBrickTypeStyle('normal');
    expect(style.glow).toBeDefined();
    expect(style.pattern).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getBrickGradient
// ---------------------------------------------------------------------------

describe('getBrickGradient', () => {
  it('should return a CSS linear-gradient string', () => {
    const gradient = getBrickGradient('cyan', 1, 2);
    expect(gradient).toMatch(/^linear-gradient\(/);
  });

  it('should produce different gradients for different colors', () => {
    const g1 = getBrickGradient('cyan', 1, 1);
    const g2 = getBrickGradient('red', 1, 1);
    expect(g1).not.toBe(g2);
  });
});

// ---------------------------------------------------------------------------
// shouldDropPowerUp
// ---------------------------------------------------------------------------

describe('shouldDropPowerUp', () => {
  it('should return a boolean', () => {
    expect(typeof shouldDropPowerUp()).toBe('boolean');
  });

  it('should drop roughly 18% of the time over many calls', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    expect(shouldDropPowerUp()).toBe(true);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(shouldDropPowerUp()).toBe(false);
    vi.restoreAllMocks();
  });
});

// ---------------------------------------------------------------------------
// getRandomPowerUpType
// ---------------------------------------------------------------------------

describe('getRandomPowerUpType', () => {
  it('should return a valid power-up type', () => {
    const validTypes = [
      'widen', 'multiball', 'sevenball', 'bigball', 'slow', 'extralife',
      'fireball', 'laser', 'magnet', 'shield', 'shrink', 'speedup',
      'autopaddle', 'shock', 'ghost',
    ];
    const result = getRandomPowerUpType();
    expect(validTypes).toContain(result);
  });

  it('should return widen when random is 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(getRandomPowerUpType()).toBe('widen');
    vi.restoreAllMocks();
  });

  it('should return ghost for high random values (last weighted bucket)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(getRandomPowerUpType()).toBe('ghost');
    vi.restoreAllMocks();
  });
});

// ---------------------------------------------------------------------------
// createPowerUp
// ---------------------------------------------------------------------------

describe('createPowerUp', () => {
  it('should create a power-up at given coordinates', () => {
    const pu = createPowerUp(200, 300);
    expect(pu.x).toBe(175); // 200 - 25
    expect(pu.y).toBe(300);
    expect(pu.width).toBe(50);
    expect(pu.height).toBe(26);
    expect(pu.velocity).toBe(130);
    expect(pu.id).toBeDefined();
    expect(pu.type).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// getPowerUpColor / getPowerUpLabel
// ---------------------------------------------------------------------------

describe('getPowerUpColor', () => {
  it('should return an HSL string for each type', () => {
    const types = [
      'widen', 'multiball', 'sevenball', 'bigball', 'slow', 'extralife',
      'fireball', 'laser', 'magnet', 'shield', 'shrink', 'speedup',
      'autopaddle', 'shock', 'ghost',
    ] as const;
    for (const t of types) {
      expect(getPowerUpColor(t)).toMatch(/^hsl\(/);
    }
  });
});

describe('getPowerUpLabel', () => {
  it('should return a label for widen', () => {
    expect(getPowerUpLabel('widen')).toBe('W');
  });

  it('should return a label for extralife', () => {
    expect(getPowerUpLabel('extralife')).toBe('+1');
  });
});

// ---------------------------------------------------------------------------
// isNegativePowerUp
// ---------------------------------------------------------------------------

describe('isNegativePowerUp', () => {
  it('should return true for shrink, speedup, ghost', () => {
    expect(isNegativePowerUp('shrink')).toBe(true);
    expect(isNegativePowerUp('speedup')).toBe(true);
    expect(isNegativePowerUp('ghost')).toBe(true);
  });

  it('should return false for positive power-ups', () => {
    expect(isNegativePowerUp('widen')).toBe(false);
    expect(isNegativePowerUp('extralife')).toBe(false);
    expect(isNegativePowerUp('shield')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCoin / createExplosion
// ---------------------------------------------------------------------------

describe('createCoin', () => {
  it('should create a coin with default value', () => {
    const coin = createCoin(100, 200);
    expect(coin.x).toBe(100);
    expect(coin.y).toBe(200);
    expect(coin.value).toBe(10);
    expect(coin.velocity).toBe(120);
  });

  it('should accept a custom value', () => {
    const coin = createCoin(0, 0, 50);
    expect(coin.value).toBe(50);
  });
});

describe('createExplosion', () => {
  it('should create an explosion with default radius', () => {
    const exp = createExplosion(150, 250);
    expect(exp.x).toBe(150);
    expect(exp.y).toBe(250);
    expect(exp.radius).toBe(0);
    expect(exp.maxRadius).toBe(80);
    expect(exp.life).toBe(1);
  });

  it('should accept a custom radius', () => {
    const exp = createExplosion(0, 0, 120);
    expect(exp.maxRadius).toBe(120);
  });
});

// ---------------------------------------------------------------------------
// getBricksInExplosionRadius
// ---------------------------------------------------------------------------

describe('getBricksInExplosionRadius', () => {
  it('should return bricks within explosion radius', () => {
    const bricks = [
      makeBrick({ id: 'b1', x: 100, y: 100 }),
      makeBrick({ id: 'b2', x: 300, y: 300 }),
    ];
    const explosion = { x: 125, y: 110, radius: 100 };
    const result = getBricksInExplosionRadius(explosion, bricks);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b1');
  });

  it('should exclude destroyed bricks', () => {
    const bricks = [makeBrick({ id: 'b1', destroyed: true })];
    const explosion = { x: 125, y: 110, radius: 100 };
    expect(getBricksInExplosionRadius(explosion, bricks)).toHaveLength(0);
  });

  it('should exclude indestructible bricks', () => {
    const bricks = [makeBrick({ id: 'b1', type: 'indestructible' })];
    const explosion = { x: 125, y: 110, radius: 100 };
    expect(getBricksInExplosionRadius(explosion, bricks)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getChainedBricks
// ---------------------------------------------------------------------------

describe('getChainedBricks', () => {
  it('should return single brick when no adjacent chain bricks exist', () => {
    const brick = makeBrick({ id: 'b1', type: 'chain' });
    const bricks = [brick];
    const result = getChainedBricks(brick, bricks);
    expect(result).toHaveLength(1);
  });

  it('should return chained adjacent bricks', () => {
    const b1 = makeBrick({ id: 'b1', type: 'chain', x: 100, y: 100, width: 50, height: 20 });
    const b2 = makeBrick({ id: 'b2', type: 'chain', x: 150, y: 100, width: 50, height: 20 });
    const b3 = makeBrick({ id: 'b3', type: 'chain', x: 300, y: 300, width: 50, height: 20 });
    const bricks = [b1, b2, b3];
    const result = getChainedBricks(b1, bricks);
    expect(result).toHaveLength(2);
  });

  it('should not revisit already visited bricks', () => {
    const b1 = makeBrick({ id: 'b1', type: 'chain', x: 100, y: 100 });
    const visited = new Set(['b1']);
    const result = getChainedBricks(b1, [b1], visited);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// updateMovingBricks
// ---------------------------------------------------------------------------

describe('updateMovingBricks', () => {
  it('should not move non-moving bricks', () => {
    const brick = makeBrick({ type: 'normal', x: 100 });
    const [result] = updateMovingBricks([brick], 0.016);
    expect(result.x).toBe(100);
  });

  it('should move a moving brick based on direction and speed', () => {
    const brick = makeBrick({
      type: 'moving',
      x: 100,
      moveDirection: 1,
      moveSpeed: 50,
      moveRange: 40,
      originalX: 100,
    });
    const [result] = updateMovingBricks([brick], 0.1);
    expect(result.x).toBeGreaterThan(100);
  });

  it('should reverse direction when reaching range boundary', () => {
    const brick = makeBrick({
      type: 'moving',
      x: 139,
      moveDirection: 1,
      moveSpeed: 50,
      moveRange: 40,
      originalX: 100,
    });
    const [result] = updateMovingBricks([brick], 0.1);
    expect(result.moveDirection).toBe(-1);
    expect(result.x).toBe(140); // clamped to originalX + range
  });

  it('should not move destroyed bricks', () => {
    const brick = makeBrick({ type: 'moving', x: 100, destroyed: true });
    const [result] = updateMovingBricks([brick], 0.1);
    expect(result.x).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// updateGhostBricks
// ---------------------------------------------------------------------------

describe('updateGhostBricks', () => {
  it('should return ghost bricks unchanged (no visibility mutation)', () => {
    const brick = makeBrick({ type: 'ghost', hits: 1 });
    const [result] = updateGhostBricks([brick], 0);
    expect(result.type).toBe('ghost');
  });

  it('should not modify non-ghost bricks', () => {
    const brick = makeBrick({ type: 'normal', hits: 1 });
    const [result] = updateGhostBricks([brick], 0);
    expect(result).toBe(brick); // same reference
  });
});
