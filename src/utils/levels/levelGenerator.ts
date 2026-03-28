// Level Pattern Generator for 2000 levels
// Creates diverse brick patterns with increasing difficulty

import { LevelConfig, BrickColor } from '@/types/game';
import { 
  createBrickRow, createPyramid, createCheckerboard, createVShape,
  createHeart, createHShape, createSpaceship, createBarChart, createArrowUp,
  createDiamondFrame, createTwinTowers, createWaveRows, createStar,
  createMazeComplex, createLShape, createTShape, createUShape, createEShape,
  createExplosionBurst, createConstellation, createShield, createCastleWall,
  createRocketShape, createRing,
  B, EX, ST, MV, CH, CO, RB, GH, BrickDef, COLORS
} from './levelPatterns';

// Pattern types for variety
type PatternType = 'rows' | 'pyramid' | 'checker' | 'diamond' | 'fortress' | 'spiral' | 'wave' | 'cross' | 'heart' | 'star' | 'zigzag' | 'random' | 'arrow' | 'circle' | 'boss' | 'spaceship' | 'robot' | 'castle' | 'bars' | 'xshape' | 'frame' | 'hourglass' | 'butterfly' | 'crown' | 'skull' | 'tree' | 'diagonal' | 'towers' | 'bridge' | 'letter_e' | 'letter_h' | 'steps_lr' | 'steps_rl' | 'pillars' | 'maze' | 'tetris_l' | 'tetris_t' | 'wings' | 'anchor' | 'mushroom' | 'cup' | 'city_skyline' | 'letter_f' | 'letter_t' | 'invader' | 'cactus' | 'umbrella' | 'rocket' | 'wave_solid' | 'grid_holes' | 'corner_blocks' | 'staircase' | 'reverse_staircase' | 'wings_outlaw' | 'columns_gaps' | 'inverted_pyramid' | 'maze_outlaw' | 'hourglass_outlaw' | 'cross_wings' | 'alternating_rows' | 'complex_heart' | 'complex_h' | 'complex_spaceship' | 'complex_bar'
| 'complex_arrow' | 'complex_diamond_frame' | 'complex_towers' | 'complex_wave'
| 'complex_star' | 'maze_complex' | 'l_shape' | 't_shape' | 'u_shape'
| 'e_shape' | 'explosion_burst' | 'constellation' | 'shield'
| 'castle_wall' | 'rocket_shape' | 'ring';

// Get difficulty parameters based on level
const getDifficultyParams = (level: number) => {
  const tier = Math.floor((level - 1) / 50);
  const tierProgress = ((level - 1) % 50) / 50;
  
  const baseRows = 5;
  const additionalRows = Math.floor(level / 20);
  const maxRows = 10;
  
  return {
    ballSpeed: Math.min(280 + level * 0.4 + tier * 8, 380),
    maxHits: Math.min(1 + Math.floor(tier / 2), 4),
    explosiveChance: 0.05 + tier * 0.02,
    steelChance: Math.min(0.02 + tier * 0.015, 0.12),
    movingChance: 0.03 + tier * 0.02,
    chainChance: 0.04 + tier * 0.01,
    coinChance: 0.12 - tier * 0.005, // More gold bricks (5-8 per level)
    ghostChance: tier >= 2 ? 0.03 + tier * 0.01 : 0,
    rainbowChance: tier >= 1 ? 0.02 + tier * 0.005 : 0,
    rows: Math.min(baseRows + additionalRows, maxRows),
    cols: 8,
  };
};

// Get theme based on level range
const getTheme = (level: number): 'cyber' | 'neon' | 'space' | 'fire' | 'ice' | 'gold' => {
  const themes: ('cyber' | 'neon' | 'space' | 'fire' | 'ice' | 'gold')[] = ['cyber', 'neon', 'space', 'fire', 'ice', 'gold'];
  return themes[(Math.floor((level - 1) / 25)) % themes.length];
};

