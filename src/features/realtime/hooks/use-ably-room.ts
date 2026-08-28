'use client';

import { useEffect, useRef, useState } from 'react';
import type * as Ably from 'ably';
import { createAblyRealtimeClient } from '@/infrastructure/realtime/ably.client';
import { getRoomChannelName } from '../lib/channel-names';
import type { ConnectionState, RealtimePresenceData } from '../types/realtime.types';

export interface UseAblyRoomParams {
  readonly roomId: string;
  readonly playerId: string;
  readonly displayName: string;
  readonly role: 'HOST' | 'PLAYER' | 'SPECTATOR';
  readonly onMessage?: (message: Ably.Message) => void;
}

export function useAblyRoom({ roomId, playerId, displayName, role, onMessage }: UseAblyRoomParams) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const clientRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  useEffect(() => {
    if (!roomId || !playerId) return;

    let isMounted = true;
    let client: Ably.Realtime;

    try {
      client = createAblyRealtimeClient(roomId, playerId);
      clientRef.current = client;

      const channelName = getRoomChannelName(roomId);
      const channel = client.channels.get(channelName);
      channelRef.current = channel;

      // Monitor connection state
      client.connection.on((stateChange) => {
        if (!isMounted) return;
        const current = stateChange.current as ConnectionState;
        setConnectionState(current);
      });

      // Subscribe to all incoming channel messages
      const messageListener = (msg: Ably.Message) => {
        if (onMessage) {
          onMessage(msg);
        }
      };

      channel.subscribe(messageListener);

      // Enter presence
      const presenceData: RealtimePresenceData = {
        playerId,
        displayName,
        role,
        connectionStatus: 'ONLINE',
      };

      channel.presence.enter(presenceData).catch(() => {});
    } catch {
      setConnectionState('disconnected');
    }

    return () => {
      isMounted = false;
      try {
        if (channelRef.current) {
          channelRef.current.presence.leave().catch(() => {});
          channelRef.current.unsubscribe();
        }
        if (clientRef.current) {
          clientRef.current.close();
        }
      } catch {
        // ignore cleanup errors
      }
    };
  }, [roomId, playerId, displayName, role, onMessage]);

  return {
    channel: channelRef.current,
    connectionState,
  };
}
