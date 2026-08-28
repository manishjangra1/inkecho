'use client';

import React from 'react';
import { cn } from '@/shared/lib/cn';
import type { CanvasEngine } from '../hooks/use-canvas-engine';
import { CanvasSkeleton } from './CanvasSkeleton';

export interface DrawingCanvasProps {
  readonly engine: CanvasEngine;
  readonly className?: string;
  readonly isLoading?: boolean;
}

export function DrawingCanvas({ engine, className, isLoading = false }: DrawingCanvasProps) {
  const { canvasRef, pointerHandlers, isDrawing, isExporting } = engine;

  if (isLoading) {
    return <CanvasSkeleton className={className} />;
  }

  return (
    <div
      className={cn(
        'relative aspect-[4/3] w-full select-none overflow-hidden rounded-[4px] border border-border bg-[#111111] transition-colors',
        isDrawing && 'border-white',
        className
      )}
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        {...pointerHandlers}
        className="block h-full w-full cursor-crosshair touch-none"
        aria-label="Drawing canvas"
        role="region"
      />

      {/* Exporting Loading Overlay */}
      {isExporting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 duration-150 animate-in fade-in">
          <div className="flex items-center gap-2 rounded-[4px] border border-border bg-[#161616] px-3.5 py-1.5 shadow-none">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-xs font-medium text-white">Saving Drawing…</span>
          </div>
        </div>
      )}
    </div>
  );
}
