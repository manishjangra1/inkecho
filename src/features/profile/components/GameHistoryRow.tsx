'use client';

import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { formatDate, formatRelativeTime } from '@/shared/lib/utils/format-date';
import { Trophy, Layers, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { GameHistoryItemDto } from '@/infrastructure/db/repositories/game-history.repository';

export interface GameHistoryRowProps {
  item: GameHistoryItemDto;
}

export function GameHistoryRow({ item }: GameHistoryRowProps) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-border/40 bg-card/40 p-4 transition-all hover:bg-card sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/60 font-mono text-xs font-bold text-foreground">
          {item.roomCode}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">Room {item.roomCode}</span>
            {item.wonVote && (
              <Badge
                variant="default"
                className="gap-1 border-amber-500/30 bg-amber-500/10 text-[10px] font-bold text-amber-500"
              >
                <Trophy className="h-3 w-3" /> Winner
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(item.playedAt)} ({formatRelativeTime(item.playedAt)})
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {item.chainsPlayed} Stories
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <Link
          href={`/room/${item.roomCode}/reveal`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>View Reveal</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
