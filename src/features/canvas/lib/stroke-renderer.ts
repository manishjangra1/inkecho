import type { Point, Stroke } from '../types/canvas.types';
import { CANVAS_CONFIG } from '@/shared/config/canvas.config';

export interface RenderOptions {
  readonly width: number;
  readonly height: number;
  readonly backgroundColor?: string;
  readonly scale?: number;
}

/**
 * Clears the canvas and optionally fills with a solid background color.
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor?: string
): void {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

/**
 * Renders a single stroke onto the provided Canvas 2D context.
 */
export function renderStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  width: number,
  height: number,
  scale: number = 1
): void {
  const { points, tool, color, size } = stroke;
  if (!points || points.length === 0) return;

  ctx.save();

  if (tool === CANVAS_CONFIG.TOOLS.ERASER) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const baseLineWidth = size * scale;

  if (points.length === 1) {
    // Single tap/dot
    const pt = points[0]!;
    const px = pt.x * width;
    const py = pt.y * height;
    const radius = Math.max(1, (baseLineWidth * (pt.pressure || 0.5)) / 2);

    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Smooth quadratic Bézier curves between midpoints
  ctx.beginPath();
  const first = points[0]!;
  ctx.moveTo(first.x * width, first.y * height);

  if (points.length === 2) {
    const second = points[1]!;
    ctx.lineWidth = baseLineWidth * (second.pressure || 0.5);
    ctx.lineTo(second.x * width, second.y * height);
    ctx.stroke();
    ctx.restore();
    return;
  }

  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i]!;
    const next = points[i + 1]!;

    const currentX = current.x * width;
    const currentY = current.y * height;
    const midX = (currentX + next.x * width) / 2;
    const midY = (currentY + next.y * height) / 2;

    ctx.lineWidth = baseLineWidth * (current.pressure || 0.5);
    ctx.quadraticCurveTo(currentX, currentY, midX, midY);
  }

  const last = points[points.length - 1]!;
  ctx.lineWidth = baseLineWidth * (last.pressure || 0.5);
  ctx.lineTo(last.x * width, last.y * height);
  ctx.stroke();

  ctx.restore();
}

/**
 * Replays all strokes onto the canvas. Used during resize, undo, redo, and export.
 */
export function replayStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: readonly Stroke[],
  options: RenderOptions
): void {
  const { width, height, backgroundColor, scale = 1 } = options;

  clearCanvas(ctx, width, height, backgroundColor);

  for (const stroke of strokes) {
    renderStroke(ctx, stroke, width, height, scale);
  }
}

/**
 * Renders an incremental live segment during pointer drag for 60fps responsiveness.
 */
export function renderLiveSegment(
  ctx: CanvasRenderingContext2D,
  prevPoint: Point,
  currPoint: Point,
  stroke: Pick<Stroke, 'tool' | 'color' | 'size'>,
  width: number,
  height: number,
  scale: number = 1
): void {
  ctx.save();

  if (stroke.tool === CANVAS_CONFIG.TOOLS.ERASER) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = stroke.color;
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = stroke.size * scale * (currPoint.pressure || 0.5);

  ctx.beginPath();
  ctx.moveTo(prevPoint.x * width, prevPoint.y * height);
  ctx.lineTo(currPoint.x * width, currPoint.y * height);
  ctx.stroke();

  ctx.restore();
}
