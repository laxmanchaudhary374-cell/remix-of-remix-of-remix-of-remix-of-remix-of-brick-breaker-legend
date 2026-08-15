// The 9 boss artworks used for monster (every 10th) levels.
// Images are served from the CDN via .asset.json pointers.

import crystalSkull from '@/assets/monsters/crystal-skull.jpg.asset.json';
import hornedDemon from '@/assets/monsters/horned-demon.webp.asset.json';
import stoneGolem from '@/assets/monsters/stone-golem.webp.asset.json';
import voidDragon from '@/assets/monsters/void-dragon.webp.asset.json';
import cyclops from '@/assets/monsters/cyclops.webp.asset.json';
import cosmicSkull from '@/assets/monsters/cosmic-skull.jpg.asset.json';
import goldenSkull from '@/assets/monsters/golden-skull.webp.asset.json';
import lavaSkull from '@/assets/monsters/lava-skull.webp.asset.json';
import crystalSkull2 from '@/assets/monsters/crystal-skull-2.webp.asset.json';

export interface MonsterArt {
  name: string;
  url: string;
}

export const MONSTER_ART: MonsterArt[] = [
  { name: 'CRYSTAL SKULL', url: crystalSkull.url },
  { name: 'HORNED DEMON', url: hornedDemon.url },
  { name: 'STONE GOLEM', url: stoneGolem.url },
  { name: 'VOID DRAGON', url: voidDragon.url },
  { name: 'CYCLOPS', url: cyclops.url },
  { name: 'COSMIC REAPER', url: cosmicSkull.url },
  { name: 'GOLDEN SKULL', url: goldenSkull.url },
  { name: 'LAVA SKULL', url: lavaSkull.url },
  { name: 'CRYSTAL WRAITH', url: crystalSkull2.url },
];

export const getMonsterArt = (level: number): MonsterArt =>
  MONSTER_ART[(Math.floor(level / 10) - 1 + MONSTER_ART.length * 100) % MONSTER_ART.length];

const cache = new Map<string, HTMLImageElement>();

export const getMonsterImage = (level: number): HTMLImageElement => {
  const { url } = getMonsterArt(level);
  let img = cache.get(url);
  if (!img) {
    img = new Image();
    img.src = url;
    cache.set(url, img);
  }
  return img;
};

/** Preload every boss artwork so monster levels never start blank. */
export const preloadMonsterImages = (): void => {
  MONSTER_ART.forEach(({ url }) => {
    if (cache.has(url)) return;
    const img = new Image();
    img.src = url;
    cache.set(url, img);
  });
};
