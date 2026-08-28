import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, mapResult, mapErr, unwrap, unwrapOr } from './result';

describe('Result type utilities', () => {
  it('creates ok result and verifies predicates', () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
    expect(unwrap(result)).toBe(42);
    expect(unwrapOr(result, 0)).toBe(42);
  });

  it('creates err result and verifies predicates', () => {
    const error = new Error('fail');
    const result = err(error);
    expect(result.ok).toBe(false);
    expect(isOk(result)).toBe(false);
    expect(isErr(result)).toBe(true);
    expect(() => unwrap(result)).toThrow('fail');
    expect(unwrapOr(result, 100)).toBe(100);
  });

  it('maps ok result correctly', () => {
    const result = ok(10);
    const mapped = mapResult(result, (x) => x * 2);
    expect(unwrap(mapped)).toBe(20);
  });

  it('maps err result correctly', () => {
    const result = err('bad');
    const mapped = mapErr(result, (msg) => `${msg}!`);
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error).toBe('bad!');
    }
  });
});
