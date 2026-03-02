import { LevelConfig } from '@/types/game';
import { generateAllLevels } from './levelGenerator';

// Generate all 2000 levels dynamically
export const levels: LevelConfig[] = generateAllLevels();

export const getTotalLevels = () => levels.length;
