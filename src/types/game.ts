export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export interface Ball {
  id: string;
  position: Position;
  velocity: Velocity;
  radius: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  hasLaser?: boolean;
  hasMagnet?: boolean;
  hasShield?: boolean;
}

export interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hits: number;
  maxHits: number;
  color: BrickColor;
  destroyed: boolean;
  type: BrickType;
  // For moving bricks
  moveDirection?: number;
  moveSpeed?: number;
  originalX?: number;
  moveRange?: number;
}

export type BrickColor = 'cyan' | 'magenta' | 'yellow' | 'green' | 'orange' | 'purple' | 'red' | 'gold';

export type BrickType = 
  | 'normal'        // Standard brick
  | 'explosive'     // Explodes and destroys nearby bricks
  | 'indestructible'// Cannot be destroyed (legacy, no longer generated)
  | 'steel'         // Steel brick - breaks after 2 hits
  | 'moving'        // Moves left/right
  | 'chain'         // Triggers chain reaction
  | 'coin'          // Drops coins when destroyed
  | 'rainbow'       // Changes color and gives bonus points
  | 'ghost';        // Appears and disappears

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: number;
}

export type PowerUpType = 
  | 'widen' 
  | 'multiball'   // Splits into 2 balls
  | 'sevenball'   // Creates 7 balls
  | 'bigball'     // Makes ball bigger
  | 'slow' 
  | 'extralife' 
  | 'fireball'
  | 'laser'       // Shoot lasers from paddle
  | 'magnet'      // Ball sticks to paddle
  | 'shield'      // Safety net at bottom for 10 seconds
  | 'shrink'      // Paddle shrinks (negative)
  | 'speedup'     // Ball speeds up (negative)
  | 'autopaddle'  // Paddle moves automatically for 10 seconds
  | 'shock'       // Chain lightning destroys nearby bricks
  | 'ghost';      // Ghost haunts paddle - slides away from ball

export interface Plane {
  id: string;
  x: number;
  y: number;
  speed: number;
  hasPowerUp: boolean;
}

export interface LevelCoin {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  value: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  color: string;
  size: number;
}

export interface Laser {
  id: string;
  x: number;
  y: number;
  speed: number;
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  velocity: number;
  value: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
}

export interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'gameover' | 'levelcomplete' | 'won';
  score: number;
  lives: number;
  level: number;
  highScore: number;
  coins: number;
  combo: number;
  maxCombo: number;
  autoTimer?: number;
}

export interface LevelConfig {
  bricks: Omit<Brick, 'id' | 'destroyed'>[];
  ballSpeed: number;
  name: string;
  theme?: 'cyber' | 'neon' | 'space' | 'fire' | 'ice' | 'gold';
}
