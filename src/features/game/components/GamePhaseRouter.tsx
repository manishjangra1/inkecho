'use client';

import React from 'react';
import { DescribePhase } from './DescribePhase';
import { DrawPhase } from './DrawPhase';
import { WaitingPhase } from './WaitingPhase';
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
    return <DescribePhase roomCode={roomCode} roomId={roomId} currentTurn={currentTurn} />;
  }

  // Active player: Draw phase
  return <DrawPhase roomCode={roomCode} roomId={roomId} currentTurn={currentTurn} />;
}