// Get level name
const getLevelName = (level: number, pattern: PatternType): string => {
  const tier = Math.floor((level - 1) / 50);
  const tierNames = [
    'BEGINNER', 'NOVICE', 'SKILLED', 'EXPERT', 'MASTER', 'LEGEND', 'MYTHIC', 'DIVINE', 'ULTIMATE', 'GODLIKE',
    'ETERNAL', 'COSMIC', 'CELESTIAL', 'INFINITE', 'SUPREME', 'OMEGA', 'TRANSCENDENT', 'PRIMORDIAL', 'ASCENDED', 'APEX',
    'GENESIS', 'QUANTUM', 'VOID', 'STELLAR', 'NEBULA', 'GALACTIC', 'IMMORTAL', 'ANCIENT', 'PRIMAL', 'TITAN',
    'PHANTOM', 'ECLIPSE', 'AURORA', 'ZENITH', 'NEXUS', 'INFINITY', 'BEYOND', 'ABSOLUTE', 'PARAGON', 'SINGULARITY',
  ];
  const patternNames: Record<PatternType, string[]> = {
    rows: ['LAYERS', 'STRIPES', 'BANDS', 'HORIZON'],
    pyramid: ['PYRAMID', 'MOUNTAIN', 'PEAK', 'SUMMIT'],
    checker: ['CHECKERS', 'GRID', 'MATRIX', 'TILES'],
    diamond: ['DIAMOND', 'GEM', 'CRYSTAL', 'JEWEL'],
    fortress: ['FORTRESS', 'CASTLE', 'BASTION', 'CITADEL'],
    spiral: ['SPIRAL', 'VORTEX', 'CYCLONE', 'WHIRL'],
    wave: ['WAVE', 'TIDE', 'RIPPLE', 'FLOW'],
    cross: ['CROSS', 'PLUS', 'JUNCTION', 'NEXUS'],
    heart: ['HEART', 'LOVE', 'PULSE', 'CORE'],
    star: ['STAR', 'NOVA', 'STELLAR', 'ASTRAL'],
    zigzag: ['ZIGZAG', 'SNAKE', 'BOLT', 'THUNDER'],
    random: ['CHAOS', 'STORM', 'MAYHEM', 'FRENZY'],
    arrow: ['ARROW', 'DART', 'LANCE', 'SPEAR'],
    circle: ['CIRCLE', 'RING', 'ORBIT', 'HALO'],
    boss: ['BOSS', 'GUARDIAN', 'TITAN', 'OVERLORD'],
    spaceship: ['STARSHIP', 'CRUISER', 'VESSEL', 'VOYAGER'],
    robot: ['ROBOT', 'MECH', 'ANDROID', 'CYBORG'],
    castle: ['PALACE', 'KINGDOM', 'THRONE', 'TOWER'],
    bars: ['BARS', 'STRATUM', 'LAYER', 'TIER'],
    xshape: ['CROSS-X', 'SLASH', 'MARK', 'STRIKE'],
    frame: ['FRAME', 'BORDER', 'OUTLINE', 'EDGE'],
    hourglass: ['HOURGLASS', 'TIMER', 'SANDS', 'GLASS'],
    butterfly: ['BUTTERFLY', 'WINGS', 'MOTH', 'FLUTTER'],
    crown: ['CROWN', 'ROYAL', 'KING', 'QUEEN'],
    skull: ['SKULL', 'BONE', 'DEATH', 'REAPER'],
    tree: ['TREE', 'PINE', 'FOREST', 'NATURE'],
    diagonal: ['DIAGONAL', 'SLANT', 'TILT', 'SLOPE'],
    towers: ['TOWERS', 'SKYSCRAPER', 'BUILDING', 'COLUMN'],
    bridge: ['BRIDGE', 'ARCH', 'SPAN', 'GATEWAY'],
    letter_e: ['EPSILON', 'ECHO', 'ENIGMA', 'ERA'],
    letter_h: ['HERALD', 'HAVEN', 'HARBOR', 'HELM'],
    steps_lr: ['STAIRS', 'ASCEND', 'CLIMB', 'RISE'],
    steps_rl: ['DESCENT', 'CASCADE', 'FALL', 'DROP'],
    pillars: ['PILLARS', 'COLUMNS', 'TEMPLE', 'SHRINE'],
    maze: ['MAZE', 'LABYRINTH', 'PUZZLE', 'PATH'],
    tetris_l: ['TETRIS-L', 'BLOCK', 'PIECE', 'SHAPE'],
    tetris_t: ['TETRIS-T', 'JUNCTION', 'MERGE', 'SPLIT'],
    wings: ['WINGS', 'ANGEL', 'HAWK', 'EAGLE'],
    anchor: ['ANCHOR', 'HARBOR', 'DOCK', 'PORT'],
    mushroom: ['MUSHROOM', 'FUNGI', 'TOADSTOOL', 'CAP'],
    cup: ['CUP', 'TROPHY', 'CHALICE', 'GRAIL'],
    city_skyline: ['CITY', 'SKYLINE', 'DOWNTOWN', 'METRO'],
    letter_f: ['FLAME', 'FORCE', 'FURY', 'FOCUS'],
    letter_t: ['TITAN', 'TEMPLE', 'TORCH', 'TRIDENT'],
    invader: ['INVADER', 'ALIEN', 'SWARM', 'HIVE'],
    cactus: ['CACTUS', 'DESERT', 'OASIS', 'DUNE'],
    umbrella: ['UMBRELLA', 'SHELTER', 'CANOPY', 'SHADE'],
    rocket: ['ROCKET', 'LAUNCH', 'THRUST', 'ORBIT'],
    wave_solid: ['WAVES', 'OCEAN', 'SURF', 'CURRENT'],
    grid_holes: ['GRID', 'LATTICE', 'MESH', 'NET'],
    corner_blocks: ['CORNERS', 'BLOCKS', 'QUAD', 'SECTORS'],
  staircase: ['STAIRCASE', 'STEPS', 'LADDER', 'CLIMB'],
reverse_staircase: ['REVERSE STAIRS', 'DESCENT', 'FALL', 'DROP'],
wings_outlaw: ['WINGS', 'FLIGHT', 'SOAR', 'GLIDE'],
columns_gaps: ['COLUMNS', 'PILLARS', 'POSTS', 'SUPPORTS'],
inverted_pyramid: ['INVERTED', 'TOPPLE', 'FLIP', 'REVERSE'],
maze_outlaw: ['MAZE', 'LABYRINTH', 'PUZZLE', 'MYSTERY'],
hourglass_outlaw: ['HOURGLASS', 'TIMER', 'SANDS', 'GLASS'],
cross_wings: ['CROSS+WINGS', 'HYBRID', 'FUSION', 'BLEND'],
alternating_rows: ['ALTERNATING', 'RHYTHM', 'PATTERN', 'BEAT'],
  complex_heart: ['HEART', 'LOVE', 'PULSE', 'CORE'],
complex_h: ['H-SHAPE', 'LETTER', 'SYMBOL', 'FORM'],
complex_spaceship: ['SPACESHIP', 'VESSEL', 'CRAFT', 'SHIP'],
complex_bar: ['BAR CHART', 'GRAPH', 'COLUMNS', 'BARS'],
complex_arrow: ['ARROW', 'DIRECTION', 'POINTER', 'VECTOR'],
complex_diamond_frame: ['DIAMOND', 'GEM', 'FRAME', 'BORDER'],
complex_towers: ['TOWERS', 'SKYSCRAPERS', 'TWIN', 'PEAKS'],
complex_wave: ['WAVE', 'RIPPLE', 'FLOW', 'TIDE'],
complex_star: ['STAR', 'ASTERISK', 'BURST', 'SHINE'],
maze_complex: ['MAZE', 'LABYRINTH', 'PUZZLE', 'MYSTERY'],
l_shape: ['L-SHAPE', 'CORNER', 'ANGLE', 'TURN'],
t_shape: ['T-SHAPE', 'CROSS', 'JUNCTION', 'SPLIT'],
u_shape: ['U-SHAPE', 'HORSESHOE', 'CURVE', 'ARCH'],
e_shape: ['E-SHAPE', 'LETTER', 'SYMBOL', 'FORM'],
explosion_burst: ['EXPLOSION', 'BURST', 'BLAST', 'BOOM'],
constellation: ['CONSTELLATION', 'STARS', 'PATTERN', 'COSMIC'],
shield: ['SHIELD', 'PROTECT', 'BARRIER', 'DEFENSE'],
castle_wall: ['CASTLE', 'WALL', 'FORTRESS', 'TOWER'],
rocket_shape: ['ROCKET', 'SHIP', 'LAUNCH', 'THRUST'],
ring: ['RING', 'CIRCLE', 'ORBIT', 'HALO'],};
  
  const names = patternNames[pattern];
  const name = names[level % names.length];
  return `${tierNames[Math.min(tier, tierNames.length - 1)]} ${name}`;
};

