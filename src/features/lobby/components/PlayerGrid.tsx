import { PlayerCard } from './PlayerCard';
import { Card } from '@/shared/ui/card';
import { UserPlus } from 'lucide-react';
import type { ParticipantDto } from '@/infrastructure/db/mappers/participant.mapper';

interface PlayerGridProps {
  readonly participants: ReadonlyArray<ParticipantDto>;
  readonly maxPlayers: number;
  readonly currentPlayerId?: string;
  readonly isHostViewer: boolean;
  readonly roomCode: string;
  readonly onPlayerUpdated?: () => void;
}

export function PlayerGrid({
  participants,
  maxPlayers,
  currentPlayerId,
  isHostViewer,
  roomCode,
  onPlayerUpdated,
}: PlayerGridProps) {
  const emptySlotsCount = Math.max(0, maxPlayers - participants.length);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {participants.map((player) => (
        <PlayerCard
          key={player.playerId}
          participant={player}
          isCurrentPlayer={player.playerId === currentPlayerId}
          isHostViewer={isHostViewer}
          roomCode={roomCode}
          onPlayerUpdated={onPlayerUpdated}
        />
      ))}

      {/* Empty slot placeholders */}
      {Array.from({ length: emptySlotsCount }).map((_, i) => (
        <Card
          key={`empty-${i}`}
          className="flex min-h-[82px] select-none items-center justify-center gap-2 border-dashed border-border/50 bg-card/20 p-4 text-muted-foreground/40"
        >
          <UserPlus className="h-4 w-4" />
          <span className="text-xs font-medium">Waiting for player...</span>
        </Card>
      ))}
    </div>
  );
}
