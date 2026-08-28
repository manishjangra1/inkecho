'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePublicRooms } from '../hooks/use-public-rooms';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { RefreshCw, Plus, ArrowRight, Eye, Users } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

export function PublicRoomList() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError, refetch, isRefetching } = usePublicRooms(page, 15);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-[4px]" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-[4px]" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3 py-12 text-center">
        <p className="text-xs text-[#D9534F]">Could not load public rooms.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="space-y-3 rounded-[4px] border border-dashed border-[#232323] bg-[#0E0E0E] p-12 text-center">
        <h3 className="text-xs font-semibold text-white">No active public rooms</h3>
        <p className="text-[11px] text-neutral-500">
          Create a room to start sketching and invite your friends.
        </p>
        <div className="pt-2">
          <Link href={ROUTES.CREATE}>
            <Button variant="default" size="sm" className="gap-1.5 text-xs font-medium">
              <Plus className="h-3.5 w-3.5" />
              Create Room
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          Active Public Rooms ({data?.total ?? items.length})
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="h-6 gap-1 px-2 text-[11px] text-neutral-400 hover:text-white"
        >
          <RefreshCw className={`h-3 w-3 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* High Density Table */}
      <div className="rounded-[4px] border border-border bg-[#111111] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-[#0E0E0E] text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
            <tr>
              <th className="px-3.5 py-2">Room Code</th>
              <th className="px-3.5 py-2">Status</th>
              <th className="px-3.5 py-2">Host</th>
              <th className="px-3.5 py-2">Players</th>
              <th className="px-3.5 py-2">Rounds</th>
              <th className="px-3.5 py-2">Draw Time</th>
              <th className="px-3.5 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C1C]">
            {items.map((room) => {
              const isFull = room.playerCount >= room.maxPlayers;
              const isLobby = room.status === 'LOBBY';
              const canJoinAsPlayer = isLobby && !isFull;
              const canSpectate = room.allowSpectators && (!isLobby || isFull);

              return (
                <tr key={room.id} className="hover:bg-[#161616] transition-colors">
                  <td className="px-3.5 py-2 font-mono font-bold text-white">
                    {room.code}
                  </td>
                  <td className="px-3.5 py-2">
                    {room.status === 'LOBBY' ? (
                      <span className="inline-flex items-center rounded-[3px] border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                        Lobby
                      </span>
                    ) : room.status === 'IN_PROGRESS' ? (
                      <span className="inline-flex items-center rounded-[3px] border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                        In Game
                      </span>
                    ) : room.status === 'REVEAL' ? (
                      <span className="inline-flex items-center rounded-[3px] border border-sky-500/20 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400">
                        Reveal
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-[3px] border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400">
                        {room.status}
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-2 text-neutral-300 font-medium truncate max-w-[120px]">
                    {room.hostDisplayName}
                  </td>
                  <td className="px-3.5 py-2 font-mono text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-neutral-500" />
                      {room.playerCount} / {room.maxPlayers}
                    </span>
                  </td>
                  <td className="px-3.5 py-2 font-mono text-neutral-400">
                    {room.roundCount}
                  </td>
                  <td className="px-3.5 py-2 font-mono text-neutral-400">
                    {room.drawTimerSec}s
                  </td>
                  <td className="px-3.5 py-2 text-right">
                    {canJoinAsPlayer ? (
                      <Link href={`/join/${room.code}`}>
                        <Button variant="outline" size="sm" className="h-6 gap-1 px-2 text-[11px] text-white hover:bg-neutral-800">
                          <span>Join</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    ) : canSpectate ? (
                      <Link href={`/join/${room.code}?asSpectator=true`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 gap-1 px-2 text-[11px] text-amber-300 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Spectate</span>
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-[11px] text-neutral-600 font-mono">Full</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-6 px-2 text-[11px]"
          >
            Previous
          </Button>
          <span className="font-mono text-[11px] text-neutral-500">
            {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            className="h-6 px-2 text-[11px]"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
