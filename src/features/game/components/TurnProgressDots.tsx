'use client';

import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface TurnProgressDotsProps {
  readonly currentTurnIndex: number;
  readonly totalTurns: number;
  readonly className?: string;
}

export function TurnProgressDots({
  currentTurnIndex,
  totalTurns,
  className,
}: TurnProgressDotsProps) {
  const safeTotal = Math.max(1, totalTurns);

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {Array.from({ length: safeTotal }).map((_, idx) => {
        const isCompleted = idx < currentTurnIndex;
        const isCurrent = idx === currentTurnIndex;

        return (
          <div
            key={idx}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              isCurrent
                ? 'w-6 bg-primary shadow-sm shadow-primary/30'
                : isCompleted
                  ? 'w-2 bg-primary/40'
                  : 'w-2 bg-muted/60'
            )}
            title={`Turn ${idx + 1}`}
          />
        );
      })}
    </div>
  );
}
