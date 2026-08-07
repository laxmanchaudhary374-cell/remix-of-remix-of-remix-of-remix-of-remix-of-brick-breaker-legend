// Professional structured brick-pattern engine.
// Every pattern is built from an intentional geometric family
// (frames, tunnels, arches, towers, windows, crosses, eyes, ladders...),
// so layouts always read as "designed" instead of random noise.
//
// Grid values: 0 = empty, 1 = normal brick, 2 = steel, 3 = explosive

import { isGoodPattern, getFillRatio } from './cleanPatterns';

const COLS = 8;

/** Deterministic pseudo-random generator so a level always looks the same. */
const rng = (seed: number) => {
  let s = (seed * 2654435761) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const blank = (rows: number): number[][] =>
  Array.from({ length: rows }, () => Array(COLS).fill(0));

/** Mirror the left half onto the right half so every pattern is symmetric. */
const mirror = (g: number[][]): number[][] =>
  g.map(row => {
    const out = row.slice();
    for (let c = 0; c < COLS / 2; c++) out[COLS - 1 - c] = out[c];
    return out;
  });

const rect = (g: number[][], r0: number, r1: number, c0: number, c1: number, v = 1) => {
  for (let r = Math.max(0, r0); r <= Math.min(g.length - 1, r1); r++)
    for (let c = Math.max(0, c0); c <= Math.min(COLS - 1, c1); c++) g[r][c] = v;
};

const outline = (g: number[][], r0: number, r1: number, c0: number, c1: number, v = 1) => {
  rect(g, r0, r0, c0, c1, v);
  rect(g, r1, r1, c0, c1, v);
  rect(g, r0, r1, c0, c0, v);
  rect(g, r0, r1, c1, c1, v);
};

type Family = (rows: number, v: number) => number[][];

// 1. Frames — single, double or triple concentric rectangles
const familyFrame: Family = (rows, v) => {
  const g = blank(rows);
  const rings = 1 + (v % 3);
  const step = Math.max(2, Math.floor(rows / (rings * 3)));
  for (let i = 0; i < rings; i++) {
    const r0 = i * step;
    const r1 = rows - 1 - i * step;
    const c0 = i;
    const c1 = COLS - 1 - i;
    if (r1 - r0 < 2 || c1 - c0 < 2) break;
    outline(g, r0, r1, c0, c1, i === 1 ? 2 : 1);
  }
  return g;
};

// 2. Tunnels — vertical corridors the ball can travel through
const familyTunnel: Family = (rows, v) => {
  const g = blank(rows);
  const layouts = [
    [0, 1, 3, 4, 6, 7],
    [0, 1, 2, 5, 6, 7],
    [1, 2, 3, 4, 5, 6],
    [0, 2, 3, 4, 5, 7],
  ];
  const cols = layouts[v % layouts.length];
  for (const c of cols) rect(g, 0, rows - 1, c, c);
  // Cross-beams so it isn't just plain lines
  const beam = Math.max(2, Math.floor(rows / 4));
  for (let r = beam; r < rows; r += beam) rect(g, r, r, 0, COLS - 1, r % (beam * 2) === 0 ? 1 : 2);
  return g;
};

// 3. Horizontal bars with staggered gaps
const familyBars: Family = (rows, v) => {
  const g = blank(rows);
  let i = 0;
  for (let r = 0; r < rows; r += 2, i++) {
    const gapStart = (v + i) % 2 === 0 ? 3 : 1;
    rect(g, r, r, 0, COLS - 1);
    rect(g, r, r, gapStart, gapStart + 1, 0);
    if ((v + i) % 3 === 0) rect(g, r, r, COLS - 1 - gapStart - 1, COLS - 1 - gapStart, 0);
  }
  return g;
};

// 4. Arch / gateway
const familyArch: Family = (rows, v) => {
  const g = blank(rows);
  const thick = 1 + (v % 2);
  rect(g, 0, thick, 0, COLS - 1);
  rect(g, thick + 1, rows - 1, 0, thick);
  rect(g, thick + 1, rows - 1, COLS - 1 - thick, COLS - 1);
  const mid = Math.floor(rows / 2);
  rect(g, mid, mid + 1, thick + 2, COLS - 3 - thick, 2);
  return g;
};

// 5. Towers with base
const familyTowers: Family = (rows, v) => {
  const g = blank(rows);
  const count = 2 + (v % 2); // 2 or 3 towers
  const base = rows - 2;
  if (count === 2) {
    rect(g, 0, base - 1, 0, 1);
    rect(g, 0, base - 1, COLS - 2, COLS - 1);
    rect(g, Math.floor(rows / 3), base - 1, 3, 4, 2);
  } else {
    rect(g, 0, base - 1, 0, 1);
    rect(g, 0, base - 1, COLS - 2, COLS - 1);
    rect(g, Math.floor(rows / 4), base - 1, 3, 4);
  }
  rect(g, base, rows - 1, 0, COLS - 1);
  return g;
};

// 6. Window grid — blocks separated by clean channels
const familyWindows: Family = (rows, v) => {
  const g = blank(rows);
  const blockH = 2 + (v % 2);
  for (let r = 0; r < rows; r += blockH + 1) {
    for (const c of [0, 3, 6]) {
      rect(g, r, r + blockH - 1, c, c + 1);
    }
  }
  return g;
};

// 7. Cross / plus
const familyCross: Family = (rows, v) => {
  const g = blank(rows);
  const armR = Math.floor(rows / 2);
  const w = 1 + (v % 2);
  rect(g, armR - w, armR + w, 0, COLS - 1);
  rect(g, 0, rows - 1, 3, 4);
  if (v % 3 === 0) {
    rect(g, 0, 0, 0, COLS - 1, 2);
    rect(g, rows - 1, rows - 1, 0, COLS - 1, 2);
  }
  return g;
};

// 8. X / diagonals
const familyX: Family = (rows, v) => {
  const g = blank(rows);
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1);
    const c = Math.round(t * (COLS - 1));
    g[r][c] = 1;
    g[r][COLS - 1 - c] = 1;
    if (v % 2 === 0) {
      if (c + 1 < COLS) g[r][c + 1] = 1;
      if (COLS - 2 - c >= 0) g[r][COLS - 2 - c] = 1;
    }
  }
  rect(g, 0, 0, 0, COLS - 1);
  rect(g, rows - 1, rows - 1, 0, COLS - 1);
  return g;
};

