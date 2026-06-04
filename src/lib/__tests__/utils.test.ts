import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const isHidden = false;
    expect(cn('base', isHidden && 'hidden', 'visible')).toBe('base visible');
  });

  it('should merge tailwind classes correctly', () => {
    // tailwind-merge should resolve conflicting utilities
    const result = cn('px-4', 'px-6');
    expect(result).toBe('px-6');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
  });

  it('should handle undefined and null inputs', () => {
    expect(cn(undefined, null, 'foo')).toBe('foo');
  });
});
