'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useRoom } from '@/features/rooms/hooks/use-room';
import { PlayerGrid } from './PlayerGrid';
import { ReadyButton } from './ReadyButton';
import { StartGameButton } from './StartGameButton';
import { Skeleton } from '@/shared/ui/skeleton';
import { Eye, Sliders } from 'lucide-react';
import { toast } from '@/shared/ui/toast';
import type { RoomSnapshotDto } from '@/infrastructure/db/mappers/room.mapper';

interface LobbyViewProps {
  readonly initialRoom: RoomSnapshotDto;
  readonly currentPlayerId?: string;
}

export function LobbyView({ initialRoom, currentPlayerId }: LobbyViewProps) {
  const router = useRouter();
  const {
    data: room = initialRoom,
    refetch,
    isLoading,
  } = useRoom(initialRoom.code, {
    refetchInterval: 2000,
  });

  const isHost = room.hostPlayerId === currentPlayerId;
  const currentParticipant = room.participants.find((p) => p.playerId === currentPlayerId);
  const isSpectator = room.spectators.some((s) => s.playerId === currentPlayerId);

  // Auto-redirect if game starts
  React.useEffect(() => {
    if (room.status === 'IN_PROGRESS') {
      toast.info('The game is starting!');
      router.push(`/room/${room.code}/game`);
    } else if (room.status === 'CLOSED') {
      toast.error('The room has been closed.');
      router.push('/');
    }
  }, [room.status, room.code, router]);

  const [isStartingGame, setIsStartingGame] = React.useState(false);

  const handleStartGame = async () => {
    setIsStartingGame(true);
    try {
      const { startGameAction } = await import('@/features/lobby/actions/start-game.action');
      const res = await startGameAction({ roomCode: room.code });
      if (!res.success) {
        toast.error(res.error.message || 'Failed to start game');
      } else {
        toast.success('Game started! Directing players to the board...');
        router.push(`/room/${room.code}/game`);
      }
    } catch {
      toast.error('An unexpected error occurred while starting the game.');
    } finally {
      setIsStartingGame(false);
    }
  };

  if (isLoading && !room) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-[4px]" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-[4px]" />
          ))}
        </div>
      </div>
    );
  }

  const activePlayers = room.participants;
  const readyCount = activePlayers.filter((p) => p.isReady).length;

  return (
    <div className="flex h-full flex-col justify-between space-y-6">
      {/* Top Section: Player Grid & Status */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Players ({activePlayers.length}/{room.settings.maxPlayers})
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
            <span>Ready:</span>
            <strong className="text-white font-semibold">{readyCount}/{activePlayers.length}</strong>
          </div>
        </div>

        {/* 2x4 Players Roster Grid */}
        <PlayerGrid
          participants={activePlayers}
          maxPlayers={room.settings.maxPlayers}
          currentPlayerId={currentPlayerId}
          isHostViewer={isHost}
          roomCode={room.code}
          onPlayerUpdated={() => refetch()}
        />

        {/* Room Settings Info Bar */}
        <div className="rounded-[4px] border border-border bg-[#111111] p-4">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <Sliders className="h-3.5 w-3.5" />
            <span>Room Settings</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 text-center">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] uppercase text-neutral-500 font-semibold">Rounds</span>
              <span className="font-mono text-xs font-bold text-white">{room.settings.roundCount}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] uppercase text-neutral-500 font-semibold">Draw Time</span>
              <span className="font-mono text-xs font-bold text-white">{room.settings.drawTimerSec}s</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] uppercase text-neutral-500 font-semibold">Describe Time</span>
              <span className="font-mono text-xs font-bold text-white">{room.settings.describeTimerSec}s</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] uppercase text-neutral-500 font-semibold">Max Players</span>
              <span className="font-mono text-xs font-bold text-white">{room.settings.maxPlayers}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] uppercase text-neutral-500 font-semibold">Spectators</span>
              <span className="font-mono text-xs font-bold text-white">{room.settings.allowSpectators ? 'On' : 'Off'}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] uppercase text-neutral-500 font-semibold">Profanity Filter</span>
              <span className="font-mono text-xs font-bold text-white">{room.settings.profanityFilter ? 'On' : 'Off'}</span>
            </div>
          </div>
        </div>

        {/* Spectators */}
        {room.spectators.length > 0 && (
          <div className="rounded-[4px] border border-border bg-[#0E0E0E] p-3">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
              <Eye className="h-3.5 w-3.5" />
              <span>Spectators ({room.spectators.length}):</span>
              <span className="text-neutral-300">
                {room.spectators.map((s) => s.displayName).join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Row (Always visible, zero scroll) */}
      <div className="flex items-center justify-between border-t border-border bg-[#0E0E0E] p-3 rounded-[4px]">
        <div className="text-xs text-neutral-400">
          {isHost ? (
            room.canStart ? (
              <span className="text-white font-medium">All players ready. You can start the game.</span>
            ) : (
              <span>{room.canStartReasons[0] || 'Waiting for all players to be ready...'}</span>
            )
          ) : currentParticipant?.isReady ? (
            <span className="text-white font-medium">You are ready. Waiting for host to launch...</span>
          ) : (
            <span>Click &apos;Ready&apos; when you are prepared to play.</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isSpectator && currentParticipant && (
            <ReadyButton
              roomCode={room.code}
              isReady={currentParticipant.isReady}
              onToggled={() => refetch()}
            />
          )}

          {isHost && (
            <StartGameButton
              canStart={room.canStart}
              canStartReasons={room.canStartReasons}
              onStartGame={handleStartGame}
              isLoading={isStartingGame}
            />
          )}
        </div>
      </div>
    </div>
  );
}