// Determine brick type based on difficulty and randomness
const getBrickDef = (color: BrickColor, params: ReturnType<typeof getDifficultyParams>, forceNormal = false, explosivePositions: { row: number; col: number }[] = [], row: number = 0, col: number = 0): BrickDef | null => {
  if (forceNormal) {
    return B(color, params.maxHits > 1 && Math.random() < 0.3 ? Math.ceil(Math.random() * params.maxHits) : 1);
  }
  
  const rand = Math.random();
  let cumulative = 0;
  
  cumulative += params.steelChance;
  if (rand < cumulative) return ST();
  
  // Bomb bricks: max 10% of total bricks (e.g. 20 bricks = max 2 bombs), minimum 4-brick distance
  const nearExplosive = explosivePositions.some(p => 
    Math.abs(p.row - row) <= 4 && Math.abs(p.col - col) <= 4
  );
  cumulative += params.explosiveChance;
  if (rand < cumulative && !nearExplosive && explosivePositions.length < 2) return EX(color);
  
  cumulative += params.movingChance;
  if (rand < cumulative) return MV(color, 50 + Math.random() * 50, 20 + Math.random() * 30);
  
  cumulative += params.chainChance;
  if (rand < cumulative) return CH(color);
  
  cumulative += params.coinChance;
  if (rand < cumulative) return CO();
  
  cumulative += params.ghostChance;
  if (rand < cumulative) return GH(color);
  
  cumulative += params.rainbowChance;
  if (rand < cumulative) return RB();
  
  const hits = params.maxHits > 1 && Math.random() < 0.4 ? Math.ceil(Math.random() * params.maxHits) : 1;
  return B(color, hits);
};

