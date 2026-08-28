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
          className="flex h-[64px] select-none items-center justify-center gap-1.5 rounded-[4px] border border-dashed border-[#232323] bg-[#0E0E0E] px-3 py-2 text-neutral-600"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium">Empty Slot</span>
        </Card>
      ))}
    </div>
  );
}
