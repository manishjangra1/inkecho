import { z } from 'zod';
import { CANVAS_CONFIG } from '@/shared/config/canvas.config';

export const pointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  pressure: z.number().min(0).max(1).default(0.5),
});

export const strokeSchema = z.object({
  id: z.string().min(1),
  tool: z.enum([CANVAS_CONFIG.TOOLS.BRUSH, CANVAS_CONFIG.TOOLS.ERASER]),
  color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid hex color'),
  size: z.number().min(CANVAS_CONFIG.BRUSH.MIN_SIZE).max(CANVAS_CONFIG.BRUSH.MAX_SIZE),
  points: z.array(pointSchema).min(1),
  timestamp: z.number().positive(),
});

export const canvasDraftSchema = z.object({
  gameId: z.string().min(1),
  chainIndex: z.number().int().nonnegative(),
  turnIndex: z.number().int().nonnegative(),
  strokes: z.array(strokeSchema),
  savedAt: z.number().positive(),
});

export const exportOptionsSchema = z.object({
  width: z.number().int().positive().default(CANVAS_CONFIG.EXPORT.EXPORT_WIDTH),
  height: z.number().int().positive().default(CANVAS_CONFIG.EXPORT.EXPORT_HEIGHT),
  quality: z
    .number()
    .min(CANVAS_CONFIG.EXPORT.MIN_QUALITY)
    .max(1)
    .default(CANVAS_CONFIG.EXPORT.DEFAULT_QUALITY),
  backgroundColor: z.string().default(CANVAS_CONFIG.EXPORT.BACKGROUND_DARK),
});

export type PointInput = z.infer<typeof pointSchema>;
export type StrokeInput = z.infer<typeof strokeSchema>;
export type CanvasDraftInput = z.infer<typeof canvasDraftSchema>;
export type ExportOptionsInput = z.infer<typeof exportOptionsSchema>;
