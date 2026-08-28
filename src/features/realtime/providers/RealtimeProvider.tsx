'use client';

import React, { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { useGameStore } from '@/features/game/stores/game-store';
import { useRealtimeSync } from '../hooks/use-realtime-sync';
import { useAblyRoom } from '../hooks/use-ably-room';

export interface RealtimeProviderProps {
  readonly roomId: string;
  readonly roomCode: string;
  readonly playerId: string;
  readonly displayName: string;
  readonly role: 'HOST' | 'PLAYER' | 'SPECTATOR';
  readonly children: React.ReactNode;
}

export function RealtimeProvider({
  roomId,
  roomCode,
  playerId,
  displayName,
  role,
  children,
}: RealtimeProviderProps) {
  const queryClient = useQueryClient();
  const initRoomContext = useGameStore((state) => state.initRoomContext);
  const setConnectionState = useGameStore((state) => state.setConnectionState);
  const hasRefetchedOnConnect = useRef(false);

  useEffect(() => {
    initRoomContext({
      roomCode,
      roomId,
      playerId,
      isHost: role === 'HOST',
      isSpectator: role === 'SPECTATOR',
    });
  }, [initRoomContext, roomCode, roomId, playerId, role]);

  const { handleRealtimeMessage } = useRealtimeSync(roomCode, playerId);

  const { connectionState } = useAblyRoom({
    roomId,
    playerId,
    displayName,
    role,
    onMessage: handleRealtimeMessage,
  });

  useEffect(() => {
    if (connectionState === 'connected') {
      setConnectionState('connected');

      // One-time refetch after Ably connects to close the race-condition gap.
      // Events fired between the initial HTTP fetch and WebSocket subscription
      // would otherwise be missed permanently with polling disabled.
      if (!hasRefetchedOnConnect.current) {
        hasRefetchedOnConnect.current = true;
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.ROOM(roomCode),
        });
        void queryClient.invalidateQueries({
          queryKey: ['game', roomCode],
        });
        void queryClient.invalidateQueries({
          queryKey: ['reveal', roomCode],
        });
      }
    } else if (connectionState === 'connecting') {
      setConnectionState('connecting');
    } else if (connectionState === 'suspended') {
      setConnectionState('suspended');
    } else {
      setConnectionState('disconnected');
    }
  }, [connectionState, setConnectionState, queryClient, roomCode]);

  return <>{children}</>;
}
