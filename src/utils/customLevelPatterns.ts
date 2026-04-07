// 9 custom patterns for levels 1-9 matching reference screenshots exactly
// Grid: 8 columns. 0=empty, 1=normal, 2=steel(indestructible), 3=explosive
// Patterns are 14-16 rows tall for dense coverage (~70% of play area)

// Level 1: THE WINDING SERPENT
// S-curve tunnel carved through steel walls. Ball must navigate narrow winding path.
export const LEVEL1_WINDING_SERPENT: number[][] = [
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
  [2,0,2,0,2,0,2,0],
  [2,0,2,0,2,0,2,0],
  [2,0,2,0,2,0,2,0],
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
];

// Level 2: ASYMMETRIC ARSENAL
// Chaotic clusters of mixed brick types. Explosive barrels, steel anchors, varied HP.
export const LEVEL2_ASYMMETRIC_ARSENAL: number[][] = [
  [1,1,0,1,1,1,0,1],
  [1,3,1,0,1,1,1,1],
  [0,1,1,1,0,1,2,0],
  [1,1,0,1,1,0,1,1],
  [1,0,1,2,1,1,0,1],
  [0,1,1,1,0,1,1,0],
  [1,1,0,0,1,3,1,1],
  [1,0,1,1,1,1,0,1],
  [0,1,1,0,1,0,1,1],
  [1,1,1,1,0,1,1,0],
  [1,0,1,1,1,1,1,1],
  [0,1,0,1,2,1,0,1],
  [1,1,1,0,1,1,1,1],
  [1,1,1,1,1,0,1,1],
];

// Level 3: THE TACTICAL GAUNTLET
// Central fortress with nested rooms and corridors. Steel border, inner chambers.
export const LEVEL3_TACTICAL_GAUNTLET: number[][] = [
  [2,2,2,2,2,2,2,2],
  [2,1,1,0,0,1,1,2],
  [2,1,0,0,0,0,1,2],
  [2,0,0,1,1,0,0,2],
  [2,0,1,2,2,1,0,2],
  [2,0,1,2,2,1,0,2],
  [2,0,0,1,1,0,0,2],
  [2,1,0,0,0,0,1,2],
  [2,1,1,0,0,1,1,2],
  [2,0,0,0,0,0,0,2],
  [2,1,1,2,2,1,1,2],
  [2,1,1,0,0,1,1,2],
  [2,1,1,1,1,1,1,2],
  [2,2,2,2,2,2,2,2],
];

// Level 4: THE DIAMOND VAULT
// Large diamond shape with nested accent core. Symmetrical, centered.
export const LEVEL4_DIAMOND_VAULT: number[][] = [
  [0,0,0,1,1,0,0,0],
  [0,0,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,0],
  [1,1,1,0,0,1,1,1],
  [1,1,0,1,1,0,1,1],
  [1,1,0,1,1,0,1,1],
  [1,1,1,0,0,1,1,1],
  [0,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
];

// Level 5: THE SPIRAL MAZE
// Concentric rectangles forming a spiral/maze. Steel walls, open path.
export const LEVEL5_SPIRAL_MAZE: number[][] = [
  [2,2,2,2,2,2,2,2],
  [2,0,0,0,0,0,0,2],
  [2,0,2,2,2,2,0,2],
  [2,0,2,1,1,2,0,2],
  [2,0,2,1,1,2,0,2],
  [2,0,2,2,2,2,0,2],
  [2,0,0,0,0,0,0,2],
  [2,2,2,2,2,2,2,2],
  [0,0,0,0,0,0,0,0],
  [1,1,1,0,0,1,1,1],
  [2,2,0,0,0,0,2,2],
  [2,0,0,1,1,0,0,2],
  [2,0,1,1,1,1,0,2],
  [2,2,2,2,2,2,2,2],
];

// Level 6: TACTICAL ARCHWAYS
// Dense rows at top, tall pillars going down with gaps between. Archway structure.
export const LEVEL6_TACTICAL_ARCHWAYS: number[][] = [
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [2,0,2,0,2,0,2,0],
  [1,0,1,0,1,0,1,0],
  [1,0,1,0,1,0,1,0],
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

// Level 7: THE GAPS MATRIX
// Dense grid with random blocks missing. Asymmetric, challenging coverage.
export const LEVEL7_GAPS_MATRIX: number[][] = [
  [1,1,0,1,1,1,0,1],
  [1,0,1,1,0,1,1,1],
  [1,1,1,0,1,0,1,1],
  [0,1,1,1,1,1,0,1],
  [1,1,0,1,0,1,1,0],
  [1,0,1,1,1,0,1,1],
  [0,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,1],
  [1,0,1,1,1,1,1,0],
  [0,1,0,1,1,0,1,1],
  [1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,1,0],
  [0,1,1,1,1,1,0,1],
  [1,1,0,1,1,1,1,1],
];

// Level 8: HUMAN FACE (SIMPLE)
// Recognizable face with eyes, nose, mouth. Oval head shape.
export const LEVEL8_HUMAN_FACE: number[][] = [
  [0,0,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1],
  [1,1,0,1,1,0,1,1],
  [1,1,0,1,1,0,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,0,0,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1],
  [1,1,0,0,0,0,1,1],
  [0,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,0,0],
  [0,0,0,1,1,0,0,0],
];

// Level 9: POWER CORE REACTOR
// Almost completely filled. Explosive core in center, high density everywhere.
export const LEVEL9_POWER_CORE: number[][] = [
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,3,3,1,1,1],
  [1,1,3,3,3,3,1,1],
  [1,1,3,3,3,3,1,1],
  [1,1,1,3,3,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,3,1,1,3,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
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
