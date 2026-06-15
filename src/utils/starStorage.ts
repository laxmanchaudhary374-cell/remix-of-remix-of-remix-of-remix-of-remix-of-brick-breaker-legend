const STARS_KEY = 'neon_breaker_level_stars';

export interface LevelStars {
  [level: number]: number; // 1-3 stars
}

export const getStoredStars = (): LevelStars => {
  try {
    return JSON.parse(localStorage.getItem(STARS_KEY) || '{}');
  } catch {
    return {};
  }
};

export const setLevelStars = (level: number, stars: number) => {
  try {
    const stored = getStoredStars();
    // Only save if better than existing
    if (!stored[level] || stars > stored[level]) {
      stored[level] = stars;
      localStorage.setItem(STARS_KEY, JSON.stringify(stored));
    }
  } catch (e) {
    console.warn('[StarStorage] Failed to save level stars:', e);
  }
};

export const getLevelStars = (level: number): number => {
  return getStoredStars()[level] || 0;
};

export const getTotalStars = (): number => {
  const stored = getStoredStars();
  return Object.values(stored).reduce((sum, s) => sum + s, 0);
};

// Stars based on lives remaining (started with 3):
// 3 stars: no lives lost • 2 stars: lost 1 life • 1 star: lost 2+ lives
export const calculateStars = (lives: number, _maxCombo: number, _score: number, _level: number): number => {
  if (lives >= 3) return 3;
  if (lives === 2) return 2;
  return 1;
};
