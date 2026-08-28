'use client';

import { useState, useCallback } from 'react';
import type { Stroke, CanvasExportResult } from '../types/canvas.types';
import { exportCanvasToBlob, isEmptyCanvas, type ExportCanvasOptions } from '../lib/canvas-utils';

export function useCanvasExport() {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportDrawing = useCallback(
    async (
      strokes: readonly Stroke[],
      options: ExportCanvasOptions = {}
    ): Promise<CanvasExportResult | null> => {
      if (isEmptyCanvas(strokes)) {
        setExportError('Canvas is empty. Draw something before submitting!');
        return null;
      }

      setIsExporting(true);
      setExportError(null);

      try {
        const result = await exportCanvasToBlob(strokes, options);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to export drawing.';
        setExportError(message);
        return null;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return {
    exportDrawing,
    isExporting,
    exportError,
    clearExportError: () => setExportError(null),
  };
}
