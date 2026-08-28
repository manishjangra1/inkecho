'use client';

import React from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { GameTimer } from './GameTimer';
import { TurnIndicator } from './TurnIndicator';
import { useGameTimer } from '../hooks/use-game-timer';
import type { TurnSnapshotDto } from '../types/game.types';

export interface GameHeaderProps {
  readonly roomCode: string;
  readonly roundIndex: number;
  readonly chainIndex: number;
  readonly totalChains: number;
  readonly totalTurns: number;
  readonly currentTurn: TurnSnapshotDto;
  readonly isHost: boolean;
  readonly isPaused: boolean;
  readonly onPauseToggle?: () => void;
  readonly isPauseLoading?: boolean;
}

export function GameHeader({
  roundIndex,
  chainIndex,
  totalChains,
  totalTurns,
  currentTurn,
  isHost,
  isPaused,
  onPauseToggle,
  isPauseLoading,
}: GameHeaderProps) {
  const { remainingSeconds, isUrgent } = useGameTimer();

  return (
    <div className="flex h-9 w-full shrink-0 items-center justify-between rounded-[4px] border border-border bg-[#111111] px-3 select-none">
      {/* Left: Round & Chain Info */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold text-neutral-400">
          Round <strong className="text-white">{roundIndex + 1}</strong>
        </span>
        <span className="text-neutral-700">&bull;</span>
        <span className="text-xs text-neutral-400">
          Chain <strong className="text-white">{chainIndex + 1}/{totalChains}</strong>
        </span>
      </div>

      {/* Center: Phase / Turn status */}
      <div className="flex items-center gap-2">
        <TurnIndicator
          phase={currentTurn.phase}
          turnIndex={currentTurn.turnIndex}
          totalTurns={totalTurns}
          isMyTurn={currentTurn.isMyTurn}
        />
      </div>

      {/* Right: Timer & Host Pause Button */}
      <div className="flex items-center gap-2">
        <GameTimer remainingSeconds={remainingSeconds} isUrgent={isUrgent} isPaused={isPaused} />

        {isHost && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPauseToggle}
            disabled={isPauseLoading}
            className="h-6 px-2 text-[11px] border-[#262626] bg-[#161616] text-neutral-300 hover:text-white"
            title={isPaused ? 'Resume game' : 'Pause game'}
          >
            {isPaused ? (
              <>
                <Play className="mr-1 h-2.5 w-2.5 fill-current" />
                Resume
              </>
            ) : (
              <>
                <Pause className="mr-1 h-2.5 w-2.5" />
                Pause
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
