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
    <div className="flex h-full w-full items-center justify-center p-4 select-none">
      <div className="w-full max-w-md space-y-4 rounded-[4px] border border-border bg-[#111111] p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[4px] border border-neutral-700 bg-[#161616]">
          {isDescribe ? (
            <FileText className="h-6 w-6 text-white" />
          ) : (
            <Pencil className="h-6 w-6 text-white" />
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-white">{GAME_COPY.WAITING_TITLE}</h3>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
            {activePlayerName ? (
              <>
                <strong className="text-white">{activePlayerName}</strong> is currently{' '}
                {isDescribe ? 'writing a description' : 'sketching a drawing'}.
              </>
            ) : (
              <>
                Another player is currently{' '}
                {isDescribe ? 'writing a description' : 'sketching a drawing'}.
              </>
            )}
            {' '}{GAME_COPY.WAITING_SUBTITLE}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-[3px] border border-neutral-800 bg-[#161616] px-3 py-1 text-xs text-neutral-400">
          <Loader2 className="h-3 w-3 animate-spin text-white" />
          <span>Waiting for turn submission...</span>
        </div>
      </div>
    </div>
  );
}
