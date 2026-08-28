'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGameStore } from '../stores/game-store';
import type { GameSnapshotDto } from '../types/game.types';

export function useGameState(roomCode: string) {
  const game = useGameStore((state) => state.game);
  const setSnapshot = useGameStore((state) => state.setSnapshot);
  const isHost = useGameStore((state) => state.isHost);
  const isSpectator = useGameStore((state) => state.isSpectator);
  const isPaused = useGameStore((state) => state.isPaused);
  const connectionState = useGameStore((state) => state.connectionState);

  // Fetch initial game snapshot via REST with periodic polling fallback
  const { data, isLoading, isError, error, refetch } = useQuery<{
    success: boolean;
    data: GameSnapshotDto | null;
  }>({
    queryKey: ['game', roomCode],
    queryFn: async () => {
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomCode)}/game`);
      if (res.status === 404) {
        // Active game completed or returned to lobby
        return { success: false, data: null };
      }
      if (!res.ok) {
        throw new Error('Failed to load game session');
      }
      return res.json();
    },
    retry: false,
    refetchInterval: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data?.success && data.data) {
      setSnapshot(data.data);
    }
  }, [data, setSnapshot]);

  const currentTurn = game?.currentTurn ?? null;
  const isMyTurn = currentTurn?.isMyTurn ?? false;
  const turnPhase = currentTurn?.phase ?? 'DESCRIBE';

  return {
    game,
    currentTurn,
    isMyTurn,
    turnPhase,
    isHost,
    isSpectator,
    isPaused,
    connectionState,
    isLoading: isLoading && !game,
    isNoActiveGame: !isLoading && !game && Boolean(data && !data.success),
    isError,
    error,
    refetchSnapshot: refetch,
  };
}
