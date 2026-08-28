'use client';

import React from 'react';
import { DescribePhase } from './DescribePhase';
import { WaitingPhase } from './WaitingPhase';
import { PromptCard } from './PromptCard';
import { GAME_COPY } from '@/shared/constants/copy/game';
import type { TurnSnapshotDto } from '../types/game.types';

export interface GamePhaseRouterProps {
  readonly roomCode: string;
  readonly roomId: string;
  readonly currentTurn: TurnSnapshotDto;
  readonly isSpectator?: boolean;
}

export function GamePhaseRouter({
  roomCode,
  roomId,
  currentTurn,
  isSpectator = false,
}: GamePhaseRouterProps) {
  // If user is a spectator or it is not their turn, render WaitingPhase
  if (isSpectator || !currentTurn.isMyTurn) {
    return <WaitingPhase phase={currentTurn.phase} />;
  }

  // Active player: Describe phase
  if (currentTurn.phase === 'DESCRIBE') {
    return (
      <DescribePhase
        roomCode={roomCode}
        roomId={roomId}
        currentTurn={currentTurn}
      />
    );
  }

  // Active player: Draw phase (M5 placeholder preview)
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight">
          {GAME_COPY.DRAW_PHASE_TITLE}
        </h2>
        <p className="text-sm text-muted-foreground">
          {GAME_COPY.DRAW_PHASE_SUBTITLE}
        </p>
      </div>

      {currentTurn.promptContext && (
        <PromptCard
          type={currentTurn.promptContext.type}
          text={currentTurn.promptContext.text}
          drawingUrl={currentTurn.promptContext.drawingUrl}
        />
      )}

      <div className="rounded-3xl border border-dashed border-primary/40 bg-card/40 p-12 text-center space-y-4 shadow-sm">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
          M5
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-lg">Interactive Drawing Canvas</h4>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {GAME_COPY.DRAW_PLACEHOLDER}
          </p>
        </div>
      </div>
    </div>
  );
}
