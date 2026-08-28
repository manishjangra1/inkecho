import * as Ably from 'ably';

/**
 * Creates an Ably.Realtime browser client scoped to a specific room.
 * Uses authUrl endpoint to obtain subscribe & presence tokens.
 */
export function createAblyRealtimeClient(roomId: string, playerId: string): Ably.Realtime {
  return new Ably.Realtime({
    authUrl: `/api/realtime/token?roomId=${encodeURIComponent(roomId)}`,
    clientId: playerId,
    autoConnect: true,
  });
}
