import type * as Ably from 'ably';
import { BaseRealtime, WebSocketTransport, FetchRequest, RealtimePresence } from 'ably/modular';

/**
 * Creates an Ably.Realtime browser client scoped to a specific room.
 * Uses authUrl endpoint to obtain subscribe & presence tokens.
 */
export async function createAblyRealtimeClient(
  roomId: string,
  playerId: string
): Promise<Ably.Realtime> {
  const client = new BaseRealtime({
    authUrl: `/api/realtime/token?roomId=${encodeURIComponent(roomId)}`,
    clientId: playerId,
    autoConnect: true,
    plugins: {
      WebSocketTransport,
      FetchRequest,
      RealtimePresence,
    },
  });

  return client as unknown as Ably.Realtime;
}
