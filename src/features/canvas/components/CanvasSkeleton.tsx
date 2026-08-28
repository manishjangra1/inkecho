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
        'flex aspect-[4/3] w-full animate-pulse flex-col items-center justify-center space-y-3 rounded-[4px] border border-border bg-[#161616] p-6',
        className
      )}
    >
      <div className="h-10 w-10 rounded-[4px] bg-[#222222]" />
      <div className="h-3 w-28 rounded-[2px] bg-[#222222]" />
    </div>
  );
}
