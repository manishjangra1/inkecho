'use client';

import * as React from 'react';
import { usePublicRooms } from '../hooks/use-public-rooms';
import { PublicRoomCard } from './PublicRoomCard';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { RefreshCw, Search, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';

export function PublicRoomList() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError, refetch, isRefetching } = usePublicRooms(page, 12);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 rounded-2xl border border-border/40 p-4 space-y-3 bg-card/30">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-9 w-full mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-destructive">Could not load public rooms.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border/80 bg-card/30 space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Search className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">No active public rooms</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Be the first to host a game and invite your friends!
          </p>
        </div>
        <Link href={ROUTES.CREATE}>
          <Button variant="default" size="sm" className="gap-2 shadow-glow">
            <PlusCircle className="h-4 w-4" />
            Create a Room
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Showing {items.length} of {data?.total ?? 0} public lobbies
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((room) => (
          <PublicRoomCard key={room.id} room={room} />
        ))}
      </div>

      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
