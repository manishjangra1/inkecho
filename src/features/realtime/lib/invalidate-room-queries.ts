import type { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export function invalidateRoomSessionQueries(
  queryClient: QueryClient,
  roomCode: string
): void {
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM(roomCode) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GAME(roomCode) });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVEAL(roomCode) });
}