// 9. Diamond outline
const familyDiamond: Family = (rows, v) => {
  const g = blank(rows);
  const mid = (rows - 1) / 2;
  for (let r = 0; r < rows; r++) {
    const spread = 1 - Math.abs(r - mid) / mid;
    const half = Math.round(spread * 3.5);
    const c0 = 3 - half;
    const c1 = 4 + half;
    g[r][Math.max(0, c0)] = 1;
    g[r][Math.min(COLS - 1, c1)] = 1;
    if (v % 2 === 1) {
      g[r][Math.max(0, c0 + 1)] = 1;
      g[r][Math.min(COLS - 1, c1 - 1)] = 1;
    }
  }
  rect(g, Math.floor(mid), Math.ceil(mid), 3, 4, 2);
  return g;
};

// 10. Chevrons
const familyChevron: Family = (rows, v) => {
  const g = blank(rows);
  const period = 4 + (v % 3);
  for (let r = 0; r < rows; r++) {
    const p = r % period;
    const half = Math.min(3, p);
    g[r][3 - half] = 1;
    g[r][4 + half] = 1;
    g[r][Math.max(0, 3 - half + 1)] = 1;
    g[r][Math.min(COLS - 1, 4 + half - 1)] = 1;
  }
  return g;
};

// 11. Eye — ring with pupil
const familyEye: Family = (rows, v) => {
  const g = blank(rows);
  const cr = (rows - 1) / 2;
  const cc = 3.5;
  const rad = Math.min(cr, 3.6);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      const d = Math.sqrt(Math.pow((r - cr) / cr, 2) * rad * rad + Math.pow(c - cc, 2));
      if (Math.abs(d - rad) < 0.8) g[r][c] = 1;
      if (d < 1.2) g[r][c] = v % 2 === 0 ? 2 : 1;
    }
  }
  return g;
};

