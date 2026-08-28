'use client';

import React from 'react';
import { PauseCircle, Play } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { GAME_COPY } from '@/shared/constants/copy/game';

export interface PauseOverlayProps {
  readonly isHost: boolean;
  readonly onResume?: () => void;
  readonly isResuming?: boolean;
}

export function PauseOverlay({ isHost, onResume, isResuming }: PauseOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md duration-200 animate-in fade-in">
      <div className="w-full max-w-md space-y-6 rounded-3xl border bg-card p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
          <PauseCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">{GAME_COPY.PAUSED_TITLE}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {GAME_COPY.PAUSED_SUBTITLE}
          </p>
        </div>

        {isHost ? (
          <Button
            onClick={onResume}
            disabled={isResuming}
            className="w-full py-6 text-base font-semibold"
          >
            <Play className="mr-2 h-5 w-5" />
            {GAME_COPY.RESUME_BUTTON}
          </Button>
        ) : (
          <p className="font-mono text-xs text-muted-foreground">
            Waiting for room host to resume the session...
          </p>
        )}
      </div>
    </div>
  );
}
