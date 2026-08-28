import { describe, it, expect } from 'vitest';
import { isValidRoomCode, generateRoomCode, normalizeRoomCode } from './room-code';

describe('RoomCode Value Object', () => {
  it('generates valid room codes of 6 characters', () => {
    const code = generateRoomCode();
    expect(code.length).toBe(6);
    expect(isValidRoomCode(code)).toBe(true);
  });

  it('validates correct room codes within allowed alphabet', () => {
    expect(isValidRoomCode('ABC234')).toBe(true);
    expect(isValidRoomCode('XYZ899')).toBe(true);
  });

  it('rejects invalid lengths or ambiguous characters', () => {
    expect(isValidRoomCode('ABC')).toBe(false);
    expect(isValidRoomCode('ABC1234')).toBe(false);
    expect(isValidRoomCode('ABC012')).toBe(false); // 0 and 1 are excluded from alphabet
    expect(isValidRoomCode('')).toBe(false);
  });

  it('normalizes room codes to uppercase and trimmed', () => {
    expect(normalizeRoomCode('  abc234  ')).toBe('ABC234');
  });
});
