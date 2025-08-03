import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Basic Configuration Test', () => {
  it('should import utility functions correctly', () => {
    // Test the cn utility function
    const result = cn('base-class', 'additional-class');
    expect(result).toBe('base-class additional-class');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'not-included');
    expect(result).toBe('base conditional');
  });

  it('should verify TypeScript types are working', () => {
    const testString: string = 'test';
    const testNumber: number = 42;
    const testBoolean: boolean = true;
    
    expect(typeof testString).toBe('string');
    expect(typeof testNumber).toBe('number');
    expect(typeof testBoolean).toBe('boolean');
  });
});