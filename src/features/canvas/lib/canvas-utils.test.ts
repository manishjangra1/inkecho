import { describe, it, expect } from 'vitest';
import { getNormalizedPointerPos, computeStrokeBoundingBox, isEmptyCanvas } from './canvas-utils';
import type { Stroke } from '../types/canvas.types';

describe('canvas-utils', () => {
  it('normalizes pointer coordinates within 0..1 bounding box', () => {
    const mockRect = {
      left: 100,
      top: 50,
      width: 400,
      height: 300,
      right: 500,
      bottom: 350,
    } as DOMRect;

    const point = getNormalizedPointerPos(300, 200, mockRect, 0.8);
    expect(point.x).toBe(0.5); // (300 - 100) / 400 = 0.5
    expect(point.y).toBe(0.5); // (200 - 50) / 300 = 0.5
    expect(point.pressure).toBe(0.8);
  });

  it('clamps coordinates to 0..1 when pointer is dragged outside canvas bounds', () => {
    const mockRect = {
      left: 100,
      top: 50,
      width: 400,
      height: 300,
    } as DOMRect;

    const point = getNormalizedPointerPos(50, 400, mockRect, 0.5);
    expect(point.x).toBe(0);
    expect(point.y).toBe(1);
  });

  it('computes correct bounding box for brush strokes', () => {
    const strokes: Stroke[] = [
      {
        id: 's1',
        tool: 'brush',
        color: '#FFFFFF',
        size: 4,
        points: [
          { x: 0.2, y: 0.3, pressure: 0.5 },
          { x: 0.8, y: 0.7, pressure: 0.5 },
        ],
        timestamp: Date.now(),
      },
    ];

    const bbox = computeStrokeBoundingBox(strokes);
    expect(bbox).toEqual({
      minX: 0.2,
      minY: 0.3,
      maxX: 0.8,
      maxY: 0.7,
    });
  });

  it('detects empty canvas when no strokes are present', () => {
    expect(isEmptyCanvas([])).toBe(true);
  });

  it('detects empty canvas when only eraser strokes exist', () => {
    const eraserOnly: Stroke[] = [
      {
        id: 'e1',
        tool: 'eraser',
        color: '#000000',
        size: 16,
        points: [{ x: 0.5, y: 0.5, pressure: 0.5 }],
        timestamp: Date.now(),
      },
    ];
    expect(isEmptyCanvas(eraserOnly)).toBe(true);
  });

  it('returns false for non-empty drawings with visible brush strokes', () => {
    const validDrawing: Stroke[] = [
      {
        id: 's1',
        tool: 'brush',
        color: '#EF4444',
        size: 4,
        points: [
          { x: 0.1, y: 0.1, pressure: 0.5 },
          { x: 0.5, y: 0.5, pressure: 0.5 },
        ],
        timestamp: Date.now(),
      },
    ];
    expect(isEmptyCanvas(validDrawing)).toBe(false);
  });
});
