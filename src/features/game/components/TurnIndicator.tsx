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
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border shadow-sm',
          isDescribe
            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        )}
      >
        {isDescribe ? (
          <FileText className="w-3.5 h-3.5" />
        ) : (
          <Pencil className="w-3.5 h-3.5" />
        )}
        <span>{isDescribe ? 'Describe' : 'Draw'}</span>
      </div>

      <div className="text-sm font-medium text-muted-foreground">
        Turn {turnIndex + 1} of {totalTurns}
        {isMyTurn ? (
          <span className="ml-2 font-bold text-primary">(Your Turn)</span>
        ) : activePlayerName ? (
          <span className="ml-2 text-foreground font-medium">
            ({activePlayerName}&apos;s turn)
          </span>
        ) : null}
      </div>
    </div>
  );
}
