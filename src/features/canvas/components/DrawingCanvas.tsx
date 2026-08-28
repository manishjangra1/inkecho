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
        'relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl border border-border/80 bg-[#1A1A2E] shadow-inner transition-shadow',
        isDrawing && 'ring-2 ring-primary/40',
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
        <div className="backdrop-blur-xs absolute inset-0 flex items-center justify-center bg-background/60 duration-200 animate-in fade-in">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 shadow-md">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs font-semibold">Processing Drawing…</span>
          </div>
        </div>
      )}
    </div>
  );
}
