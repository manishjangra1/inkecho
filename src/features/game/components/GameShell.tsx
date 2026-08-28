'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { game, currentTurn, isHost, isSpectator, isPaused, connectionState, isLoading } =
    useGameState(roomCode);

  useEffect(() => {
    if (game?.status === 'REVEAL' || game?.status === 'COMPLETED') {
      toast.info('Game turns finished! Directing to the story reveal…');
      router.push(`/room/${roomCode}/reveal`);
    }
  }, [game?.status, roomCode, router]);

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
      <div className="flex h-full w-full flex-col items-center justify-center space-y-3 p-4">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
        <p className="text-xs font-mono text-neutral-400">Loading game session...</p>
      </div>
    );
  }

  const totalTurns = getTotalTurnsPerChain(game.playerOrder.length);
  const isDisconnected = connectionState === 'disconnected' || connectionState === 'suspended';

  return (
    <div className="flex h-full w-full flex-col justify-between overflow-hidden select-none space-y-2">
      {isSpectator && <SpectatorBanner />}
      {isDisconnected && <ReconnectBanner />}

      {/* Top In-Game Turn Status Bar */}
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

      {/* Main Game Stage Router */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <GamePhaseRouter
          roomCode={roomCode}
          roomId={game.roomId}
          currentTurn={currentTurn}
          isSpectator={isSpectator}
        />
      </div>

      {isPaused && (
        <PauseOverlay isHost={isHost} onResume={handlePauseToggle} isResuming={isPauseLoading} />
      )}
    </div>
  );
}
