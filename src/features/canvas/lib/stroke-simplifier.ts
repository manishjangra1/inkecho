import type { Point } from '../types/canvas.types';

/**
 * Calculates perpendicular distance from a point to a line segment.
 */
function getPerpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  if (dx === 0 && dy === 0) {
    const px = point.x - lineStart.x;
    const py = point.y - lineStart.y;
    return Math.sqrt(px * px + py * py);
  }

  const numerator = Math.abs(
    dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x
  );
  const denominator = Math.sqrt(dx * dx + dy * dy);

  return numerator / denominator;
}

/**
 * Douglas-Peucker algorithm to simplify a sequence of 2D points.
 *
 * @param points - Array of normalized points (0–1).
 * @param tolerance - Maximum allowed distance tolerance in normalized coordinates.
 * @returns Simplified array of points preserving endpoints and significant turns.
 */
export function simplifyPoints(points: readonly Point[], tolerance: number = 0.002): Point[] {
  if (points.length <= 2) {
    return [...points];
  }

  let maxDistance = 0;
  let index = 0;
  const lastIndex = points.length - 1;

  for (let i = 1; i < lastIndex; i++) {
    const distance = getPerpendicularDistance(points[i]!, points[0]!, points[lastIndex]!);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance > tolerance) {
    const leftPoints = simplifyPoints(points.slice(0, index + 1), tolerance);
    const rightPoints = simplifyPoints(points.slice(index), tolerance);

    return [...leftPoints.slice(0, -1), ...rightPoints];
  }

  return [points[0]!, points[lastIndex]!];
}
