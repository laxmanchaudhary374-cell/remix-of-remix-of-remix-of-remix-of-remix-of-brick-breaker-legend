// 9 custom patterns for levels 1-9 based on reference designs
// Grid: 8 columns. 1=normal, 2=steel, 3=explosive, 0=empty

// Level 1: Winding Serpent - S-curve tunnel
export const LEVEL1_WINDING_SERPENT: number[][] = [
  [1,1,1,1,1,1,0,0],
  [0,0,0,0,0,1,0,0],
  [0,0,1,1,0,1,0,0],
  [0,1,1,1,0,1,1,1],
  [0,1,0,0,0,0,0,1],
  [0,1,0,1,1,1,0,1],
  [0,1,0,1,0,1,0,1],
  [0,0,0,1,0,0,0,1],
  [1,1,1,1,0,1,1,1],
  [0,0,0,0,0,1,0,0],
  [1,1,1,1,1,1,0,0],
];

// Level 2: Asymmetric Arsenal - chaotic scattered clusters
export const LEVEL2_ASYMMETRIC_ARSENAL: number[][] = [
  [0,1,0,0,1,1,0,1],
  [1,1,0,3,0,1,1,1],
  [0,1,1,1,0,0,1,0],
  [1,0,0,1,1,0,0,1],
  [0,1,0,0,1,1,1,0],
  [1,1,1,0,0,1,0,1],
  [0,0,1,1,0,0,1,1],
  [1,0,0,0,1,1,0,0],
  [0,1,1,0,0,1,1,0],
  [1,0,1,1,0,0,0,1],
];

// Level 3: Tactical Gauntlet - fortress with rooms/corridors
export const LEVEL3_TACTICAL_GAUNTLET: number[][] = [
  [2,2,2,2,2,2,2,2],
  [2,0,0,2,2,0,0,2],
  [2,0,1,1,1,1,0,2],
  [2,0,1,0,0,1,0,2],
  [2,2,1,0,0,1,2,2],
  [0,0,1,1,1,1,0,0],
  [2,0,0,0,0,0,0,2],
  [2,1,1,0,0,1,1,2],
  [2,1,1,2,2,1,1,2],
  [2,2,2,2,2,2,2,2],
];

// Level 4: Diamond Vault - large diamond with nested center
export const LEVEL4_DIAMOND_VAULT: number[][] = [
  [0,0,0,1,1,0,0,0],
  [0,0,1,1,1,1,0,0],
  [0,1,1,0,0,1,1,0],
  [1,1,0,1,1,0,1,1],
  [1,1,0,1,1,0,1,1],
  [0,1,1,0,0,1,1,0],
  [0,0,1,1,1,1,0,0],
  [0,0,0,1,1,0,0,0],
  [0,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1],
];

// Level 5: Spiral Maze - concentric squares
export const LEVEL5_SPIRAL_MAZE: number[][] = [
  [1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1],
  [1,0,1,0,0,1,0,1],
  [1,0,1,0,0,1,0,1],
  [1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1],
  [0,0,0,1,1,0,0,0],
  [0,0,1,1,1,1,0,0],
];

// Level 6: Tactical Archways - pillars with gaps
export const LEVEL6_TACTICAL_ARCHWAYS: number[][] = [
  [2,0,2,0,2,0,2,0],
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
];

// Level 7: Gaps Matrix - asymmetric structure with random gaps
export const LEVEL7_GAPS_MATRIX: number[][] = [
  [1,1,0,1,1,1,0,1],
  [1,0,1,1,0,1,1,0],
  [0,1,1,0,1,0,1,1],
  [1,1,0,1,1,1,0,0],
  [0,1,1,1,0,1,1,1],
  [1,0,0,1,1,0,1,0],
  [1,1,1,0,1,1,0,1],
  [0,1,0,1,0,1,1,1],
  [1,0,1,1,1,0,0,1],
  [1,1,1,0,1,1,1,0],
];

// Level 8: Human Face - simple face layout
export const LEVEL8_HUMAN_FACE: number[][] = [
  [0,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1],
  [1,1,0,1,1,0,1,1],
  [1,1,0,1,1,0,1,1],
  [1,1,1,1,1,1,1,1],
  [1,0,0,1,1,0,0,1],
  [1,1,0,0,0,0,1,1],
  [1,1,1,0,0,1,1,1],
  [0,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,0,0],
];

// Level 9: Power Core Reactor - dense grid with nested high-HP core
export const LEVEL9_POWER_CORE: number[][] = [
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,2,2,2,2,1,1],
  [1,1,2,3,3,2,1,1],
  [1,1,2,3,3,2,1,1],
  [1,1,2,2,2,2,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,0,0],
];

export const CUSTOM_LEVEL_PATTERNS: number[][][] = [
  LEVEL1_WINDING_SERPENT,
  LEVEL2_ASYMMETRIC_ARSENAL,
  LEVEL3_TACTICAL_GAUNTLET,
  LEVEL4_DIAMOND_VAULT,
  LEVEL5_SPIRAL_MAZE,
  LEVEL6_TACTICAL_ARCHWAYS,
  LEVEL7_GAPS_MATRIX,
  LEVEL8_HUMAN_FACE,
  LEVEL9_POWER_CORE,
];
