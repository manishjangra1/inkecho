'use client';

import { motion } from 'framer-motion';
import { Crown, Check, Clock } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { ConnectionBadge } from './ConnectionBadge';
import { PlayerCardMenu } from './PlayerCardMenu';
import { LOBBY_COPY } from '@/shared/constants/copy/lobby';
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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'flex items-center justify-between border p-4 backdrop-blur-sm transition-all',
          isReady
            ? 'border-game-ready/40 bg-card/80 shadow-[0_0_12px_rgba(34,197,94,0.1)]'
            : 'border-border/70 bg-card/40',
          isCurrentPlayer && 'ring-1 ring-brand-primary'
        )}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-border shadow-sm">
              <AvatarImage src={participant.avatarUrl || undefined} />
              <AvatarFallback className="bg-brand-primary/10 font-bold text-brand-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isHost && (
              <div
                className="absolute -right-1 -top-2 rounded-full bg-amber-400 p-0.5 text-black shadow-sm"
                title="Room Host"
              >
                <Crown className="h-3.5 w-3.5 fill-black" />
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="max-w-[120px] truncate text-sm font-semibold text-foreground sm:max-w-[160px]">
                {participant.displayName}
              </span>
              {isCurrentPlayer && (
                <Badge
                  variant="outline"
                  className="h-4 border-brand-primary/40 px-1.5 py-0 text-[10px] text-brand-primary"
                >
                  {LOBBY_COPY.YOU_BADGE}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ConnectionBadge status={participant.connectionStatus} />
              <span className="text-xs text-muted-foreground">
                {isReady ? (
                  <span className="inline-flex items-center gap-1 font-medium text-game-ready">
                    <Check className="h-3 w-3" />
                    {LOBBY_COPY.STATUS.READY}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                    <Clock className="h-3 w-3" />
                    {LOBBY_COPY.STATUS.WAITING}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Host menu if viewer is host and this is not the host themselves */}
        {isHostViewer && !isHost && (
          <PlayerCardMenu
            roomCode={roomCode}
            participant={participant}
            onPlayerUpdated={onPlayerUpdated}
          />
        )}
      </Card>
    </motion.div>
  );
}
