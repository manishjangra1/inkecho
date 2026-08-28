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
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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
          className="flex min-h-[170px] select-none flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-[#232323] bg-[#0E0E0E] p-4 text-neutral-600"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-neutral-800 bg-[#141414]">
            <UserPlus className="h-5 w-5 text-neutral-600" />
          </div>
          <span className="text-xs font-medium text-neutral-600">Waiting for player...</span>
        </Card>
      ))}
    </div>
  );
}
