import { describe, it, expect } from 'vitest';
import { simplifyPoints } from './stroke-simplifier';
import type { Point } from '../types/canvas.types';

describe('simplifyPoints (Douglas-Peucker)', () => {
  it('returns original array when points count is <= 2', () => {
    const points: Point[] = [
      { x: 0.1, y: 0.1, pressure: 0.5 },
      { x: 0.9, y: 0.9, pressure: 0.5 },
    ];
    const result = simplifyPoints(points, 0.01);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(points[0]);
    expect(result[1]).toEqual(points[1]);
  });

  it('eliminates collinear points along a straight line', () => {
    const points: Point[] = [
      { x: 0.0, y: 0.0, pressure: 0.5 },
      { x: 0.25, y: 0.25, pressure: 0.5 },
      { x: 0.5, y: 0.5, pressure: 0.5 },
      { x: 0.75, y: 0.75, pressure: 0.5 },
      { x: 1.0, y: 1.0, pressure: 0.5 },
    ];
    const result = simplifyPoints(points, 0.01);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(points[0]);
    expect(result[1]).toEqual(points[4]);
  });

  it('preserves significant inflection vertices', () => {
    const points: Point[] = [
      { x: 0.0, y: 0.0, pressure: 0.5 },
      { x: 0.5, y: 0.9, pressure: 0.5 }, // Significant spike
      { x: 1.0, y: 0.0, pressure: 0.5 },
    ];
    const result = simplifyPoints(points, 0.01);
    expect(result).toHaveLength(3);
    expect(result[1]?.y).toBe(0.9);
  });
});
