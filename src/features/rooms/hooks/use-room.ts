'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import type { RoomSnapshotDto } from '../types/room.types';

async function fetchRoomSnapshot(roomCode: string): Promise<RoomSnapshotDto> {
  const res = await fetch(`/api/rooms/${roomCode}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch room snapshot');
  }

  const json = await res.json();
  return json.data;
}

export function useRoom(
  roomCode: string,
  options: { initialData?: RoomSnapshotDto; refetchInterval?: number | false } = {}
) {
  return useQuery({
    queryKey: QUERY_KEYS.ROOM(roomCode),
    queryFn: () => fetchRoomSnapshot(roomCode),
    initialData: options.initialData,
    enabled: !!roomCode && roomCode.length === 6,
    refetchInterval: options.refetchInterval ?? false,
    staleTime: Infinity,
  });
}
