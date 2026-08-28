'use client';

import { useCallback } from 'react';
import type * as Ably from 'ably';
import { useQueryClient } from '@tanstack/react-query';
import { useGameStore } from '@/features/game/stores/game-store';
import { useChatStore } from '@/features/chat/stores/chat-store';
import { reduceRealtimeEvent } from '../lib/event-reducer';
import { reduceRoomCacheEvent } from '../lib/room-cache-reducer';
import { REALTIME_EVENTS, type RealtimeEnvelope } from '@/shared/constants/realtime-events';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import type { ChatMessageDto } from '@/features/chat/types/chat.types';
import type { RoomSnapshotDto } from '@/features/rooms/types/room.types';

export function useRealtimeSync(roomCode: string, playerId: string) {
  const queryClient = useQueryClient();

  const handleRealtimeMessage = useCallback(
    (message: Ably.Message) => {
      const envelope = message.data as RealtimeEnvelope;
      if (!envelope || !envelope.name) return;

      const store = useGameStore.getState();

      // Helper to update RoomSnapshotDto directly in React Query cache without HTTP calls
      const patchRoomCache = (updater: (prev: RoomSnapshotDto) => RoomSnapshotDto) => {
        let updated = false;
        queryClient.setQueryData<RoomSnapshotDto>(QUERY_KEYS.ROOM(roomCode), (old) => {
          if (!old) return old;
          updated = true;
          return updater(old);
        });
        if (!updated) {
          void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM(roomCode) });
        }
      };

      // 1. Handle chat message specifically
      if (envelope.name === REALTIME_EVENTS.CHAT_MESSAGE) {
        const chatPayload = envelope.payload as ChatMessageDto;
        if (chatPayload && chatPayload.text) {
          useChatStore.getState().addMessage(chatPayload);
        }
        return;
      }

      // 2. Handle live reveal votes update
      if (envelope.name === REALTIME_EVENTS.REVEAL_VOTES_UPDATED) {
        const votesPayload = envelope.payload as {
          votes: Record<string, number>;
          winningChainIndex: number | null;
        };
        if (votesPayload?.votes) {
          queryClient.setQueryData(['reveal', roomCode], (old: unknown) => {
            const current = old as { success: boolean; data: Record<string, unknown> } | undefined;
            if (!current?.data) return old;
            return {
              ...current,
              data: {
                ...current.data,
                votes: votesPayload.votes,
                winningChainIndex: votesPayload.winningChainIndex,
              },
            };
          });
        }
        return;
      }

      // 3. Mutate RoomSnapshotDto cache in-memory
      patchRoomCache((currentRoom) => reduceRoomCacheEvent(envelope, currentRoom));

      // 4. Apply to Zustand game store
      reduceRealtimeEvent(envelope, store, playerId);
    },
    [queryClient, roomCode, playerId]
  );

  return { handleRealtimeMessage };
}
