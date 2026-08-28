'use client';

import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface CanvasSkeletonProps {
  readonly className?: string;
}

export function CanvasSkeleton({ className }: CanvasSkeletonProps) {
  return (
    <div
      className={cn(
        'flex aspect-[4/3] w-full animate-pulse flex-col items-center justify-center space-y-3 rounded-2xl border border-border/40 bg-card/60 p-6',
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-muted/60" />
      <div className="h-4 w-32 rounded bg-muted/60" />
    </div>
  );
}
