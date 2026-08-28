import type { CanvasTool } from '@/shared/config/canvas.config';

export interface Point {
  readonly x: number; // 0–1 normalized
  readonly y: number; // 0–1 normalized
  readonly pressure: number; // 0–1, default 0.5 for mouse
}

export interface Stroke {
  readonly id: string;
  readonly tool: CanvasTool;
  readonly color: string; // hex color
  readonly size: number; // 1–32 logical px
  readonly points: readonly Point[];
  readonly timestamp: number;
}

export interface CanvasDraft {
  readonly gameId: string;
  readonly chainIndex: number;
  readonly turnIndex: number;
  readonly strokes: readonly Stroke[];
  readonly savedAt: number;
}

export interface CanvasExportResult {
  readonly blob: Blob;
  readonly dataUrl: string;
  readonly width: number;
  readonly height: number;
  readonly sizeBytes: number;
}

export interface CanvasDimensions {
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
}

export interface CanvasBoundingBox {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export interface CanvasEngineState {
  readonly tool: CanvasTool;
  readonly color: string;
  readonly size: number;
  readonly strokes: readonly Stroke[];
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly isDrawing: boolean;
  readonly isExporting: boolean;
}
