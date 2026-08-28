'use client';

import { useCallback } from 'react';
import type * as Ably from 'ably';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useGameStore } from '@/features/game/stores/game-store';
import { useChatStore } from '@/features/chat/stores/chat-store';
import { reduceRealtimeEvent } from '../lib/event-reducer';
import { reduceRoomCacheEvent } from '../lib/room-cache-reducer';
import { parseRealtimeEnvelope } from '../lib/parse-envelope';
import { REALTIME_EVENTS, type RealtimeEventName } from '@/shared/constants/realtime-events';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { ROUTES } from '@/shared/constants/routes';
import type { ChatMessageDto } from '@/features/chat/types/chat.types';
import type { RoomSnapshotDto } from '@/features/rooms/types/room.types';

const ROOM_RECONCILE_EVENTS = new Set<RealtimeEventName>([
  REALTIME_EVENTS.PLAYER_JOINED,
  REALTIME_EVENTS.PLAYER_LEFT,
  REALTIME_EVENTS.PLAYER_KICKED,
  REALTIME_EVENTS.PLAYER_READY_CHANGED,
  REALTIME_EVENTS.ROOM_SETTINGS_UPDATED,
  REALTIME_EVENTS.HOST_CHANGED,
  REALTIME_EVENTS.GAME_STARTED,
  REALTIME_EVENTS.REVEAL_STARTED,
  REALTIME_EVENTS.GAME_COMPLETED,
  REALTIME_EVENTS.RETURNED_TO_LOBBY,
  REALTIME_EVENTS.ROOM_CLOSED,
]);

const GAME_QUERY_EVENTS = new Set<RealtimeEventName>([
  REALTIME_EVENTS.GAME_STARTED,
  REALTIME_EVENTS.TURN_CHANGED,
  REALTIME_EVENTS.DESCRIPTION_SUBMITTED,
  REALTIME_EVENTS.DRAWING_SUBMITTED,
  REALTIME_EVENTS.REVEAL_STARTED,
  REALTIME_EVENTS.GAME_COMPLETED,
  REALTIME_EVENTS.RETURNED_TO_LOBBY,
]);

function getClientPathname(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

export function useRealtimeSync(roomCode: string, playerId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleRealtimeMessage = useCallback(
    (message: Ably.Message) => {
      const envelope = parseRealtimeEnvelope(message.data, message.name);
      if (!envelope) return;

      const store = useGameStore.getState();
      const pathname = getClientPathname();

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

      if (envelope.name === REALTIME_EVENTS.CHAT_MESSAGE) {
        const chatPayload = envelope.payload as ChatMessageDto;
        if (chatPayload && chatPayload.text) {
          useChatStore.getState().addMessage(chatPayload);
        }
        return;
      }

      if (envelope.name === REALTIME_EVENTS.REVEAL_VOTES_UPDATED) {
        const votesPayload = envelope.payload as {
          votes: Record<string, number>;
          winningChainIndex: number | null;
        };
        if (votesPayload?.votes) {
          queryClient.setQueryData(QUERY_KEYS.REVEAL(roomCode), (old: unknown) => {
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

      patchRoomCache((currentRoom) => reduceRoomCacheEvent(envelope, currentRoom));

      if (ROOM_RECONCILE_EVENTS.has(envelope.name)) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM(roomCode) });
      }

      if (GAME_QUERY_EVENTS.has(envelope.name)) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GAME(roomCode) });
      }

      if (envelope.name === REALTIME_EVENTS.RETURNED_TO_LOBBY) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVEAL(roomCode) });
        if (!pathname.includes('/lobby')) {
          router.push(ROUTES.ROOM.LOBBY(roomCode));
        }
      } else if (envelope.name === REALTIME_EVENTS.GAME_STARTED) {
        if (pathname.includes('/lobby')) {
          router.push(ROUTES.ROOM.GAME(roomCode));
        }
      } else if (envelope.name === REALTIME_EVENTS.REVEAL_STARTED) {
        if (pathname.includes('/game')) {
          router.push(ROUTES.ROOM.REVEAL(roomCode));
        }
      } else if (envelope.name === REALTIME_EVENTS.ROOM_CLOSED) {
        router.push(ROUTES.HOME);
      }

      reduceRealtimeEvent(envelope, store, playerId);
    },
    [queryClient, roomCode, playerId, router]
  );

  return { handleRealtimeMessage };
}
