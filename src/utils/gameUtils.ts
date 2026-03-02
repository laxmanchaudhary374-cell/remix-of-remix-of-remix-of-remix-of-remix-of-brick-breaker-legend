import { Ball, Brick, Paddle, PowerUp, PowerUpType, BrickColor, BrickType, Coin, Explosion, Laser } from '@/types/game';

export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 600;
export const PADDLE_WIDTH = 80;
export const PADDLE_HEIGHT = 12;
export const BALL_RADIUS = 8;

let idCounter = 0;
export const generateId = (): string => {
  return `id_${Date.now()}_${++idCounter}`;
};

export const checkBallPaddleCollision = (ball: Ball, paddle: Paddle): boolean => {
  return (
    ball.position.x + ball.radius > paddle.x &&
    ball.position.x - ball.radius < paddle.x + paddle.width &&
    ball.position.y + ball.radius > paddle.y &&
    ball.position.y - ball.radius < paddle.y + paddle.height
  );
};

export const checkBallBrickCollision = (ball: Ball, brick: Brick): boolean => {
  if (brick.destroyed) return false;
  
  return (
    ball.position.x + ball.radius > brick.x &&
    ball.position.x - ball.radius < brick.x + brick.width &&
    ball.position.y + ball.radius > brick.y &&
    ball.position.y - ball.radius < brick.y + brick.height
  );
};

export const checkLaserBrickCollision = (laser: Laser, brick: Brick): boolean => {
  if (brick.destroyed) return false;
  
  return (
    laser.x > brick.x &&
    laser.x < brick.x + brick.width &&
    laser.y > brick.y &&
    laser.y < brick.y + brick.height
  );
};

export const calculateBounceAngle = (ball: Ball, paddle: Paddle): number => {
  const hitPoint = (ball.position.x - paddle.x) / paddle.width;
  const angle = (hitPoint - 0.5) * Math.PI * 0.7;
  return angle;
};

export const getBrickColor = (color: BrickColor): string => {
  const colors: Record<BrickColor, string> = {
    cyan: 'hsl(180, 100%, 50%)',
    magenta: 'hsl(320, 100%, 60%)',
    yellow: 'hsl(50, 100%, 55%)',
    green: 'hsl(150, 100%, 45%)',
    orange: 'hsl(25, 100%, 55%)',
    purple: 'hsl(280, 100%, 60%)',
    red: 'hsl(0, 100%, 50%)',
    gold: 'hsl(45, 100%, 55%)',
  };
  return colors[color];
};

export const getBrickTypeStyle = (type: BrickType): { glow: string; pattern?: string } => {
  switch (type) {
    case 'explosive':
      return { glow: 'hsl(0, 100%, 60%)', pattern: 'explosive' };
    case 'indestructible':
      return { glow: 'hsl(220, 20%, 40%)', pattern: 'metal' };
    case 'moving':
      return { glow: 'hsl(280, 100%, 60%)', pattern: 'arrows' };
    case 'chain':
      return { glow: 'hsl(50, 100%, 60%)', pattern: 'chain' };
    case 'coin':
      return { glow: 'hsl(45, 100%, 55%)', pattern: 'coin' };
    case 'rainbow':
      return { glow: 'hsl(300, 100%, 60%)', pattern: 'rainbow' };
    case 'ghost':
      return { glow: 'hsl(200, 50%, 70%)', pattern: 'ghost' };
    default:
      return { glow: 'hsl(180, 100%, 50%)' };
  }
};

export const getBrickGradient = (color: BrickColor, hits: number, maxHits: number): string => {
  const opacity = 0.5 + (hits / maxHits) * 0.5;
  const colors: Record<BrickColor, [string, string]> = {
    cyan: ['hsl(180, 100%, 60%)', 'hsl(190, 100%, 40%)'],
    magenta: ['hsl(320, 100%, 70%)', 'hsl(330, 100%, 50%)'],
    yellow: ['hsl(50, 100%, 65%)', 'hsl(40, 100%, 45%)'],
    green: ['hsl(150, 100%, 55%)', 'hsl(160, 100%, 35%)'],
    orange: ['hsl(25, 100%, 65%)', 'hsl(15, 100%, 45%)'],
    purple: ['hsl(280, 100%, 70%)', 'hsl(270, 100%, 50%)'],
    red: ['hsl(0, 100%, 65%)', 'hsl(350, 100%, 45%)'],
    gold: ['hsl(45, 100%, 70%)', 'hsl(35, 100%, 50%)'],
  };
  const [light, dark] = colors[color];
  return `linear-gradient(180deg, ${light} 0%, ${dark} 100%)`;
};

export const shouldDropPowerUp = (): boolean => {
  return Math.random() < 0.18;
};

export const getRandomPowerUpType = (): PowerUpType => {
  const types: PowerUpType[] = ['widen', 'multiball', 'sevenball', 'bigball', 'slow', 'extralife', 'fireball', 'laser', 'magnet', 'shield', 'shrink', 'speedup', 'autopaddle', 'shock', 'ghost'];
  const weights = [0.10, 0.09, 0.04, 0.06, 0.08, 0.06, 0.08, 0.06, 0.05, 0.05, 0.04, 0.04, 0.06, 0.05, 0.14];
  
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < types.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return types[i];
    }
  }
  
  return 'widen';
};