// Generic shape pattern helper with bomb spacing
const generateShapePattern = (
  level: number,
  params: ReturnType<typeof getDifficultyParams>,
  shape: number[][]
): LevelConfig['bricks'] => {
  const bricks: LevelConfig['bricks'] = [];
  // Track explosive positions to space them apart (min 4-brick distance)
  const explosivePositions: { row: number; col: number }[] = [];
  
  for (let row = 0; row < shape.length; row++) {
    const rowBricks: (BrickDef | BrickColor | null)[] = [];
    for (let col = 0; col < shape[row].length; col++) {
      const cell = shape[row][col];
      if (cell === 1) {
        const color = COLORS[(level + row + col) % COLORS.length];
        const def = getBrickDef(color, params, false, explosivePositions, row, col);
        if (def?.type === 'explosive') {
          explosivePositions.push({ row, col });
        }
        rowBricks.push(def);
      } else if (cell === 2) {
        rowBricks.push(ST());
      } else if (cell === 3) {
        // Only place explosive if no other explosive within 4 bricks and max 2 total
        const nearExplosive = explosivePositions.some(p => 
          Math.abs(p.row - row) <= 4 && Math.abs(p.col - col) <= 4
        );
        if (!nearExplosive && explosivePositions.length < 2) {
          explosivePositions.push({ row, col });
          rowBricks.push(EX(COLORS[(level + col) % COLORS.length]));
        } else {
          rowBricks.push(B(COLORS[(level + col) % COLORS.length], 2));
        }
      } else {
        rowBricks.push(null);
      }
    }
    bricks.push(...createBrickRow(row, rowBricks));
  }
  return bricks;
};

// Generate row pattern
const generateRowPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const bricks: LevelConfig['bricks'] = [];
  const colorOffset = level % COLORS.length;
  
  for (let row = 0; row < params.rows; row++) {
    const color = COLORS[(colorOffset + row) % COLORS.length];
    const rowBricks: (BrickDef | BrickColor | null)[] = [];
    
    for (let col = 0; col < params.cols; col++) {
      if (Math.random() < 0.1 && level > 20) {
        rowBricks.push(null);
      } else {
        rowBricks.push(getBrickDef(color, params));
      }
    }
    
    bricks.push(...createBrickRow(row, rowBricks));
  }
  
  return bricks;
};

// Generate pyramid pattern
const generatePyramidPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const bricks: LevelConfig['bricks'] = [];
  const color = COLORS[level % COLORS.length];
  const inverted = level % 3 === 0;
  
  if (inverted) {
    for (let row = 0; row < Math.min(params.rows, 5); row++) {
      const colsInRow = params.cols - row;
      const rowBricks: (BrickDef | BrickColor | null)[] = [];
      
      for (let i = 0; i < row; i++) rowBricks.push(null);
      for (let col = 0; col < colsInRow; col++) {
        rowBricks.push(getBrickDef(COLORS[(level + row + col) % COLORS.length], params));
      }
      
      bricks.push(...createBrickRow(row, rowBricks));
    }
  } else {
    bricks.push(...createPyramid(0, Math.min(params.cols, 6), color, Math.min(params.maxHits, 2)));
  }
  
  return bricks;
};

// Generate checker pattern
const generateCheckerPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const color1 = COLORS[level % COLORS.length];
  const color2 = COLORS[(level + 3) % COLORS.length];
  return createCheckerboard(0, params.rows, params.cols, color1, color2);
};

// Generate diamond pattern
const generateDiamondPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const bricks: LevelConfig['bricks'] = [];
  const centerCol = Math.floor(params.cols / 2);
  
  const height = Math.min(5, params.rows);
  for (let row = 0; row < height; row++) {
    const width = row < height / 2 ? row * 2 + 1 : (height - row - 1) * 2 + 1;
    const startCol = centerCol - Math.floor(width / 2);
    const rowBricks: (BrickDef | BrickColor | null)[] = [];
    
    for (let col = 0; col < params.cols; col++) {
      if (col >= startCol && col < startCol + width) {
        const color = COLORS[(level + row + col) % COLORS.length];
        rowBricks.push(getBrickDef(color, params));
      } else {
        rowBricks.push(null);
      }
    }
    
    bricks.push(...createBrickRow(row, rowBricks));
  }
  
  return bricks;
};

// Generate fortress pattern
const generateFortressPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const bricks: LevelConfig['bricks'] = [];
  
  for (let row = 0; row < params.rows; row++) {
    const rowBricks: (BrickDef | BrickColor | null)[] = [];
    
    for (let col = 0; col < params.cols; col++) {
      const isEdge = col === 0 || col === params.cols - 1;
      const isTop = row === 0;
      
      if ((isEdge || isTop) && Math.random() < 0.4 + level * 0.005) {
        rowBricks.push(ST());
      } else if (isEdge) {
        rowBricks.push(B(COLORS[level % COLORS.length], 2));
      } else {
        const color = COLORS[(level + row + col) % COLORS.length];
        rowBricks.push(getBrickDef(color, params));
      }
    }
    
    bricks.push(...createBrickRow(row, rowBricks));
  }
  
  return bricks;
};

