'use client';

import { useCallback } from 'react';
import type * as Ably from 'ably';
import { useQueryClient } from '@tanstack/react-query';
import { useGameStore } from '@/features/game/stores/game-store';
import { reduceRealtimeEvent } from '../lib/event-reducer';
import type { RealtimeEnvelope } from '@/shared/constants/realtime-events';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export function useRealtimeSync(roomCode: string, playerId: string) {
  const queryClient = useQueryClient();

  const handleRealtimeMessage = useCallback(
    (message: Ably.Message) => {
      const envelope = message.data as RealtimeEnvelope;
      if (!envelope || !envelope.name) return;

      const store = useGameStore.getState();

      // Apply to Zustand game store
      reduceRealtimeEvent(envelope, store, playerId);

      // Invalidate room query on lobby changes
      if (envelope.scope === 'room' || envelope.name === 'returned_to_lobby') {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.ROOM, roomCode],
        });
      }
    },
    [queryClient, roomCode, playerId]
  );

  return { handleRealtimeMessage };
}
