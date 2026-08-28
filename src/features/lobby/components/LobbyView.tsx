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
  const { data: room = initialRoom, refetch, isLoading } = useRoom(initialRoom.code, {
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

  const handleStartGame = async () => {
    // In Milestone 4, this calls startGameAction.
    // For Milestone 3, we validate readiness and notify host.
    toast.success('Ready to start game! (Game engine initializes in Milestone 4)');
  };

  if (isLoading && !room) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Invite bar */}
      <InviteLinkBar roomCode={room.code} />

      {/* Lobby stats header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-brand-primary" />
            Game Lobby
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isHost
              ? 'You are the host. Customize settings and start when everyone is ready.'
              : 'Waiting for host to start the game...'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Card className="px-3.5 py-2 flex items-center gap-2 border-border/70 bg-card/50">
            <Users className="h-4 w-4 text-brand-primary" />
            <span className="text-sm font-semibold">
              {activePlayers.length}/{room.settings.maxPlayers}
            </span>
            <span className="text-xs text-muted-foreground">Players</span>
          </Card>

          <Card className="px-3.5 py-2 flex items-center gap-2 border-border/70 bg-card/50">
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
        <div className="space-y-3 pt-4 border-t border-border/40">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Eye className="h-4 w-4" />
            Spectators ({room.spectators.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {room.spectators.map((spectator) => (
              <span
                key={spectator.playerId}
                className="px-3 py-1 text-xs rounded-full bg-muted/60 text-muted-foreground border border-border"
              >
                {spectator.displayName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-card/80 border border-border/80 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          {isHost ? (
            room.canStart ? (
              <span className="text-game-ready font-medium">All players ready! You can start the game.</span>
            ) : (
              <span>{room.canStartReasons[0] || 'Waiting for all players to be ready...'}</span>
            )
          ) : currentParticipant?.isReady ? (
            <span className="text-game-ready font-medium">You are marked as ready! Waiting for host.</span>
          ) : (
            <span>Click &apos;Ready&apos; when you are prepared to play.</span>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
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
            />
          )}
        </div>
      </div>
    </div>
  );
}
