import bg1 from '@/assets/backgrounds/bg1.jpg';
import bg2 from '@/assets/backgrounds/bg2.jpg';
import bg3 from '@/assets/backgrounds/bg3.jpg';
import bg4 from '@/assets/backgrounds/bg4.jpg';
import bg5 from '@/assets/backgrounds/bg5.jpg';
import bg6 from '@/assets/backgrounds/bg6.jpg';
import bg7 from '@/assets/backgrounds/bg7.jpg';
import bg8 from '@/assets/backgrounds/bg8.jpg';
import bg9 from '@/assets/backgrounds/bg9.jpg';
import bg10 from '@/assets/backgrounds/bg10.jpg';

const BACKGROUNDS = [
  bg1, bg2, bg3, bg4, bg5,
  bg6, bg7, bg8, bg9, bg10
];

export function getWorldBg(level: number): string {
  const index = Math.floor((level - 1) / 20) % 10;
  return BACKGROUNDS[index];
}

// Decoded-image cache so a level start never shows an empty background
const imageCache = new Map<string, HTMLImageElement>();

export function getWorldBgImage(level: number): HTMLImageElement {
  const src = getWorldBg(level);
  let img = imageCache.get(src);
  if (!img) {
    img = new Image();
    img.decoding = 'sync';
    img.src = src;
    imageCache.set(src, img);
  }
  return img;
}

// Warm up every world background up-front (they are bundled assets)
export function preloadAllWorldBgs(): void {
  BACKGROUNDS.forEach(src => {
    if (!imageCache.has(src)) {
      const img = new Image();
      img.src = src;
      imageCache.set(src, img);
    }
  });
}

if (typeof window !== 'undefined') {
  preloadAllWorldBgs();
}