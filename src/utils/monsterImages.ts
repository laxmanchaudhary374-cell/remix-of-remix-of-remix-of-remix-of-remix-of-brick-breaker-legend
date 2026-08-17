// The 15 boss artworks used for monster (every 10th) levels.

import crystalSkull from '@/assets/monsters/crystal-skull.jpg';
import hornedDemon from '@/assets/monsters/horned-demon.webp';
import stoneGolem from '@/assets/monsters/stone-golem.webp';
import voidDragon from '@/assets/monsters/void-dragon.webp';
import cyclops from '@/assets/monsters/cyclops.webp';
import cosmicSkull from '@/assets/monsters/cosmic-skull.jpg';
import goldenSkull from '@/assets/monsters/golden-skull.webp';
import lavaSkull from '@/assets/monsters/lava-skull.webp';
import crystalSkull2 from '@/assets/monsters/crystal-skull-2.webp';
import stoneHornedDemon from '@/assets/monsters/stone-horned-demon.webp';
import lavaDragon from '@/assets/monsters/lava-dragon.webp';
import grinningGolem from '@/assets/monsters/grinning-golem.webp';
import iceGolem from '@/assets/monsters/ice-golem.webp';
import goldenDragon from '@/assets/monsters/golden-dragon.webp';
import cyanSkull from '@/assets/monsters/cyan-skull.webp';

export interface MonsterArt {
  name: string;
  url: string;
}

export const MONSTER_ART: MonsterArt[] = [
  { name: 'CRYSTAL SKULL', url: crystalSkull },
  { name: 'HORNED DEMON', url: hornedDemon },
  { name: 'STONE GOLEM', url: stoneGolem },
  { name: 'VOID DRAGON', url: voidDragon },
  { name: 'CYCLOPS', url: cyclops },
  { name: 'COSMIC REAPER', url: cosmicSkull },
  { name: 'GOLDEN SKULL', url: goldenSkull },
  { name: 'LAVA SKULL', url: lavaSkull },
  { name: 'CRYSTAL WRAITH', url: crystalSkull2 },
  { name: 'STONE TITAN', url: stoneHornedDemon },
  { name: 'MAGMA DRAKE', url: lavaDragon },
  { name: 'GRINNING GOLEM', url: grinningGolem },
  { name: 'FROST GOLEM', url: iceGolem },
  { name: 'GOLDEN DRAGON', url: goldenDragon },
  { name: 'VOID SKULL', url: cyanSkull },
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
