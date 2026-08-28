'use client';

import React from 'react';
import { Pencil, FileText, Loader2 } from 'lucide-react';
import type { TurnPhase } from '@/domain/game/game-state-machine';
import { GAME_COPY } from '@/shared/constants/copy/game';

export interface WaitingPhaseProps {
  readonly phase: TurnPhase;
  readonly activePlayerName?: string;
}

export function WaitingPhase({ phase, activePlayerName }: WaitingPhaseProps) {
  const isDescribe = phase === 'DESCRIBE';

  return (
    <div className="w-full max-w-lg mx-auto py-16 px-6 text-center space-y-6 rounded-3xl border bg-card/40 backdrop-blur-md shadow-lg animate-in fade-in zoom-in-95 duration-300">
      <div className="relative mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        {isDescribe ? (
          <FileText className="w-8 h-8 text-primary" />
        ) : (
          <Pencil className="w-8 h-8 text-primary" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight">
          {GAME_COPY.WAITING_TITLE}
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
          <span className="font-semibold text-foreground">
            {activePlayerName || 'Another player'}
          </span>{' '}
          {isDescribe ? 'is writing a description' : 'is drawing their masterpiece'}.{' '}
          {GAME_COPY.WAITING_SUBTITLE}
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/60 text-xs text-muted-foreground font-medium">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        <span>Waiting for turn submission...</span>
      </div>
    </div>
  );
}