// 12. Hollow stepped pyramid
const familyPyramid: Family = (rows, v) => {
  const g = blank(rows);
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1);
    const half = Math.round(t * 3.5);
    const c0 = 3 - half;
    const c1 = 4 + half;
    g[r][Math.max(0, c0)] = 1;
    g[r][Math.min(COLS - 1, c1)] = 1;
  }
  rect(g, rows - 1, rows - 1, 0, COLS - 1, v % 2 === 0 ? 1 : 2);
  rect(g, 0, 0, 3, 4);
  return g;
};

// 13. Snake corridor
const familySnake: Family = (rows, v) => {
  const g = blank(rows);
  const band = 3;
  let i = 0;
  for (let r = 0; r < rows; r += band, i++) {
    const leftGap = (i + v) % 2 === 0;
    rect(g, r, Math.min(rows - 1, r + band - 2), 0, COLS - 1);
    if (leftGap) rect(g, r, Math.min(rows - 1, r + band - 2), 0, 1, 0);
    else rect(g, r, Math.min(rows - 1, r + band - 2), COLS - 2, COLS - 1, 0);
  }
  return g;
};

// 14. Checker blocks (2x2)
const familyChecker: Family = (rows, v) => {
  const g = blank(rows);
  for (let r = 0; r < rows; r += 2) {
    for (let c = 0; c < COLS; c += 2) {
      if (((r / 2) + (c / 2) + v) % 2 === 0) rect(g, r, r + 1, c, c + 1);
    }
  }
  return g;
};

// 15. Hourglass
const familyHourglass: Family = (rows, v) => {
  const g = blank(rows);
  const mid = (rows - 1) / 2;
  for (let r = 0; r < rows; r++) {
    const t = Math.abs(r - mid) / mid;
    const half = Math.round(t * 3.5);
    const c0 = 3 - half;
    const c1 = 4 + half;
    g[r][Math.max(0, c0)] = 1;
    g[r][Math.min(COLS - 1, c1)] = 1;
    if (v % 2 === 0) {
      g[r][Math.max(0, c0 + 1)] = 1;
      g[r][Math.min(COLS - 1, c1 - 1)] = 1;
    }
  }
  rect(g, 0, 0, 0, COLS - 1);
  rect(g, rows - 1, rows - 1, 0, COLS - 1);
  return g;
};

// 16. Brackets — strong sides, open center with a floating core
const familyBrackets: Family = (rows, v) => {
  const g = blank(rows);
  rect(g, 0, rows - 1, 0, 1);
  rect(g, 0, rows - 1, COLS - 2, COLS - 1);
  rect(g, 0, 0, 0, COLS - 1);
  rect(g, rows - 1, rows - 1, 0, COLS - 1);
  const mid = Math.floor(rows / 2);
  const h = 1 + (v % 2);
  rect(g, mid - h, mid + h, 3, 4, 2);
  return g;
};

// 17. Ladder — rails plus rungs
const familyLadder: Family = (rows, v) => {
  const g = blank(rows);
  rect(g, 0, rows - 1, 1, 1);
  rect(g, 0, rows - 1, COLS - 2, COLS - 2);
  const step = 2 + (v % 2);
  for (let r = 0; r < rows; r += step) rect(g, r, r, 2, COLS - 3);
  return g;
};

