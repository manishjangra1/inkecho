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

export function GameTimer({
  remainingSeconds,
  isUrgent,
  isPaused,
  className,
}: GameTimerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold tracking-wide transition-all border shadow-sm',
        isPaused
          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          : isUrgent
            ? 'bg-red-500/15 text-red-400 border-red-500/40 animate-pulse'
            : 'bg-primary/10 text-primary border-primary/20',
        className
      )}
      role="timer"
      aria-live="polite"
    >
      {isPaused ? (
        <AlertCircle className="w-4 h-4 text-amber-400 animate-spin" />
      ) : (
        <Clock className={cn('w-4 h-4', isUrgent && 'text-red-400')} />
      )}
      <span className="tabular-nums">
        {isPaused ? 'PAUSED' : formatTime(remainingSeconds)}
      </span>
    </div>
  );
}
