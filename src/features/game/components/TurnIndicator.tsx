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
          'flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-wider shadow-sm',
          isDescribe
            ? 'border-blue-500/20 bg-blue-500/10 text-blue-400'
            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
        )}
      >
        {isDescribe ? <FileText className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
        <span>{isDescribe ? 'Describe' : 'Draw'}</span>
      </div>

      <div className="text-sm font-medium text-muted-foreground">
        Turn {turnIndex + 1} of {totalTurns}
        {isMyTurn ? (
          <span className="ml-2 font-bold text-primary">(Your Turn)</span>
        ) : activePlayerName ? (
          <span className="ml-2 font-medium text-foreground">({activePlayerName}&apos;s turn)</span>
        ) : null}
      </div>
    </div>
  );
}
