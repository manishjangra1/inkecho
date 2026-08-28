'use client';

import { Card } from '@/shared/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
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

  const initials = participant.displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card
      className={cn(
        'relative flex h-[64px] items-center justify-between px-3 py-2 rounded-[4px] border bg-[#111111] transition-colors select-none',
        isReady ? 'border-neutral-500 bg-[#161616]' : 'border-border',
        isCurrentPlayer && 'border-white'
      )}
    >
      {/* Left: Avatar & Player Details */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
        <Avatar className="h-8 w-8 shrink-0 rounded-[4px] border border-neutral-700 bg-[#1A1A1A]">
          <AvatarImage src={participant.avatarUrl || undefined} />
          <AvatarFallback className="text-[11px] font-bold text-white bg-neutral-800 rounded-[4px]">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-xs text-white truncate">
              {participant.displayName}
            </span>
            {isHost && (
              <span className="shrink-0 text-[10px] font-medium text-neutral-400">Host</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <ConnectionBadge status={participant.connectionStatus} />
            <span className="text-[10px] text-neutral-500 capitalize">
              {participant.connectionStatus.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Ready Indicator & Optional Menu */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Badge
          variant={isReady ? 'ready' : 'outline'}
          className="h-5 px-1.5 text-[10px] rounded-[3px]"
        >
          {isReady ? 'Ready ✓' : 'Waiting'}
        </Badge>

        {isHostViewer && !isHost && (
          <PlayerCardMenu
            roomCode={roomCode}
            participant={participant}
            onPlayerUpdated={onPlayerUpdated}
          />
        )}
      </div>
    </Card>
  );
}
