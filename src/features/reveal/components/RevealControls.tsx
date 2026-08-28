'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { Kbd } from '@/shared/ui/kbd';
import { cn } from '@/shared/lib/cn';

export interface RevealControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  canPrev: boolean;
  canNext: boolean;
  currentStepIndex: number;
  totalSteps: number;
  className?: string;
}

export function RevealControls({
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  canPrev,
  canNext,
  currentStepIndex,
  totalSteps,
  className,
}: RevealControlsProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-2 py-1 select-none',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!canPrev}
          className="h-7 w-7 p-0"
          aria-label="Previous step"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onTogglePlay}
          className="h-7 gap-1 px-2.5 text-xs font-semibold"
          aria-label={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canNext}
          className="h-7 w-7 p-0"
          aria-label="Next step"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-neutral-400">
          Step <strong className="text-white">{currentStepIndex + 1}</strong> of {totalSteps}
        </span>

        <div className="hidden items-center gap-1.5 text-[10px] text-neutral-500 sm:flex">
          <Kbd>Space</Kbd>
          <span>to advance</span>
        </div>
      </div>
    </div>
  );
}
