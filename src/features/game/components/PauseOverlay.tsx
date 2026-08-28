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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm select-none duration-200 animate-in fade-in">
      <div className="w-full max-w-sm space-y-5 rounded-[4px] border border-border bg-[#111111] p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[4px] border border-neutral-700 bg-[#161616] text-white">
          <PauseCircle className="h-6 w-6 text-amber-400" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-white tracking-tight">{GAME_COPY.PAUSED_TITLE}</h3>
          <p className="text-xs leading-relaxed text-neutral-400 max-w-xs mx-auto">
            {GAME_COPY.PAUSED_SUBTITLE}
          </p>
        </div>

        {isHost ? (
          <Button
            onClick={onResume}
            disabled={isResuming}
            className="h-9 w-full rounded-[4px] bg-white text-black hover:bg-neutral-200 text-xs font-semibold"
          >
            <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
            {GAME_COPY.RESUME_BUTTON}
          </Button>
        ) : (
          <p className="font-mono text-xs text-neutral-500">
            Waiting for room host to resume the session...
          </p>
        )}
      </div>
    </div>
  );
}
