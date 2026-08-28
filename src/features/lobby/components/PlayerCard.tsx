'use client';

import { Card } from '@/shared/ui/card';
import { PlayerAvatar } from '@/shared/ui/player-avatar';
import { Badge } from '@/shared/ui/badge';
import { ConnectionBadge } from './ConnectionBadge';
import { PlayerCardMenu } from './PlayerCardMenu';
import { cn } from '@/shared/lib/cn';
import type { ParticipantDto } from '@/infrastructure/db/mappers/participant.mapper';

interface PlayerCardProps {
  readonly participant: ParticipantDto;
  readonly isCurrentPlayer: boolean;
  readonly isHostViewer: boolean;
  readonly roomCode: string;
  readonly onPlayerUpdated?: () => void;
}

export function PlayerCard({
  participant,
  isCurrentPlayer,
  isHostViewer,
  roomCode,
  onPlayerUpdated,
}: PlayerCardProps) {
  const isHost = participant.role === 'HOST';
  const isReady = participant.isReady;

  return (
    <Card
      className={cn(
        'relative flex flex-col items-center justify-between p-3.5 min-h-[170px] rounded-[4px] border bg-[#111111] transition-all select-none shadow-xl',
        isReady ? 'border-neutral-400 bg-[#161616]' : 'border-border',
        isCurrentPlayer && 'ring-1 ring-white'
      )}
    >
      {/* Top action row: Host badge / Menu */}
      <div className="flex w-full items-center justify-between">
        {isHost ? (
          <span className="flex items-center gap-1 rounded-[2px] bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            👑 Host
          </span>
        ) : (
          <span className="text-[10px] text-neutral-500 font-mono">Player</span>
        )}

        {isHostViewer && !isHost ? (
          <PlayerCardMenu
            roomCode={roomCode}
            participant={participant}
            onPlayerUpdated={onPlayerUpdated}
          />
        ) : (
          <div className="h-6 w-6" />
        )}
      </div>

      {/* Center: Large Avatar with online status */}
      <div className="relative my-2 flex items-center justify-center">
        <PlayerAvatar
          name={participant.displayName}
          seed={participant.playerId || participant.displayName}
          src={participant.avatarUrl}
          className="h-16 w-16 sm:h-20 sm:w-20 shadow-lg border border-neutral-700"
        />
        <div className="absolute -bottom-0.5 -right-0.5">
          <ConnectionBadge status={participant.connectionStatus} />
        </div>
      </div>

      {/* Bottom: Player Name & Ready Badge */}
      <div className="flex w-full flex-col items-center gap-2">
        <span className="max-w-full truncate font-bold text-xs sm:text-sm text-white text-center">
          {participant.displayName}
          {isCurrentPlayer && <span className="text-neutral-400 font-normal ml-1">(You)</span>}
        </span>

        <Badge
          variant={isReady ? 'ready' : 'outline'}
          className={cn(
            'h-6 px-2.5 text-[11px] rounded-[3px] font-semibold w-full justify-center',
            isReady ? 'bg-white text-black font-bold border-white' : 'border-neutral-700 text-neutral-400'
          )}
        >
          {isReady ? 'Ready ✓' : 'Waiting...'}
        </Badge>
      </div>
    </Card>
  );
}
