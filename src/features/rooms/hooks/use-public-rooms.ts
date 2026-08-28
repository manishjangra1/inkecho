'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import type { Paginated } from '@/shared/types/pagination.types';
import type { RoomListItemDto } from '../types/room.types';

async function fetchPublicRooms(page = 1, limit = 12): Promise<Paginated<RoomListItemDto>> {
  const res = await fetch(`/api/rooms?page=${page}&limit=${limit}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch public rooms');
  }

  const json = await res.json();
  return json.data;
}

export function usePublicRooms(page = 1, limit = 12) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PUBLIC_ROOMS, page, limit],
    queryFn: () => fetchPublicRooms(page, limit),
    staleTime: 5000,
    refetchInterval: 10000,
  });
}
