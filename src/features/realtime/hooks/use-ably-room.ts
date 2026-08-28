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
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (!roomId || !playerId) return;

    let isMounted = true;

    async function initAbly() {
      try {
        const client = await createAblyRealtimeClient(roomId, playerId);
        if (!isMounted) {
          try {
            client.close();
          } catch {
            // Ignore
          }
          return;
        }

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
          if (onMessageRef.current) {
            onMessageRef.current(msg);
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
        if (isMounted) {
          setConnectionState('failed');
        }
      }
    }

    void initAbly();

    return () => {
      isMounted = false;

      try {
        if (channelRef.current) {
          try {
            channelRef.current.presence.leave().catch(() => {});
          } catch {
            // Ignore
          }
          try {
            channelRef.current.unsubscribe();
          } catch {
            // Ignore
          }
          channelRef.current = null;
        }
      } catch {
        // Ignore
      }

      try {
        if (clientRef.current) {
          const c = clientRef.current;
          clientRef.current = null;
          try {
            c.connection.off();
          } catch {
            // Ignore
          }
          if (c.connection.state !== 'closed' && c.connection.state !== 'closing') {
            try {
              c.close();
            } catch {
              // Ignore
            }
          }
        }
      } catch {
        // Ignore
      }
    };
  }, [roomId, playerId, displayName, role]);

  return {
    channel: channelRef.current,
    connectionState,
  };
}