// 18. Concentric spiral arms
const familySpiral: Family = (rows, v) => {
  const g = blank(rows);
  let r0 = 0, r1 = rows - 1, c0 = 0, c1 = COLS - 1;
  let turn = 0;
  while (r1 - r0 >= 2 && c1 - c0 >= 2) {
    rect(g, r0, r0, c0, c1, turn % 2 === 0 ? 1 : 2);
    rect(g, r0, r1, c1, c1);
    r0 += 2;
    c0 += 1 + (v % 2);
    r1 -= 2;
    c1 -= 1;
    turn++;
  }
  return g;
};

// 19. Twin windows / fortress rooms
const familyRooms: Family = (rows, v) => {
  const g = blank(rows);
  const half = Math.floor(rows / 2) - 1;
  outline(g, 0, half, 0, 3);
  outline(g, 0, half, 4, COLS - 1);
  outline(g, half + 2, rows - 1, 1, COLS - 2, v % 2 === 0 ? 1 : 2);
  return g;
};

// 20. Wave bands
const familyWave: Family = (rows, v) => {
  const g = blank(rows);
  const amp = 2 + (v % 2);
  for (let c = 0; c < COLS; c++) {
    const phase = Math.sin((c / COLS) * Math.PI * 2 + v);
    const center = Math.floor(rows / 2 + phase * amp);
    for (let d = -2; d <= 2; d++) {
      const r = center + d;
      if (r >= 0 && r < rows) g[r][c] = 1;
    }
  }
  rect(g, 0, 0, 0, COLS - 1);
  rect(g, rows - 1, rows - 1, 0, COLS - 1);
  return g;
};

const FAMILIES: { name: string; fn: Family; symmetric: boolean }[] = [
  { name: 'FRAME', fn: familyFrame, symmetric: true },
  { name: 'TUNNEL', fn: familyTunnel, symmetric: false },
  { name: 'BARS', fn: familyBars, symmetric: false },
  { name: 'ARCH', fn: familyArch, symmetric: true },
  { name: 'TOWERS', fn: familyTowers, symmetric: true },
  { name: 'WINDOWS', fn: familyWindows, symmetric: false },
  { name: 'CROSS', fn: familyCross, symmetric: true },
  { name: 'X-GATE', fn: familyX, symmetric: true },
  { name: 'DIAMOND', fn: familyDiamond, symmetric: true },
  { name: 'CHEVRON', fn: familyChevron, symmetric: true },
  { name: 'EYE', fn: familyEye, symmetric: true },
  { name: 'PYRAMID', fn: familyPyramid, symmetric: true },
  { name: 'CORRIDOR', fn: familySnake, symmetric: false },
  { name: 'BLOCKS', fn: familyChecker, symmetric: false },
  { name: 'HOURGLASS', fn: familyHourglass, symmetric: true },
  { name: 'VAULT', fn: familyBrackets, symmetric: true },
  { name: 'LADDER', fn: familyLadder, symmetric: true },
  { name: 'SPIRAL', fn: familySpiral, symmetric: false },
  { name: 'ROOMS', fn: familyRooms, symmetric: false },
  { name: 'WAVE', fn: familyWave, symmetric: false },
];

export const PRO_FAMILY_COUNT = FAMILIES.length;

/** Sprinkle a couple of accent bricks (steel / explosive) without adding noise. */
const addAccents = (g: number[][], seed: number) => {
  const rand = rng(seed + 991);
  let explosives = 0;
  for (let r = 1; r < g.length - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      if (g[r][c] !== 1) continue;
      const neighbours =
        (g[r - 1][c] > 0 ? 1 : 0) + (g[r + 1][c] > 0 ? 1 : 0) +
        (g[r][c - 1] > 0 ? 1 : 0) + (g[r][c + 1] > 0 ? 1 : 0);
      if (neighbours < 3) continue;
      const x = rand();
      if (explosives < 2 && x > 0.985) {
        g[r][c] = 3;
        explosives++;
      }
    }
  }
  return g;
};

