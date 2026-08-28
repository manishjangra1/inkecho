import type { Point, Stroke, CanvasExportResult, CanvasBoundingBox } from '../types/canvas.types';
import { CANVAS_CONFIG } from '@/shared/config/canvas.config';
import { replayStrokes } from './stroke-renderer';

/**
 * Extracts normalized (0–1) coordinates and pressure from a pointer or touch event.
 */
export function getNormalizedPointerPos(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  pressure: number = 0.5
): Point {
  const rawX = clientX - rect.left;
  const rawY = clientY - rect.top;

  const clampedX = Math.max(0, Math.min(rect.width, rawX));
  const clampedY = Math.max(0, Math.min(rect.height, rawY));

  return {
    x: rect.width > 0 ? clampedX / rect.width : 0,
    y: rect.height > 0 ? clampedY / rect.height : 0,
    pressure: Math.max(0.1, Math.min(1.0, pressure || 0.5)),
  };
}

/**
 * Computes the normalized bounding box for all non-eraser strokes.
 */
export function computeStrokeBoundingBox(strokes: readonly Stroke[]): CanvasBoundingBox | null {
  const visibleStrokes = strokes.filter(
    (s) => s.tool === CANVAS_CONFIG.TOOLS.BRUSH && s.points.length > 0
  );

  if (visibleStrokes.length === 0) return null;

  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;

  for (const stroke of visibleStrokes) {
    for (const pt of stroke.points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Determines whether the canvas is considered empty.
 * Returns true if there are no brush strokes or if all drawing was erased / has zero area.
 */
export function isEmptyCanvas(strokes: readonly Stroke[]): boolean {
  if (!strokes || strokes.length === 0) return true;

  const bbox = computeStrokeBoundingBox(strokes);
  if (!bbox) return true;

  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;

  // If bounding box has zero area and stroke count is trivial
  if (width < 0.001 && height < 0.001 && strokes.length <= 1) {
    const onlyStroke = strokes[0];
    return !onlyStroke || onlyStroke.points.length === 0;
  }

  return false;
}

export interface ExportCanvasOptions {
  width?: number;
  height?: number;
  quality?: number;
  backgroundColor?: string;
  theme?: 'dark' | 'light';
}

/**
 * Renders all strokes onto an offscreen canvas and exports a compressed WebP/PNG blob.
 * Automatically performs iterative quality / dimension downscaling to stay within payload budget.
 */
export async function exportCanvasToBlob(
  strokes: readonly Stroke[],
  options: ExportCanvasOptions = {}
): Promise<CanvasExportResult> {
  const targetWidth = options.width || CANVAS_CONFIG.EXPORT.EXPORT_WIDTH;
  const targetHeight = options.height || CANVAS_CONFIG.EXPORT.EXPORT_HEIGHT;
  const defaultBg =
    options.theme === 'light'
      ? CANVAS_CONFIG.EXPORT.BACKGROUND_LIGHT
      : CANVAS_CONFIG.EXPORT.BACKGROUND_DARK;
  const backgroundColor = options.backgroundColor || defaultBg;

  let currentQuality = options.quality ?? CANVAS_CONFIG.EXPORT.DEFAULT_QUALITY;
  let currentWidth = targetWidth;
  let currentHeight = targetHeight;

  // Create canvas for offscreen rendering
  const canvas = document.createElement('canvas');
  canvas.width = currentWidth;
  canvas.height = currentHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create 2D context for offscreen export.');
  }

  replayStrokes(ctx, strokes, {
    width: currentWidth,
    height: currentHeight,
    backgroundColor,
  });

  const getBlob = (q: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), CANVAS_CONFIG.EXPORT.MIME_TYPE, q);
    });
  };

  let blob = await getBlob(currentQuality);

  // Fallback to PNG if browser doesn't support WebP export
  if (!blob) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), CANVAS_CONFIG.EXPORT.FALLBACK_MIME_TYPE);
    });
  }

  if (!blob) {
    throw new Error('Failed to generate image blob from canvas.');
  }

  // Iterative quality reduction if blob exceeds MAX_FILE_SIZE_BYTES
  while (
    blob.size > CANVAS_CONFIG.EXPORT.MAX_FILE_SIZE_BYTES &&
    currentQuality > CANVAS_CONFIG.EXPORT.MIN_QUALITY
  ) {
    currentQuality -= CANVAS_CONFIG.EXPORT.QUALITY_STEP;
    const smallerBlob = await getBlob(currentQuality);
    if (smallerBlob) {
      blob = smallerBlob;
    }
  }

  // If still too large, downscale dimensions to 640x480
  if (blob.size > CANVAS_CONFIG.EXPORT.MAX_FILE_SIZE_BYTES) {
    currentWidth = 640;
    currentHeight = 480;
    canvas.width = currentWidth;
    canvas.height = currentHeight;

    const scaledCtx = canvas.getContext('2d');
    if (scaledCtx) {
      replayStrokes(scaledCtx, strokes, {
        width: currentWidth,
        height: currentHeight,
        backgroundColor,
      });
      const downscaledBlob = await getBlob(CANVAS_CONFIG.EXPORT.MIN_QUALITY);
      if (downscaledBlob) {
        blob = downscaledBlob;
      }
    }
  }

  const dataUrl = canvas.toDataURL(CANVAS_CONFIG.EXPORT.MIME_TYPE, currentQuality);

  return {
    blob,
    dataUrl,
    width: currentWidth,
    height: currentHeight,
    sizeBytes: blob.size,
  };
}
