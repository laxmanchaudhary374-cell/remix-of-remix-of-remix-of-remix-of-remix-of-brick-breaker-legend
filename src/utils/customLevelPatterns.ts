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

// Level 2: GEMINI PATTERN 1 - FORTRESS FRAME
export const LEVEL2_GEMINI_PATTERN_1: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 5, 5, 5, 5, 0, 1],
  [1, 0, 5, 0, 0, 5, 0, 1],
  [1, 0, 5, 0, 3, 5, 0, 1],
  [1, 0, 5, 5, 5, 5, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 3: GEMINI PATTERN 2 - DIAMOND PYRAMID
export const LEVEL3_GEMINI_PATTERN_2: number[][] = [
  [0, 5, 5, 0, 0, 5, 5, 0],
  [5, 5, 5, 5, 5, 5, 5, 5],
  [5, 5, 5, 5, 5, 5, 5, 5],
  [0, 5, 5, 5, 5, 5, 5, 0],
  [0, 0, 5, 5, 5, 5, 0, 0],
  [0, 0, 1, 5, 5, 1, 0, 0],
  [0, 0, 0, 5, 5, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 4: GEMINI PATTERN 3 - CRYSTAL DIAMOND
export const LEVEL4_GEMINI_PATTERN_3: number[][] = [
  [0, 0, 0, 2, 2, 0, 0, 0],
  [0, 0, 2, 2, 2, 2, 0, 0],
  [0, 2, 2, 3, 3, 2, 2, 0],
  [2, 2, 3, 3, 3, 3, 2, 2],
  [2, 2, 3, 3, 3, 3, 2, 2],
  [0, 2, 2, 3, 3, 2, 2, 0],
  [0, 0, 2, 2, 2, 2, 0, 0],
  [0, 0, 0, 2, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 5: GEMINI PATTERN 4 - STAR BURST
export const LEVEL5_GEMINI_PATTERN_4: number[][] = [
  [0, 4, 0, 0, 0, 0, 4, 0],
  [4, 4, 4, 0, 0, 4, 4, 4],
  [4, 0, 4, 4, 4, 4, 0, 4],
  [4, 0, 0, 4, 4, 0, 0, 4],
  [0, 4, 4, 4, 4, 4, 4, 0],
  [0, 0, 2, 2, 2, 2, 0, 0],
  [0, 0, 2, 0, 0, 2, 0, 0],
  [0, 0, 2, 0, 0, 2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 6: GEMINI PATTERN 5 - CROSS PATTERN
export const LEVEL6_GEMINI_PATTERN_5: number[][] = [
  [3, 0, 0, 0, 0, 0, 0, 3],
  [0, 3, 0, 0, 0, 0, 3, 0],
  [0, 0, 3, 0, 0, 3, 0, 0],
  [0, 0, 0, 5, 5, 0, 0, 0],
  [0, 0, 0, 5, 5, 0, 0, 0],
  [0, 0, 3, 0, 0, 3, 0, 0],
  [0, 3, 0, 0, 0, 0, 3, 0],
  [3, 0, 0, 0, 0, 0, 0, 3],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 7: GEMINI PATTERN 6 - HOLLOW FRAME
export const LEVEL7_GEMINI_PATTERN_6: number[][] = [
  [5, 5, 5, 0, 0, 5, 5, 5],
  [5, 0, 0, 0, 0, 0, 0, 5],
  [5, 0, 4, 4, 4, 4, 0, 5],
  [5, 0, 4, 0, 0, 4, 0, 5],
  [5, 0, 4, 0, 0, 4, 0, 5],
  [5, 0, 4, 4, 4, 4, 0, 5],
  [5, 0, 0, 0, 0, 0, 0, 5],
  [5, 5, 5, 0, 0, 5, 5, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 8: GEMINI PATTERN 7 - PYRAMID LAYERS
export const LEVEL8_GEMINI_PATTERN_7: number[][] = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 2, 2, 1, 1, 0],
  [1, 1, 2, 2, 2, 2, 1, 1],
  [2, 2, 2, 3, 3, 2, 2, 2],
  [2, 2, 3, 3, 3, 3, 2, 2],
  [3, 3, 3, 3, 3, 3, 3, 3],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 9: GEMINI PATTERN 8 - NESTED FRAMES
export const LEVEL9_GEMINI_PATTERN_8: number[][] = [
  [0, 3, 3, 3, 3, 3, 3, 0],
  [3, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 4, 0, 0, 4, 0, 3],
  [3, 0, 0, 0, 0, 0, 0, 3],
  [3, 0, 2, 2, 2, 2, 0, 3],
  [3, 2, 0, 0, 0, 0, 2, 3],
  [0, 3, 3, 3, 3, 3, 3, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 10: GEMINI PATTERN 9 - INVERSE PYRAMID
export const LEVEL10_GEMINI_PATTERN_9: number[][] = [
  [5, 5, 5, 5, 5, 5, 5, 5],
  [0, 5, 5, 5, 5, 5, 5, 0],
  [0, 0, 5, 5, 5, 5, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 5, 5, 5, 5, 0, 0],
  [0, 5, 5, 5, 5, 5, 5, 0],
  [5, 5, 5, 5, 5, 5, 5, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Level 11: GEMINI PATTERN 10 - CHAOS MIX
export const LEVEL11_GEMINI_PATTERN_10: number[][] = [
  [4, 2, 1, 4, 2, 1, 4, 2],
  [1, 0, 4, 0, 4, 0, 1, 0],
  [2, 4, 0, 1, 0, 4, 0, 2],
  [4, 0, 1, 3, 1, 0, 4, 1],
  [1, 3, 0, 4, 0, 3, 0, 4],
  [2, 0, 4, 0, 4, 0, 2, 0],
  [4, 1, 2, 1, 2, 1, 0, 4],
  [1, 4, 1, 4, 1, 4, 2, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

export const CUSTOM_LEVEL_PATTERNS: number[][][] = [
  LEVEL1_WINDING_SERPENT,
  LEVEL2_GEMINI_PATTERN_1,
  LEVEL3_GEMINI_PATTERN_2,
  LEVEL4_GEMINI_PATTERN_3,
  LEVEL5_GEMINI_PATTERN_4,
  LEVEL6_GEMINI_PATTERN_5,
  LEVEL7_GEMINI_PATTERN_6,
  LEVEL8_GEMINI_PATTERN_7,
  LEVEL9_GEMINI_PATTERN_8,
  LEVEL10_GEMINI_PATTERN_9,
  LEVEL11_GEMINI_PATTERN_10,
];



// Level 3: THE TACTICAL GAUNTLET
// Central fortress with nested rooms and corridors. Steel border, inner chambers.
export const LEVEL3_TACTICAL_GAUNTLET: 
