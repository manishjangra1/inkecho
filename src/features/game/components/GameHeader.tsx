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
    <header className="w-full border-b bg-card/40 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Room & Chain Info */}
        <div className="flex items-center gap-3">
          <div className="font-mono text-sm font-bold bg-muted px-2.5 py-1 rounded-md border border-border/60">
            {roomCode}
          </div>
          <div className="text-xs text-muted-foreground font-medium hidden sm:block">
            Round {roundIndex + 1} • Chain {chainIndex + 1}/{totalChains}
          </div>
        </div>

        {/* Center: Turn Info & Progress */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
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
          <GameTimer
            remainingSeconds={remainingSeconds}
            isUrgent={isUrgent}
            isPaused={isPaused}
          />

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
                  <Play className="w-3.5 h-3.5 mr-1" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 mr-1" />
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
