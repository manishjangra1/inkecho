import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clearCanvas, renderStroke, replayStrokes } from './stroke-renderer';
import type { Stroke } from '../types/canvas.types';

describe('stroke-renderer', () => {
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      lineCap: 'butt',
      lineJoin: 'miter',
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D;
  });

  it('clears canvas and paints background color', () => {
    clearCanvas(mockCtx, 800, 600, '#1A1A2E');
    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(mockCtx.fillStyle).toBe('#1A1A2E');
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('renders a single tap point as an arc circle', () => {
    const singlePointStroke: Stroke = {
      id: 's1',
      tool: 'brush',
      color: '#EF4444',
      size: 8,
      points: [{ x: 0.5, y: 0.5, pressure: 0.5 }],
      timestamp: Date.now(),
    };

    renderStroke(mockCtx, singlePointStroke, 800, 600);
    expect(mockCtx.arc).toHaveBeenCalledWith(400, 300, 2, 0, Math.PI * 2);
    expect(mockCtx.fill).toHaveBeenCalled();
  });

  it('renders multi-point brush stroke with quadratic curves', () => {
    const multiPointStroke: Stroke = {
      id: 's2',
      tool: 'brush',
      color: '#3B82F6',
      size: 4,
      points: [
        { x: 0.1, y: 0.1, pressure: 0.5 },
        { x: 0.2, y: 0.3, pressure: 0.5 },
        { x: 0.4, y: 0.5, pressure: 0.5 },
      ],
      timestamp: Date.now(),
    };

    renderStroke(mockCtx, multiPointStroke, 800, 600);
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.moveTo).toHaveBeenCalledWith(80, 60);
    expect(mockCtx.quadraticCurveTo).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();
  });

  it('uses destination-out composite mode for eraser tool', () => {
    const eraserStroke: Stroke = {
      id: 's3',
      tool: 'eraser',
      color: '#000000',
      size: 16,
      points: [
        { x: 0.2, y: 0.2, pressure: 0.5 },
        { x: 0.4, y: 0.4, pressure: 0.5 },
      ],
      timestamp: Date.now(),
    };

    renderStroke(mockCtx, eraserStroke, 800, 600);
    expect(mockCtx.globalCompositeOperation).toBe('destination-out');
  });

  it('replays all strokes sequentially', () => {
    const strokes: Stroke[] = [
      {
        id: 's1',
        tool: 'brush',
        color: '#FFFFFF',
        size: 4,
        points: [{ x: 0.1, y: 0.1, pressure: 0.5 }],
        timestamp: 1,
      },
      {
        id: 's2',
        tool: 'brush',
        color: '#EF4444',
        size: 8,
        points: [{ x: 0.5, y: 0.5, pressure: 0.5 }],
        timestamp: 2,
      },
    ];

    replayStrokes(mockCtx, strokes, { width: 800, height: 600, backgroundColor: '#000000' });
    expect(mockCtx.clearRect).toHaveBeenCalled();
    expect(mockCtx.arc).toHaveBeenCalledTimes(2);
  });
});
