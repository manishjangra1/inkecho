'use client';

import React from 'react';
import { GameHistoryRow } from './GameHistoryRow';
import { Button } from '@/shared/ui/button';
import { useGameHistory } from '../hooks/use-game-history';
import { Gamepad2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function GameHistoryList() {
  const { items, total, totalPages, page, isLoading, setPage } = useGameHistory(1, 10);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your match history...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-border/70 bg-card/20 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Gamepad2 className="h-7 w-7 opacity-70" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">No matches played yet</h3>
          <p className="max-w-sm text-xs text-muted-foreground">
            Join or create a room with friends to start playing and build your game history!
          </p>
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/browse">Browse Public Rooms</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Recent Matches ({total})
        </h3>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <GameHistoryRow key={item.id} item={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="gap-1 rounded-full text-xs"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          <span className="text-xs font-semibold text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="gap-1 rounded-full text-xs"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
