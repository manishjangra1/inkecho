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

export function PauseOverlay({
  isHost,
  onResume,
  isResuming,
}: PauseOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full p-8 rounded-3xl border bg-card text-center space-y-6 shadow-2xl">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
          <PauseCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">
            {GAME_COPY.PAUSED_TITLE}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {GAME_COPY.PAUSED_SUBTITLE}
          </p>
        </div>

        {isHost ? (
          <Button
            onClick={onResume}
            disabled={isResuming}
            className="w-full font-semibold py-6 text-base"
          >
            <Play className="w-5 h-5 mr-2" />
            {GAME_COPY.RESUME_BUTTON}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground font-mono">
            Waiting for room host to resume the session...
          </p>
        )}
      </div>
    </div>
  );
}
