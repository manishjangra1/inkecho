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
    <div className="mx-auto w-full max-w-lg space-y-6 rounded-3xl border bg-card/40 px-6 py-16 text-center shadow-lg backdrop-blur-md duration-300 animate-in fade-in zoom-in-95">
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        {isDescribe ? (
          <FileText className="h-8 w-8 text-primary" />
        ) : (
          <Pencil className="h-8 w-8 text-primary" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight">{GAME_COPY.WAITING_TITLE}</h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">
            {activePlayerName || 'Another player'}
          </span>{' '}
          {isDescribe ? 'is writing a description' : 'is drawing their masterpiece'}.{' '}
          {GAME_COPY.WAITING_SUBTITLE}
        </p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-1.5 text-xs font-medium text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        <span>Waiting for turn submission...</span>
      </div>
    </div>
  );
}
