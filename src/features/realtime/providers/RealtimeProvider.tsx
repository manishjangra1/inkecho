'use client';

import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { GAME_CONFIG } from '@/shared/config/game.config';
import { useGameStore } from '@/features/game/stores/game-store';
import { useRealtimeSync } from '../hooks/use-realtime-sync';
import { useAblyRoom } from '../hooks/use-ably-room';
import { invalidateRoomSessionQueries } from '../lib/invalidate-room-queries';

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
    } else if (connectionState === 'connecting') {
      setConnectionState('connecting');
    } else if (connectionState === 'suspended') {
      setConnectionState('suspended');
    } else {
      setConnectionState('disconnected');
    }
  }, [connectionState, setConnectionState]);

  useEffect(() => {
    if (connectionState === 'connected') {
      invalidateRoomSessionQueries(queryClient, roomCode);
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      const poll = () => {
        invalidateRoomSessionQueries(queryClient, roomCode);
      };
      poll();
      intervalId = setInterval(poll, GAME_CONFIG.REALTIME_POLLING_INTERVAL_MS);
    }, GAME_CONFIG.REALTIME_POLLING_FALLBACK_MS);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [connectionState, queryClient, roomCode]);

  return <>{children}</>;
}
