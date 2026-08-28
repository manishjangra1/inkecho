'use client';

import React from 'react';
import { Pencil, FileText } from 'lucide-react';
import type { TurnPhase } from '@/domain/game/game-state-machine';
import { cn } from '@/shared/lib/cn';

export interface TurnIndicatorProps {
  readonly phase: TurnPhase;
  readonly turnIndex: number;
  readonly totalTurns: number;
  readonly isMyTurn: boolean;
  readonly activePlayerName?: string;
  readonly className?: string;
}

export function TurnIndicator({
  phase,
  turnIndex,
  totalTurns,
  isMyTurn,
  activePlayerName,
  className,
}: TurnIndicatorProps) {
  const isDescribe = phase === 'DESCRIBE';

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <div className="flex h-6 items-center gap-1.5 rounded-[3px] border border-neutral-700 bg-[#161616] px-2 text-[11px] font-semibold uppercase tracking-wider text-white">
        {isDescribe ? (
          <FileText className="h-3 w-3 text-neutral-300" />
        ) : (
          <Pencil className="h-3 w-3 text-neutral-300" />
        )}
        <span>{isDescribe ? 'Describe' : 'Draw'}</span>
      </div>

      <div className="text-xs font-medium text-neutral-400">
        Turn <strong className="text-white font-mono">{turnIndex + 1}/{totalTurns}</strong>
        {isMyTurn ? (
          <span className="ml-2 rounded-[2px] bg-white px-1.5 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider">
            Your Turn
          </span>
        ) : activePlayerName ? (
          <span className="ml-1.5 text-neutral-300">({activePlayerName}&apos;s turn)</span>
        ) : null}
      </div>
    </div>
  );
}