// Power-ups are now larger and more visible
export const createPowerUp = (x: number, y: number): PowerUp => {
  return {
    id: generateId(),
    type: getRandomPowerUpType(),
    x: x - 25, // Centered based on new width
    y,
    width: 50,  // Bigger power-up
    height: 26, // Bigger power-up
    velocity: 130, // Slightly slower for visibility
  };
};

export const getPowerUpColor = (type: PowerUpType): string => {
  const colors: Record<PowerUpType, string> = {
    widen: 'hsl(180, 100%, 50%)',
    multiball: 'hsl(320, 100%, 60%)',
    sevenball: 'hsl(280, 100%, 60%)',
    bigball: 'hsl(40, 100%, 55%)',
    slow: 'hsl(50, 100%, 55%)',
    extralife: 'hsl(150, 100%, 45%)',
    fireball: 'hsl(25, 100%, 55%)',
    laser: 'hsl(0, 100%, 50%)',
    magnet: 'hsl(280, 100%, 60%)',
    shield: 'hsl(200, 100%, 60%)',
    shrink: 'hsl(0, 60%, 40%)',
    speedup: 'hsl(30, 60%, 40%)',
    autopaddle: 'hsl(120, 80%, 50%)',
    shock: 'hsl(60, 100%, 50%)',
    ghost: 'hsl(200, 80%, 60%)',
  };
  return colors[type];
};

export const getPowerUpLabel = (type: PowerUpType): string => {
  const labels: Record<PowerUpType, string> = {
    widen: 'W',
    multiball: '2',
    sevenball: '7',
    bigball: 'B',
    slow: '↓',
    extralife: '+1',
    fireball: 'F',
    laser: 'L',
    magnet: 'U',
    shield: '⬡',
    shrink: '←→',
    speedup: '↑',
    autopaddle: 'A',
    shock: 'Z',
    ghost: '👻',
  };
  return labels[type];
};

export const isNegativePowerUp = (type: PowerUpType): boolean => {
  return type === 'shrink' || type === 'speedup' || type === 'ghost';
};

export const createCoin = (x: number, y: number, value: number = 10): Coin => {
  return {
    id: generateId(),
    x,
    y,
    velocity: 120,
    value,
  };
};

export const createExplosion = (x: number, y: number, radius: number = 80): Explosion => {
  return {
    id: generateId(),
    x,
    y,
    radius: 0,
    maxRadius: radius,
    life: 1,
  };
};

export const getBricksInExplosionRadius = (
  explosion: { x: number; y: number; radius: number },
  bricks: Brick[]
): Brick[] => {
  return bricks.filter(brick => {
    if (brick.destroyed || brick.type === 'indestructible') return false;
    
    const brickCenterX = brick.x + brick.width / 2;
    const brickCenterY = brick.y + brick.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(brickCenterX - explosion.x, 2) +
      Math.pow(brickCenterY - explosion.y, 2)
    );
    
    return distance < explosion.radius;
  });
};

export const getChainedBricks = (
  brick: Brick,
  bricks: Brick[],
  visited: Set<string> = new Set()
): Brick[] => {
  if (visited.has(brick.id)) return [];
  visited.add(brick.id);
  
  const chainedBricks: Brick[] = [brick];
  
  // Find adjacent chain bricks
  bricks.forEach(other => {
    if (
      other.type === 'chain' &&
      !other.destroyed &&
      !visited.has(other.id) &&
      Math.abs(other.x - brick.x) <= brick.width + 5 &&
      Math.abs(other.y - brick.y) <= brick.height + 5
    ) {
      chainedBricks.push(...getChainedBricks(other, bricks, visited));
    }
  });
  
  return chainedBricks;
};

export const updateMovingBricks = (bricks: Brick[], deltaTime: number): Brick[] => {
  return bricks.map(brick => {
    if (brick.type !== 'moving' || brick.destroyed) return brick;
    
    const speed = brick.moveSpeed || 50;
    const range = brick.moveRange || 40;
    const originalX = brick.originalX ?? brick.x;
    
    let newX = brick.x + (brick.moveDirection || 1) * speed * deltaTime;
    let newDirection = brick.moveDirection || 1;
    
    if (newX > originalX + range) {
      newX = originalX + range;
      newDirection = -1;
    } else if (newX < originalX - range) {
      newX = originalX - range;
      newDirection = 1;
    }
    
    return {
      ...brick,
      x: newX,
      moveDirection: newDirection,
      originalX,
    };
  });
};

export const updateGhostBricks = (bricks: Brick[], time: number): Brick[] => {
  return bricks.map(brick => {
    if (brick.type !== 'ghost') return brick;
    
    // Ghost bricks appear/disappear based on time
    const phase = Math.sin(time * 2) > 0;
    return {
      ...brick,
      // We use hits to track visibility (0 = invisible, > 0 = visible)
      // Ghost bricks can't actually be destroyed when invisible
    };
  });
};