// Generate wave pattern
const generateWavePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const bricks: LevelConfig['bricks'] = [];
  
  for (let row = 0; row < params.rows; row++) {
    const rowBricks: (BrickDef | BrickColor | null)[] = [];
    const waveOffset = Math.sin(row * 0.8 + level * 0.3) * 2;
    
    for (let col = 0; col < params.cols; col++) {
      const shouldPlace = Math.sin((col + waveOffset) * 0.8) > -0.3;
      if (shouldPlace) {
        const color = COLORS[(level + row) % COLORS.length];
        rowBricks.push(getBrickDef(color, params));
      } else {
        rowBricks.push(null);
      }
    }
    
    bricks.push(...createBrickRow(row, rowBricks));
  }
  
  return bricks;
};

// Generate cross pattern
const generateCrossPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const bricks: LevelConfig['bricks'] = [];
  const centerCol = Math.floor(params.cols / 2);
  const centerRow = Math.floor(params.rows / 2);
  
  for (let row = 0; row < params.rows; row++) {
    const rowBricks: (BrickDef | BrickColor | null)[] = [];
    
    for (let col = 0; col < params.cols; col++) {
      const isHorizontalBar = row === centerRow || row === centerRow - 1;
      const isVerticalBar = col === centerCol || col === centerCol - 1 || (params.cols % 2 === 0 && col === centerCol + 1);
      
      if (isHorizontalBar || isVerticalBar) {
        const color = COLORS[(level + row + col) % COLORS.length];
        rowBricks.push(getBrickDef(color, params));
      } else {
        rowBricks.push(null);
      }
    }
    
    bricks.push(...createBrickRow(row, rowBricks));
  }
  
  return bricks;
};

// Generate zigzag pattern
const generateZigzagPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const bricks: LevelConfig['bricks'] = [];
  
  for (let row = 0; row < params.rows; row++) {
    const rowBricks: (BrickDef | BrickColor | null)[] = [];
    const offset = row % 2 === 0 ? 0 : 1;
    
    for (let col = 0; col < params.cols; col++) {
      if ((col + offset) % 2 === 0) {
        const color = COLORS[(level + row) % COLORS.length];
        rowBricks.push(getBrickDef(color, params));
      } else {
        rowBricks.push(null);
      }
    }
    
    bricks.push(...createBrickRow(row, rowBricks));
  }
  
  return bricks;
};

// Generate random chaotic pattern
const generateRandomPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const bricks: LevelConfig['bricks'] = [];
  
  for (let row = 0; row < params.rows; row++) {
    const rowBricks: (BrickDef | BrickColor | null)[] = [];
    
    for (let col = 0; col < params.cols; col++) {
      if (Math.random() < 0.75) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        rowBricks.push(getBrickDef(color, params));
      } else {
        rowBricks.push(null);
      }
    }
    
    bricks.push(...createBrickRow(row, rowBricks));
  }
  
  return bricks;
};

// Generate boss level pattern
const generateBossPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const bricks: LevelConfig['bricks'] = [];
  const bossHits = 3 + Math.floor(level / 100);
  
  bricks.push(...createBrickRow(0, [ST(), B('red', bossHits), B('red', bossHits), B('red', bossHits), B('red', bossHits), ST()]));
  bricks.push(...createBrickRow(1, [MV('purple', 80), EX('red'), B('orange', bossHits - 1), B('orange', bossHits - 1), EX('red'), MV('purple', 80)]));
  bricks.push(...createBrickRow(2, [ST(), CH('yellow'), B('magenta', bossHits - 1), B('magenta', bossHits - 1), CH('yellow'), ST()]));
  bricks.push(...createBrickRow(3, [CO(), EX('red'), null, null, EX('red'), CO()]));
  bricks.push(...createBrickRow(4, [MV('cyan', 70), B('cyan', 2), EX('red'), EX('red'), B('cyan', 2), MV('cyan', 70)]));
  bricks.push(...createBrickRow(5, [ST(), 'green', CO(), CO(), 'green', ST()]));
  
  if (params.rows > 6) {
    bricks.push(...createBrickRow(6, [CH('gold'), CH('gold'), CH('gold'), CH('gold'), CH('gold'), CH('gold')]));
  }
  
  return bricks;
};

// Generate heart pattern
const generateHeartPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ]);
};

// Generate star pattern
const generateStarPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
  ]);
};

// Generate arrow pattern
const generateArrowPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ]);
};

// Generate circle/ring pattern
const generateCirclePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
  ]);
};

// Generate spiral pattern
const generateSpiralPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ]);
};

// Generate spaceship pattern
const generateSpaceshipPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 2, 2, 1, 1, 1],
    [1, 1, 2, 2, 2, 2, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
  ]);
};

// Generate robot pattern
const generateRobotPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 3, 1, 1, 3, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 1, 0, 0],
  ]);
};

// Generate castle pattern
const generateCastlePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ]);
};

