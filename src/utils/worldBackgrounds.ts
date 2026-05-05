// Background gradient palette for each "world" (planet zone).
// All night-sky variants so bricks/ball remain readable.

export interface WorldBg {
  base: string; // CSS background for outer container
  // Three radial layers used inside canvas for procedural depth.
  inner: { hue: number; sat: number; light: number };
  glow1: string; // hsla
  glow2: string; // hsla
}

const WORLDS: { name: string; from: number; to: number; bg: WorldBg }[] = [
  { name: 'Mercury', from: 1, to: 20, bg: {
    base: 'radial-gradient(circle at 50% 30%, hsl(220,40%,10%), hsl(220,60%,3%))',
    inner: { hue: 220, sat: 30, light: 4 },
    glow1: 'hsla(30, 60%, 35%, 0.10)', glow2: 'hsla(220, 50%, 25%, 0.08)',
  }},
  { name: 'Venus', from: 21, to: 40, bg: {
    base: 'radial-gradient(circle at 50% 30%, hsl(30,50%,10%), hsl(15,70%,3%))',
    inner: { hue: 25, sat: 45, light: 5 },
    glow1: 'hsla(40, 80%, 40%, 0.14)', glow2: 'hsla(20, 70%, 30%, 0.10)',
  }},
  { name: 'Earth', from: 41, to: 60, bg: {
    base: 'radial-gradient(circle at 50% 30%, hsl(200,55%,10%), hsl(160,60%,3%))',
    inner: { hue: 200, sat: 50, light: 4 },
    glow1: 'hsla(160, 70%, 35%, 0.12)', glow2: 'hsla(210, 80%, 30%, 0.10)',
  }},
  { name: 'Mars', from: 61, to: 80, bg: {
    base: 'radial-gradient(circle at 50% 30%, hsl(10,55%,10%), hsl(0,70%,3%))',
    inner: { hue: 10, sat: 50, light: 4 },
    glow1: 'hsla(15, 80%, 40%, 0.14)', glow2: 'hsla(0, 70%, 25%, 0.10)',
  }},
  { name: 'Jupiter', from: 81, to: 120, bg: {
    base: 'radial-gradient(circle at 50% 30%, hsl(265,55%,10%), hsl(230,70%,3%))',
    inner: { hue: 260, sat: 50, light: 5 },
    glow1: 'hsla(280, 70%, 40%, 0.13)', glow2: 'hsla(220, 70%, 30%, 0.10)',
  }},
  { name: 'Saturn', from: 121, to: 160, bg: {
    base: 'radial-gradient(circle at 50% 30%, hsl(40,50%,10%), hsl(30,70%,3%))',
    inner: { hue: 40, sat: 45, light: 5 },
    glow1: 'hsla(45, 80%, 40%, 0.13)', glow2: 'hsla(30, 60%, 25%, 0.10)',
  }},
  { name: 'Uranus', from: 161, to: 200, bg: {
    base: 'radial-gradient(circle at 50% 30%, hsl(185,55%,10%), hsl(190,70%,3%))',
    inner: { hue: 185, sat: 50, light: 5 },
    glow1: 'hsla(180, 70%, 40%, 0.13)', glow2: 'hsla(195, 70%, 30%, 0.10)',
  }},
  { name: 'Neptune', from: 201, to: 260, bg: {
    base: 'radial-gradient(circle at 50% 30%, hsl(220,60%,8%), hsl(230,80%,2%))',
    inner: { hue: 220, sat: 60, light: 3 },
    glow1: 'hsla(210, 80%, 40%, 0.14)', glow2: 'hsla(230, 70%, 25%, 0.10)',
  }},
  { name: 'Pluto', from: 261, to: 340, bg: {
    base: 'radial-gradient(circle at 50% 30%, hsl(270,40%,7%), hsl(280,50%,2%))',
    inner: { hue: 270, sat: 35, light: 3 },
    glow1: 'hsla(275, 50%, 30%, 0.12)', glow2: 'hsla(260, 60%, 20%, 0.08)',
  }},
];

const FALLBACK = WORLDS[WORLDS.length - 1];

export const getWorldForLevel = (level: number) => {
  return WORLDS.find(w => level >= w.from && level <= w.to) || FALLBACK;
};

export const getWorldBg = (level: number): WorldBg => getWorldForLevel(level).bg;
