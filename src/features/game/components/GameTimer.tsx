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
        'flex h-6 items-center gap-1.5 rounded-[3px] border px-2 text-xs font-mono select-none transition-colors',
        isPaused
          ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
          : isUrgent
            ? 'animate-pulse border-[#D9534F] bg-[#D9534F]/10 text-[#D9534F]'
            : 'border-[#262626] bg-[#161616] text-white',
        className
      )}
      role="timer"
      aria-live="polite"
    >
      {isPaused ? (
        <AlertCircle className="h-3 w-3 text-amber-400 animate-spin" />
      ) : (
        <Clock className={cn('h-3 w-3', isUrgent ? 'text-[#D9534F]' : 'text-neutral-400')} />
      )}
      <span className="font-bold tabular-nums">
        {isPaused ? 'PAUSED' : formatTime(remainingSeconds)}
      </span>
    </div>
  );
}
