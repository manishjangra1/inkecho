'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useRoom } from '@/features/rooms/hooks/use-room';
import { InviteLinkBar } from '@/features/rooms/components/InviteLinkBar';
import { PlayerGrid } from './PlayerGrid';
import { ReadyButton } from './ReadyButton';
import { StartGameButton } from './StartGameButton';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Users, Eye, Sparkles } from 'lucide-react';
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
    refetchInterval: 2500, // Lobby state auto-polling
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
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const activePlayers = room.participants;
  const readyCount = activePlayers.filter((p) => p.isReady).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Invite bar */}
      <InviteLinkBar roomCode={room.code} />

      {/* Lobby stats header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold text-foreground sm:text-3xl">
            <Sparkles className="h-6 w-6 text-brand-primary" />
            Game Lobby
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isHost
              ? 'You are the host. Customize settings and start when everyone is ready.'
              : 'Waiting for host to start the game...'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Card className="flex items-center gap-2 border-border/70 bg-card/50 px-3.5 py-2">
            <Users className="h-4 w-4 text-brand-primary" />
            <span className="text-sm font-semibold">
              {activePlayers.length}/{room.settings.maxPlayers}
            </span>
            <span className="text-xs text-muted-foreground">Players</span>
          </Card>

          <Card className="flex items-center gap-2 border-border/70 bg-card/50 px-3.5 py-2">
            <span className="text-sm font-semibold text-game-ready">
              {readyCount}/{activePlayers.length}
            </span>
            <span className="text-xs text-muted-foreground">Ready</span>
          </Card>
        </div>
      </div>

      {/* Players Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Players in Lobby
        </h2>
        <PlayerGrid
          participants={activePlayers}
          maxPlayers={room.settings.maxPlayers}
          currentPlayerId={currentPlayerId}
          isHostViewer={isHost}
          roomCode={room.code}
          onPlayerUpdated={() => refetch()}
        />
      </div>

      {/* Spectators section if any */}
      {room.spectators.length > 0 && (
        <div className="space-y-3 border-t border-border/40 pt-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Eye className="h-4 w-4" />
            Spectators ({room.spectators.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {room.spectators.map((spectator) => (
              <span
                key={spectator.playerId}
                className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground"
              >
                {spectator.displayName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-xl backdrop-blur-xl">
        <div className="text-xs text-muted-foreground">
          {isHost ? (
            room.canStart ? (
              <span className="font-medium text-game-ready">
                All players ready! You can start the game.
              </span>
            ) : (
              <span>{room.canStartReasons[0] || 'Waiting for all players to be ready...'}</span>
            )
          ) : currentParticipant?.isReady ? (
            <span className="font-medium text-game-ready">
              You are marked as ready! Waiting for host.
            </span>
          ) : (
            <span>Click &apos;Ready&apos; when you are prepared to play.</span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3">
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
