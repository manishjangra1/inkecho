import { describe, it, expect } from 'vitest';
import { getAvatarUrl, getDeterministicAvatarSvg, getInitials } from './avatar';

describe('avatar utilities', () => {
  it('generates a valid DiceBear SVG colorful people avatar URL', () => {
    const url = getAvatarUrl('Manish Jangra');
    expect(url).toContain('https://api.dicebear.com/9.x/avataaars/svg');
    expect(url).toContain('seed=Manish%20Jangra');
    expect(url).toContain('backgroundColor=');
  });

  it('generates consistent deterministic colorful people SVG data URI offline', () => {
    const svg1 = getDeterministicAvatarSvg('Alex');
    const svg2 = getDeterministicAvatarSvg('Alex');
    expect(svg1).toBe(svg2);
    expect(svg1).toContain('data:image/svg+xml');
  });

  it('extracts initials correctly', () => {
    expect(getInitials('Manish Jangra')).toBe('MJ');
    expect(getInitials('Player')).toBe('PL');
    expect(getInitials('')).toBe('P');
  });
});
