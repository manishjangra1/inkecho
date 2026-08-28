'use client';

import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { formatTime } from '@/shared/lib/utils/format-time';
import { cn } from '@/shared/lib/cn';

export interface GameTimerProps {
  readonly remainingSeconds: number;
  readonly isUrgent: boolean;
  readonly isPaused: boolean;
  readonly className?: string;
}

export function GameTimer({ remainingSeconds, isUrgent, isPaused, className }: GameTimerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold tracking-wide shadow-sm transition-all',
        isPaused
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
          : isUrgent
            ? 'animate-pulse border-red-500/40 bg-red-500/15 text-red-400'
            : 'border-primary/20 bg-primary/10 text-primary',
        className
      )}
      role="timer"
      aria-live="polite"
    >
      {isPaused ? (
        <AlertCircle className="h-4 w-4 animate-spin text-amber-400" />
      ) : (
        <Clock className={cn('h-4 w-4', isUrgent && 'text-red-400')} />
      )}
      <span className="tabular-nums">{isPaused ? 'PAUSED' : formatTime(remainingSeconds)}</span>
    </div>
  );
}
