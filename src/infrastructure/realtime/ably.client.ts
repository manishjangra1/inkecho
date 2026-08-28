import type * as Ably from 'ably';

/**
 * Creates an Ably.Realtime browser client scoped to a specific room.
 * Uses authUrl endpoint to obtain subscribe & presence tokens.
 */
export async function createAblyRealtimeClient(
  roomId: string,
  playerId: string
): Promise<Ably.Realtime> {
  const AblyModule = await import('ably');
  const RealtimeConstructor = AblyModule.Realtime || AblyModule.default?.Realtime;

  return new RealtimeConstructor({
    authUrl: `/api/realtime/token?roomId=${encodeURIComponent(roomId)}`,
    clientId: playerId,
    autoConnect: true,
  });
}
