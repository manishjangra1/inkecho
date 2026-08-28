import { describe, it, expect } from 'vitest';
import {
  calculateRemainingSeconds,
  isTimerExpired,
} from './timer-calculator';
import { calculatePauseRemainingMs, calculateResumeTurnEndsAt } from './timer-rules';

describe('Timer Calculator & Rules', () => {
  it('calculates remaining seconds accurately', () => {
    const ends = new Date('2026-08-28T12:01:30.000Z');
    const now = new Date('2026-08-28T12:01:00.000Z');
    expect(calculateRemainingSeconds(ends, now)).toBe(30);

    const past = new Date('2026-08-28T12:02:00.000Z');
    expect(calculateRemainingSeconds(ends, past)).toBe(0);
  });

  it('checks timer expiration', () => {
    const ends = new Date('2026-08-28T12:01:00.000Z');
    expect(isTimerExpired(ends, new Date('2026-08-28T12:00:59.000Z'))).toBe(false);
    expect(isTimerExpired(ends, new Date('2026-08-28T12:01:00.000Z'))).toBe(true);
    expect(isTimerExpired(ends, new Date('2026-08-28T12:01:01.000Z'))).toBe(true);
  });

  it('handles pause remaining and resume turn ends correctly', () => {
    const ends = new Date('2026-08-28T12:01:00.000Z');
    const paused = new Date('2026-08-28T12:00:40.000Z');
    const remainingMs = calculatePauseRemainingMs(ends, paused);
    expect(remainingMs).toBe(20000);

    const resumed = new Date('2026-08-28T12:05:00.000Z');
    const newEnds = calculateResumeTurnEndsAt(remainingMs, resumed);
    expect(newEnds.toISOString()).toBe('2026-08-28T12:05:20.000Z');
  });
});
