import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('merges class names and handles conditional classes', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
    expect(cn('p-4', false && 'm-2', true && 'rounded-lg')).toBe('p-4 rounded-lg');
  });

  it('resolves tailwind conflicts via tailwind-merge', () => {
    expect(cn('p-2 p-4')).toBe('p-4');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
});
