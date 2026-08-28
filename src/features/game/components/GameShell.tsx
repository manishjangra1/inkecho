'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { GameHeader } from './GameHeader';
import { GamePhaseRouter } from './GamePhaseRouter';
import { PauseOverlay } from './PauseOverlay';
import { SpectatorBanner } from './SpectatorBanner';
import { ReconnectBanner } from './ReconnectBanner';
import { useGameState } from '../hooks/use-game-state';
import { pauseGameAction } from '../actions/pause-game.action';
import { resumeGameAction } from '../actions/resume-game.action';
import { getTotalTurnsPerChain } from '@/domain/game/turn-order';
import { Loader2 } from 'lucide-react';

export interface GameShellProps {
  readonly roomCode: string;
}

export function GameShell({ roomCode }: GameShellProps) {
  const {
    game,
    currentTurn,
    isHost,
    isSpectator,
    isPaused,
    connectionState,
    isLoading,
  } = useGameState(roomCode);

  const [isPauseLoading, setIsPauseLoading] = useState(false);

  const handlePauseToggle = async () => {
    setIsPauseLoading(true);
    try {
      if (isPaused) {
        const res = await resumeGameAction({ roomCode });
        if (!res.success) {
          toast.error(res.error.message || 'Failed to resume game');
        } else {
          toast.success('Game resumed');
        }
      } else {
        const res = await pauseGameAction({ roomCode });
        if (!res.success) {
          toast.error(res.error.message || 'Failed to pause game');
        } else {
          toast.info('Game paused');
        }
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsPauseLoading(false);
    }
  };

  if (isLoading || !game || !currentTurn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading game session...
        </p>
      </div>
    );
  }

  const totalTurns = getTotalTurnsPerChain(game.playerOrder.length);
  const isDisconnected =
    connectionState === 'disconnected' || connectionState === 'suspended';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {isSpectator && <SpectatorBanner />}
      {isDisconnected && <ReconnectBanner />}

      <GameHeader
        roomCode={roomCode}
        roundIndex={game.currentRoundIndex}
        chainIndex={game.currentChainIndex}
        totalChains={game.chains.length}
        totalTurns={totalTurns}
        currentTurn={currentTurn}
        isHost={isHost}
        isPaused={isPaused}
        onPauseToggle={handlePauseToggle}
        isPauseLoading={isPauseLoading}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        <GamePhaseRouter
          roomCode={roomCode}
          roomId={game.roomId}
          currentTurn={currentTurn}
          isSpectator={isSpectator}
        />
      </main>

      {isPaused && (
        <PauseOverlay
          isHost={isHost}
          onResume={handlePauseToggle}
          isResuming={isPauseLoading}
        />
      )}
    </div>
  );
}
