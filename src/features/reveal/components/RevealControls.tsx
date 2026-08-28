'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
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
        'sticky bottom-4 z-20 mx-auto flex items-center justify-between gap-4 rounded-full border border-border/80 bg-card/90 px-6 py-3 shadow-2xl backdrop-blur-md',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          disabled={!canPrev}
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Previous step"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={onTogglePlay}
          className="h-10 w-10 rounded-full shadow-md shadow-primary/20"
          aria-label={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={!canNext}
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Next step"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-muted-foreground">
          Step <span className="font-bold text-foreground">{currentStepIndex + 1}</span> of{' '}
          {totalSteps}
        </span>

        <div className="hidden items-center gap-1 border-l border-border pl-3 text-[10px] text-muted-foreground/60 sm:flex">
          <kbd className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono">
            Space
          </kbd>
          <span>to advance</span>
        </div>
      </div>
    </div>
  );
}