/** Remove lone bricks that make a layout look noisy. */
const deIsolate = (g: number[][]) => {
  const rows = g.length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!g[r][c]) continue;
      const n =
        (r > 0 && g[r - 1][c] ? 1 : 0) + (r < rows - 1 && g[r + 1][c] ? 1 : 0) +
        (c > 0 && g[r][c - 1] ? 1 : 0) + (c < COLS - 1 && g[r][c + 1] ? 1 : 0);
      if (n === 0) {
        // Attach it to a neighbour instead of deleting, keeping the silhouette.
        if (c < COLS - 1) g[r][c + 1] = g[r][c];
        else if (c > 0) g[r][c - 1] = g[r][c];
        else g[r][c] = 0;
      }
    }
  }
  return g;
};

/**
 * Bring a layout into the pleasant 32-62% density window while keeping the
 * family's silhouette: thicken thin shapes, carve out over-solid ones.
 */
const repairDensity = (g: number[][]) => {
  const rows = g.length;
  const fill = () => getFillRatio(g);
  // Thicken: grow each filled cell sideways/downwards in passes.
  let guard = 0;
  while (fill() < 0.32 && guard++ < 6) {
    const snapshot = g.map(r => r.slice());
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!snapshot[r][c]) continue;
        const v = snapshot[r][c] === 2 ? 2 : 1;
        if (guard % 2 === 1) {
          if (c + 1 < COLS && !g[r][c + 1]) g[r][c + 1] = v;
          if (c > 0 && !g[r][c - 1]) g[r][c - 1] = v;
        } else if (r + 1 < rows && !g[r + 1][c]) {
          g[r + 1][c] = v;
        }
      }
    }
  }
  // Carve: punch a regular lattice of holes so the ball keeps travel lanes.
  guard = 0;
  while (fill() > 0.62 && guard++ < 6) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!g[r][c]) continue;
        if ((r + c * 2 + guard) % (3 + (guard % 2)) === 0) g[r][c] = 0;
      }
      if (fill() <= 0.62) break;
    }
  }
  return g;
};

/** Stretch a canonical 8-row design onto the level's row count (keeps density). */
const stretchRows = (g: number[][], target: number): number[][] => {
  const src = g.length;
  const out: number[][] = [];
  for (let r = 0; r < target; r++) {
    out.push(g[Math.min(src - 1, Math.floor((r * src) / target))].slice());
  }
  return out;
};

const CANON_ROWS = 8;

const build = (rows: number, familyIndex: number, variant: number, seed: number) => {
  const fam = FAMILIES[familyIndex % FAMILIES.length];
  let g = fam.fn(CANON_ROWS, variant);
  if (fam.symmetric) g = mirror(g);
  g = repairDensity(g);
  g = deIsolate(g);
  if (fam.symmetric) g = mirror(g);
  g = stretchRows(g, rows);
  g = addAccents(g, seed);
  return { grid: g, name: fam.name };
};

/**
 * Deterministic, high-quality structured pattern for a level.
 * Families are cycled with an offset so consecutive levels never
 * share a family, and variants change every pass through the list.
 */
export const getProPattern = (
  level: number,
  rows: number,
): { grid: number[][]; name: string } => {
  const safeRows = Math.max(8, Math.min(rows, 18));
  const cycle = Math.floor(level / FAMILIES.length);
  // Offset step of 7 (coprime with 20) shuffles the family order per cycle.
  const baseIndex = (level * 7 + cycle * 3) % FAMILIES.length;

  // Keep the intended family; only its variant changes if quality fails.
  for (let attempt = 0; attempt < 6; attempt++) {
    const variant = (cycle + attempt) % 6;
    const built = build(safeRows, baseIndex, variant, level * 31 + attempt);
    if (isGoodPattern(built.grid)) return built;
  }
  for (let attempt = 1; attempt < FAMILIES.length; attempt++) {
    const idx = (baseIndex + attempt) % FAMILIES.length;
    const built = build(safeRows, idx, cycle % 6, level * 31 + attempt);
    if (isGoodPattern(built.grid)) return built;
  }
  // Guaranteed-good fallback: classic double frame
  return build(safeRows, 0, 1, level);
};