// Generate bars pattern
const generateBarsPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const bricks: LevelConfig['bricks'] = [];
  
  for (let row = 0; row < 9; row++) {
    const rowBricks: (BrickDef | BrickColor | null)[] = [];
    const isSteel = row % 3 === 0;
    
    for (let col = 0; col < 8; col++) {
      if (isSteel) {
        rowBricks.push(ST());
      } else {
        const color = COLORS[(level + row + col) % COLORS.length];
        rowBricks.push(getBrickDef(color, params));
      }
    }
    bricks.push(...createBrickRow(row, rowBricks));
  }
  
  return bricks;
};

// === NEW SHAPE PATTERNS ===

const generateXShapePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
  ]);
};

const generateFramePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 2, 0, 0, 1],
    [1, 0, 0, 2, 2, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ]);
};

const generateHourglassPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ]);
};

const generateButterflyPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 2, 2, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
  ]);
};

const generateCrownPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 1, 0, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 2, 2, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ]);
};

const generateSkullPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 3, 1, 1, 3, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ]);
};

const generateTreePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 0, 2, 2, 0, 0, 0],
  ]);
};

const generateDiagonalPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
  ]);
};

// New diverse patterns inspired by reference images

const generateTowersPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 1, 0, 1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [2, 2, 2, 2, 2, 2, 2, 2],
  ]);
};

const generateBridgePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2],
  ]);
};

const generateLetterEPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ]);
};

const generateLetterHPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
  ]);
};

const generateStepsLRPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2],
  ]);
};

const generateStepsRLPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2],
  ]);
};

const generatePillarsPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [2, 2, 2, 2, 2, 2, 2, 2],
  ]);
};

const generateMazePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ]);
};

const generateTetrisLPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ]);
};

const generateTetrisTPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ]);
};

const generateWingsPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
  ]);
};

const generateAnchorPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ]);
};

const generateMushroomPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ]);
};

const generateCupPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ]);
};

// === 10 NEW diverse patterns inspired by reference images ===

const generateCitySkylinePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2],
  ]);
};

const generateLetterFPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
  ]);
};

const generateLetterTPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ]);
};

const generateInvaderPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 3, 1, 3, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ]);
};

const generateCactusPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ]);
};

const generateUmbrellaPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
  ]);
};

const generateRocketPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 2, 2, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 1, 1],
    [1, 0, 0, 3, 3, 0, 0, 1],
  ]);
};

const generateWaveSolidPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 0, 0, 1, 1, 0, 0],
    [1, 1, 1, 0, 1, 1, 1, 0],
    [0, 1, 1, 1, 0, 1, 1, 1],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1, 0],
    [1, 1, 0, 0, 1, 1, 0, 0],
  ]);
};

const generateGridHolesPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ]);
};

const generateCornerBlocksPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  return generateShapePattern(level, params, [
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1],
  ]);
};
// Generate complex heart pattern
const generateComplexHeartPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 2) % COLORS.length], COLORS[(level + 4) % COLORS.length]];
  return createHeart(0, colors);
};

// Generate complex H shape pattern
const generateComplexHPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelConfig['bricks'] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 1) % COLORS.length], COLORS[(level + 2) % COLORS.length]];
  return createHShape(0, colors);
};

// Generate complex spaceship pattern
const generateComplexSpaceshipPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 2) % COLORS.length], COLORS[(level + 4) % COLORS.length]];
  return createSpaceship(0, colors);
};

// Generate bar chart pattern
const generateBarChartPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 1) % COLORS.length], COLORS[(level + 2) % COLORS.length]];
  return createBarChart(0, colors);
};

// Generate complex arrow pattern
const generateComplexArrowPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 1) % COLORS.length], COLORS[(level + 2) % COLORS.length]];
  return createArrowUp(0, colors);
};

// Generate diamond frame pattern
const generateDiamondFramePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 2) % COLORS.length], COLORS[(level + 4) % COLORS.length]];
  return createDiamondFrame(0, colors);
};

// Generate twin towers pattern
const generateTwinTowersPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 3) % COLORS.length], COLORS[(level + 6) % COLORS.length]];
  return createTwinTowers(0, colors);
};

// Generate complex wave pattern
const generateComplexWavePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 1) % COLORS.length], COLORS[(level + 2) % COLORS.length]];
  return createWaveRows(0, colors);
};

// Generate complex star pattern
const generateComplexStarPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 2) % COLORS.length], COLORS[(level + 4) % COLORS.length]];
  return createStar(0, colors);
};

// Generate maze complex pattern
const generateMazeComplexPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const color = COLORS[level % COLORS.length];
  return createMazeComplex(0, [color, COLORS[(level + 2) % COLORS.length]]);
};

// Generate L-shape pattern
const generateLShapePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 1) % COLORS.length], COLORS[(level + 2) % COLORS.length]];
  return createLShape(0, colors);
};

// Generate T-shape pattern
const generateTShapePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 1) % COLORS.length], COLORS[(level + 2) % COLORS.length]];
  return createTShape(0, colors);
};

