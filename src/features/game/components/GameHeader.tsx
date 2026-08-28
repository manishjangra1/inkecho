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
  roomCode,
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
    <header className="flex h-12 w-full shrink-0 items-center justify-between border-b border-border bg-[#0E0E0E] px-4 select-none">
      {/* Left: Room & Chain Info */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-bold text-white">
          {roomCode}
        </span>
        <div className="h-3 w-px bg-neutral-800" />
        <span className="text-xs text-neutral-400">
          Round {roundIndex + 1} &bull; Chain {chainIndex + 1}/{totalChains}
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
            className="h-7 px-2 text-xs"
            title={isPaused ? 'Resume game' : 'Pause game'}
          >
            {isPaused ? (
              <>
                <Play className="mr-1 h-3 w-3" />
                Resume
              </>
            ) : (
              <>
                <Pause className="mr-1 h-3 w-3" />
                Pause
              </>
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
