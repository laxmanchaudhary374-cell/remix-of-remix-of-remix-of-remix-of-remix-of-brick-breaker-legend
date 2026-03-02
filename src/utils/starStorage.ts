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
  } catch {}
};

export const getLevelStars = (level: number): number => {
  return getStoredStars()[level] || 0;
};

export const getTotalStars = (): number => {
  const stored = getStoredStars();
  return Object.values(stored).reduce((sum, s) => sum + s, 0);
};

// Calculate star rating based on performance
export const calculateStars = (lives: number, maxCombo: number, score: number, level: number): number => {
  const baseScore = level * 500;
  const scoreRatio = Math.min(score / baseScore, 2);
  const livesBonus = lives === 3 ? 1 : lives === 2 ? 0.5 : 0;
  const comboBonus = Math.min((maxCombo || 0) / 10, 1);
  const totalScore = scoreRatio + livesBonus + comboBonus;
  
  if (totalScore >= 2.5) return 3;
  if (totalScore >= 1.5) return 2;
  return 1;
};