// Generate U-shape pattern
const generateUShapePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 1) % COLORS.length], COLORS[(level + 2) % COLORS.length]];
  return createUShape(0, colors);
};

// Generate E-shape pattern
const generateEShapePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 1) % COLORS.length], COLORS[(level + 2) % COLORS.length]];
  return createEShape(0, colors);
};

// Generate explosion burst pattern
const generateExplosionBurstPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 2) % COLORS.length], COLORS[(level + 4) % COLORS.length]];
  return createExplosionBurst(0, colors);
};

// Generate constellation pattern
const generateConstellationPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 1) % COLORS.length], COLORS[(level + 2) % COLORS.length]];
  return createConstellation(0, colors);
};

// Generate shield pattern
const generateShieldPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 2) % COLORS.length], COLORS[(level + 4) % COLORS.length]];
  return createShield(0, colors);
};

// Generate castle wall pattern
const generateCastleWallPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 1) % COLORS.length], COLORS[(level + 2) % COLORS.length]];
  return createCastleWall(0, colors);
};

// Generate rocket shape pattern
const generateRocketShapePattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 1) % COLORS.length], COLORS[(level + 2) % COLORS.length]];
  return createRocketShape(0, colors);
};

// Generate ring pattern
const generateRingPattern = (level: number, params: ReturnType<typeof getDifficultyParams>): LevelBrickConfig[] => {
  const colors = [COLORS[level % COLORS.length], COLORS[(level + 1) % COLORS.length], COLORS[(level + 2) % COLORS.length]];
  return createRing(0, colors);
};
// Get pattern type for level
const getPatternType = (level: number): PatternType => {
  // Boss levels every 20 levels
  if (level % 20 === 0) return 'boss';
  
  const patterns: PatternType[] = [
    'rows', 'pyramid', 'checker', 'diamond', 'fortress', 'wave', 'cross', 'zigzag',
    'heart', 'star', 'arrow', 'circle', 'spiral', 'random', 'spaceship', 'robot',
    'castle', 'bars', 'xshape', 'frame', 'hourglass', 'butterfly', 'crown', 'skull', 'tree', 'diagonal',
    'towers', 'bridge', 'letter_e', 'letter_h', 'steps_lr', 'steps_rl', 'pillars', 'maze',
    'tetris_l', 'tetris_t', 'wings', 'anchor', 'mushroom', 'cup',
    'city_skyline', 'letter_f', 'letter_t', 'invader', 'cactus', 'umbrella', 'rocket', 'wave_solid', 'grid_holes', 'corner_blocks', 'complex_heart', 'complex_h', 'complex_spaceship', 'complex_bar', 'complex_arrow',
'complex_diamond_frame', 'complex_towers', 'complex_wave', 'complex_star',
'maze_complex', 'l_shape', 't_shape', 'u_shape', 'e_shape',
'explosion_burst', 'constellation', 'shield', 'castle_wall', 'rocket_shape', 'ring',
  ];
  const shuffledIndex = Math.abs(Math.floor(Math.sin(level * 12.9898) * 43758.5453)) % patterns.length;
return patterns[shuffledIndex];
};

