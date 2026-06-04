import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStoredStars,
  setLevelStars,
  getLevelStars,
  getTotalStars,
  calculateStars,
} from '@/utils/starStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((_i: number) => null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('starStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // getStoredStars
  // -----------------------------------------------------------------------
  describe('getStoredStars', () => {
    it('should return empty object when nothing stored', () => {
      expect(getStoredStars()).toEqual({});
    });

    it('should return parsed stars from localStorage', () => {
      localStorageMock.setItem('neon_breaker_level_stars', JSON.stringify({ 1: 3, 2: 2 }));
      expect(getStoredStars()).toEqual({ 1: 3, 2: 2 });
    });

    it('should return empty object on invalid JSON', () => {
      localStorageMock.setItem('neon_breaker_level_stars', 'not-json');
      expect(getStoredStars()).toEqual({});
    });
  });

  // -----------------------------------------------------------------------
  // setLevelStars
  // -----------------------------------------------------------------------
  describe('setLevelStars', () => {
    it('should save stars for a level', () => {
      setLevelStars(1, 3);
      const stored = JSON.parse(localStorageMock.getItem('neon_breaker_level_stars')!);
      expect(stored[1]).toBe(3);
    });

    it('should only save if stars are better', () => {
      setLevelStars(1, 3);
      setLevelStars(1, 2); // worse
      const stored = JSON.parse(localStorageMock.getItem('neon_breaker_level_stars')!);
      expect(stored[1]).toBe(3); // still 3
    });

    it('should upgrade stars if better', () => {
      setLevelStars(1, 1);
      setLevelStars(1, 3);
      const stored = JSON.parse(localStorageMock.getItem('neon_breaker_level_stars')!);
      expect(stored[1]).toBe(3);
    });
  });

  // -----------------------------------------------------------------------
  // getLevelStars
  // -----------------------------------------------------------------------
  describe('getLevelStars', () => {
    it('should return 0 for a level with no stars', () => {
      expect(getLevelStars(99)).toBe(0);
    });

    it('should return stored stars', () => {
      setLevelStars(5, 2);
      expect(getLevelStars(5)).toBe(2);
    });
  });

  // -----------------------------------------------------------------------
  // getTotalStars
  // -----------------------------------------------------------------------
  describe('getTotalStars', () => {
    it('should return 0 when nothing stored', () => {
      expect(getTotalStars()).toBe(0);
    });

    it('should sum all stored stars', () => {
      setLevelStars(1, 3);
      setLevelStars(2, 2);
      setLevelStars(3, 1);
      expect(getTotalStars()).toBe(6);
    });
  });

  // -----------------------------------------------------------------------
  // calculateStars
  // -----------------------------------------------------------------------
  describe('calculateStars', () => {
    it('should return 3 stars when all lives remain', () => {
      expect(calculateStars(3, 0, 0, 1)).toBe(3);
    });

    it('should return 3 stars when lives >= 3', () => {
      expect(calculateStars(5, 0, 0, 1)).toBe(3);
    });

    it('should return 2 stars when 2 lives remain', () => {
      expect(calculateStars(2, 0, 0, 1)).toBe(2);
    });

    it('should return 1 star when 1 life remains', () => {
      expect(calculateStars(1, 0, 0, 1)).toBe(1);
    });

    it('should return 1 star when 0 lives remain', () => {
      expect(calculateStars(0, 0, 0, 1)).toBe(1);
    });
  });
});
