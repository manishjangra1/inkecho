'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { GameHistoryResponse } from '../types/profile.types';

export function useGameHistory(initialPage: number = 1, limit: number = 10) {
  const [page, setPage] = useState(initialPage);

  const { data, isLoading, isError, error, refetch } = useQuery<{
    success: boolean;
    data: GameHistoryResponse;
  }>({
    queryKey: ['game-history', page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/profile/history?page=${page}&limit=${limit}`);
      if (!res.ok) {
        throw new Error('Failed to load game history');
      }
      return res.json();
    },
    staleTime: 30000,
  });

  const history = data?.data;

  return {
    items: history?.items ?? [],
    total: history?.total ?? 0,
    totalPages: history?.totalPages ?? 1,
    page,
    limit,
    isLoading,
    isError,
    error,
    setPage,
    refetch,
  };
}
