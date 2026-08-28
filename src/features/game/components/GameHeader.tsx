'use client';

import React from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { GameTimer } from './GameTimer';
import { TurnIndicator } from './TurnIndicator';
import { TurnProgressDots } from './TurnProgressDots';
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
    <header className="sticky top-0 z-30 w-full border-b bg-card/40 px-4 py-3 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        {/* Left: Room & Chain Info */}
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-border/60 bg-muted px-2.5 py-1 font-mono text-sm font-bold">
            {roomCode}
          </div>
          <div className="hidden text-xs font-medium text-muted-foreground sm:block">
            Round {roundIndex + 1} • Chain {chainIndex + 1}/{totalChains}
          </div>
        </div>

        {/* Center: Turn Info & Progress */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <TurnIndicator
            phase={currentTurn.phase}
            turnIndex={currentTurn.turnIndex}
            totalTurns={totalTurns}
            isMyTurn={currentTurn.isMyTurn}
          />
          <TurnProgressDots
            currentTurnIndex={currentTurn.turnIndex}
            totalTurns={totalTurns}
            className="hidden md:flex"
          />
        </div>

        {/* Right: Timer & Pause Button */}
        <div className="flex items-center gap-2.5">
          <GameTimer remainingSeconds={remainingSeconds} isUrgent={isUrgent} isPaused={isPaused} />

          {isHost && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPauseToggle}
              disabled={isPauseLoading}
              className="h-9 px-3 text-xs font-semibold"
              title={isPaused ? 'Resume game' : 'Pause game'}
            >
              {isPaused ? (
                <>
                  <Play className="mr-1 h-3.5 w-3.5" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="mr-1 h-3.5 w-3.5" />
                  Pause
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
