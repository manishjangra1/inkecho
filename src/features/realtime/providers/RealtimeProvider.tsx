'use client';

import React, { useEffect } from 'react';
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

  return <>{children}</>;
}
