import { describe, it, expect } from 'vitest';
import { getWorldForLevel, getWorldBg } from '@/utils/worldBackgrounds';

describe('getWorldForLevel', () => {
  it('should return Mercury for level 1', () => {
    const world = getWorldForLevel(1);
    expect(world.name).toBe('Mercury');
  });

  it('should return Mercury for level 20', () => {
    expect(getWorldForLevel(20).name).toBe('Mercury');
  });

  it('should return Venus for level 21', () => {
    expect(getWorldForLevel(21).name).toBe('Venus');
  });

  it('should return Earth for level 50', () => {
    expect(getWorldForLevel(50).name).toBe('Earth');
  });

  it('should return Mars for level 70', () => {
    expect(getWorldForLevel(70).name).toBe('Mars');
  });

  it('should return fallback (Pluto) for very high levels', () => {
    const world = getWorldForLevel(9999);
    expect(world.name).toBe('Pluto');
  });
});

describe('getWorldBg', () => {
  it('should return a WorldBg object with required properties', () => {
    const bg = getWorldBg(1);
    expect(bg.base).toBeDefined();
    expect(bg.inner).toBeDefined();
    expect(bg.inner.hue).toBeTypeOf('number');
    expect(bg.inner.sat).toBeTypeOf('number');
    expect(bg.inner.light).toBeTypeOf('number');
    expect(bg.glow1).toBeDefined();
    expect(bg.glow2).toBeDefined();
  });

  it('should return different backgrounds for different worlds', () => {
    const bg1 = getWorldBg(1);   // Mercury
    const bg30 = getWorldBg(30); // Venus
    expect(bg1.base).not.toBe(bg30.base);
  });
});
