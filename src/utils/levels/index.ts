import { LevelConfig } from '@/types/game';
import { generateAllLevels } from './levelGenerator';

let cachedLevels: LevelConfig[] | null = null;

export const getLevels = (): LevelConfig[] => {
  if (!cachedLevels) {
    cachedLevels = generateAllLevels();
  }
  return cachedLevels;
};

export const getTotalLevels = () => getLevels().length;