// Generate a single level
export const generateLevel = (level: number): LevelConfig => {
  const params = getDifficultyParams(level);
  const pattern = getPatternType(level);
  const theme = getTheme(level);
  const name = getLevelName(level, pattern);
  
  let bricks: LevelConfig['bricks'];
  
  switch (pattern) {
    case 'rows': bricks = generateRowPattern(level, params); break;
    case 'pyramid': bricks = generatePyramidPattern(level, params); break;
    case 'checker': bricks = generateCheckerPattern(level, params); break;
    case 'diamond': bricks = generateDiamondPattern(level, params); break;
    case 'fortress': bricks = generateFortressPattern(level, params); break;
    case 'wave': bricks = generateWavePattern(level, params); break;
    case 'cross': bricks = generateCrossPattern(level, params); break;
    case 'zigzag': bricks = generateZigzagPattern(level, params); break;
    case 'heart': bricks = generateHeartPattern(level, params); break;
    case 'star': bricks = generateStarPattern(level, params); break;
    case 'arrow': bricks = generateArrowPattern(level, params); break;
    case 'circle': bricks = generateCirclePattern(level, params); break;
    case 'spiral': bricks = generateSpiralPattern(level, params); break;
    case 'random': bricks = generateRandomPattern(level, params); break;
    case 'boss': bricks = generateBossPattern(level, params); break;
    case 'spaceship': bricks = generateSpaceshipPattern(level, params); break;
    case 'robot': bricks = generateRobotPattern(level, params); break;
    case 'castle': bricks = generateCastlePattern(level, params); break;
    case 'bars': bricks = generateBarsPattern(level, params); break;
    case 'xshape': bricks = generateXShapePattern(level, params); break;
    case 'frame': bricks = generateFramePattern(level, params); break;
    case 'hourglass': bricks = generateHourglassPattern(level, params); break;
    case 'butterfly': bricks = generateButterflyPattern(level, params); break;
    case 'crown': bricks = generateCrownPattern(level, params); break;
    case 'skull': bricks = generateSkullPattern(level, params); break;
    case 'tree': bricks = generateTreePattern(level, params); break;
    case 'diagonal': bricks = generateDiagonalPattern(level, params); break;
    case 'towers': bricks = generateTowersPattern(level, params); break;
    case 'bridge': bricks = generateBridgePattern(level, params); break;
    case 'letter_e': bricks = generateLetterEPattern(level, params); break;
    case 'letter_h': bricks = generateLetterHPattern(level, params); break;
    case 'steps_lr': bricks = generateStepsLRPattern(level, params); break;
    case 'steps_rl': bricks = generateStepsRLPattern(level, params); break;
    case 'pillars': bricks = generatePillarsPattern(level, params); break;
    case 'maze': bricks = generateMazePattern(level, params); break;
    case 'tetris_l': bricks = generateTetrisLPattern(level, params); break;
    case 'tetris_t': bricks = generateTetrisTPattern(level, params); break;
    case 'wings': bricks = generateWingsPattern(level, params); break;
    case 'anchor': bricks = generateAnchorPattern(level, params); break;
    case 'mushroom': bricks = generateMushroomPattern(level, params); break;
      case 'staircase': bricks = createStaircase(0, 6, colors[0]); break;
case 'reverse_staircase': bricks = createReverseStaircase(0, 6, colors[0]); break;
case 'wings_outlaw': bricks = createWings(0, 6, [colors[0], colors[1]]); break;
case 'columns_gaps': bricks = createColumnsWithGaps(0, 6, [colors[0], colors[1]]); break;
case 'inverted_pyramid': bricks = createInvertedPyramid(0, 5, [colors[0], colors[1]]); break;
case 'maze_outlaw': bricks = createMaze(0, colors[0]); break;
case 'hourglass_outlaw': bricks = createHourglass(0, [colors[0], colors[1]]); break;
case 'cross_wings': bricks = createCrossWithWings(0, [colors[0], colors[1]]); break;
case 'alternating_rows': bricks = createAlternatingRows(0, 8, [colors[0], colors[1]]); break;
    case 'cup': bricks = generateCupPattern(level, params); break;
    case 'city_skyline': bricks = generateCitySkylinePattern(level, params); break;
    case 'letter_f': bricks = generateLetterFPattern(level, params); break;
    case 'letter_t': bricks = generateLetterTPattern(level, params); break;
    case 'invader': bricks = generateInvaderPattern(level, params); break;
    case 'cactus': bricks = generateCactusPattern(level, params); break;
    case 'umbrella': bricks = generateUmbrellaPattern(level, params); break;
    case 'rocket': bricks = generateRocketPattern(level, params); break;
    case 'wave_solid': bricks = generateWaveSolidPattern(level, params); break;
    case 'grid_holes': bricks = generateGridHolesPattern(level, params); break;
    case 'corner_blocks': bricks = generateCornerBlocksPattern(level, params); break;
      case 'complex_heart': bricks = generateComplexHeartPattern(level, params); break;
case 'complex_h': bricks = generateComplexHPattern(level, params); break;
case 'complex_spaceship': bricks = generateComplexSpaceshipPattern(level, params); break;
case 'complex_bar': bricks = generateBarChartPattern(level, params); break;
case 'complex_arrow': bricks = generateComplexArrowPattern(level, params); break;
case 'complex_diamond_frame': bricks = generateDiamondFramePattern(level, params); break;
case 'complex_towers': bricks = generateTwinTowersPattern(level, params); break;
case 'complex_wave': bricks = generateComplexWavePattern(level, params); break;
case 'complex_star': bricks = generateComplexStarPattern(level, params); break;
case 'maze_complex': bricks = generateMazeComplexPattern(level, params); break;
case 'l_shape': bricks = generateLShapePattern(level, params); break;
case 't_shape': bricks = generateTShapePattern(level, params); break;
case 'u_shape': bricks = generateUShapePattern(level, params); break;
case 'e_shape': bricks = generateEShapePattern(level, params); break;
case 'explosion_burst': bricks = generateExplosionBurstPattern(level, params); break;
case 'constellation': bricks = generateConstellationPattern(level, params); break;
case 'shield': bricks = generateShieldPattern(level, params); break;
case 'castle_wall': bricks = generateCastleWallPattern(level, params); break;
case 'rocket_shape': bricks = generateRocketShapePattern(level, params); break;
case 'ring': bricks = generateRingPattern(level, params); break;
    default: bricks = generateRowPattern(level, params);
  }
  
  return {
    name,
    ballSpeed: Math.round(params.ballSpeed),
    theme,
    bricks,
  };
};

// Generate all 2000 levels
export const generateAllLevels = (): LevelConfig[] => {
  const levels: LevelConfig[] = [];
  for (let i = 1; i <= 2000; i++) {
    levels.push(generateLevel(i));
  }
  return levels;
};
