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
          'p-4 flex items-center justify-between border transition-all backdrop-blur-sm',
          isReady
            ? 'bg-card/80 border-game-ready/40 shadow-[0_0_12px_rgba(34,197,94,0.1)]'
            : 'bg-card/40 border-border/70',
          isCurrentPlayer && 'ring-1 ring-brand-primary'
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-border shadow-sm">
              <AvatarImage src={participant.avatarUrl || undefined} />
              <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isHost && (
              <div
                className="absolute -top-2 -right-1 bg-amber-400 text-black p-0.5 rounded-full shadow-sm"
                title="Room Host"
              >
                <Crown className="h-3.5 w-3.5 fill-black" />
              </div>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground truncate max-w-[120px] sm:max-w-[160px]">
                {participant.displayName}
              </span>
              {isCurrentPlayer && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-brand-primary/40 text-brand-primary">
                  {LOBBY_COPY.YOU_BADGE}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ConnectionBadge status={participant.connectionStatus} />
              <span className="text-xs text-muted-foreground">
                {isReady ? (
                  <span className="text-game-ready font-medium inline-flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {LOBBY_COPY.STATUS.READY}
                  </span>
                ) : (
                  <span className="text-muted-foreground/70 inline-flex items-center gap-1">
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
