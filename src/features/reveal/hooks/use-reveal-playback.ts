'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { voteChainAction } from '../actions/vote-chain.action';
import { GAME_CONFIG } from '@/shared/config/game.config';
import type { RevealDataResponse, RevealChainItem } from '../types/reveal.types';

export interface UseRevealPlaybackOptions {
  roomCode: string;
  autoPlayDefault?: boolean;
}

export function useRevealPlayback({ roomCode, autoPlayDefault = true }: UseRevealPlaybackOptions) {
  const [selectedChainIndex, setSelectedChainIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlayDefault);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedChainIndex, setVotedChainIndex] = useState<number | null>(null);
  const [localVotes, setLocalVotes] = useState<Record<string, number>>({});
  const [winningChainIndex, setWinningChainIndex] = useState<number | null>(null);

  // Fetch initial reveal snapshot
  const { data, isLoading, isError, refetch } = useQuery<{
    success: boolean;
    data: RevealDataResponse;
  }>({
    queryKey: ['reveal', roomCode],
    queryFn: async () => {
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomCode)}/reveal`);
      if (!res.ok) {
        throw new Error('Failed to load reveal playback');
      }
      return res.json();
    },
    staleTime: 10000,
  });

  const revealData = data?.data;
  const chains: readonly RevealChainItem[] = useMemo(() => revealData?.chains ?? [], [revealData]);
  const currentChain = chains[selectedChainIndex] ?? null;
  const totalSteps = currentChain?.totalSteps ?? 0;
  const isLastStepOfChain = currentStepIndex >= totalSteps - 1;
  const isLastChain = selectedChainIndex >= chains.length - 1;
  const isAllCompleted = isLastChain && isLastStepOfChain;

  useEffect(() => {
    if (revealData) {
      setLocalVotes(revealData.votes || {});
      setWinningChainIndex(revealData.winningChainIndex);
    }
  }, [revealData]);

  // Step advancement logic
  const nextStep = useCallback(() => {
    if (!currentChain) return;

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else if (selectedChainIndex < chains.length - 1) {
      setSelectedChainIndex((prev) => prev + 1);
      setCurrentStepIndex(0);
    } else {
      setIsPlaying(false);
    }
  }, [currentChain, currentStepIndex, totalSteps, selectedChainIndex, chains.length]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else if (selectedChainIndex > 0) {
      const prevChainIdx = selectedChainIndex - 1;
      setSelectedChainIndex(prevChainIdx);
      const prevChain = chains[prevChainIdx];
      setCurrentStepIndex(prevChain ? prevChain.totalSteps - 1 : 0);
    }
  }, [currentStepIndex, selectedChainIndex, chains]);

  const goToChain = useCallback((index: number) => {
    setSelectedChainIndex(index);
    setCurrentStepIndex(0);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Auto-advance timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying || isAllCompleted || isLoading || !currentChain) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextStep();
    }, GAME_CONFIG.REVEAL_STEP_DURATION_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isAllCompleted, isLoading, currentChain, nextStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextStep, prevStep]);

  // Cast vote action
  const castVote = async (chainIndex: number) => {
    if (hasVoted) {
      toast.info('You have already voted!');
      return;
    }

    // Optimistically update
    const chainKey = String(chainIndex);
    setLocalVotes((prev) => ({
      ...prev,
      [chainKey]: (prev[chainKey] || 0) + 1,
    }));
    setHasVoted(true);
    setVotedChainIndex(chainIndex);

    try {
      const res = await voteChainAction({ roomCode, chainIndex });
      if (!res.success) {
        toast.error(res.error.message || 'Failed to submit vote');
        // Rollback
        setLocalVotes((prev) => ({
          ...prev,
          [chainKey]: Math.max(0, (prev[chainKey] || 1) - 1),
        }));
        setHasVoted(false);
        setVotedChainIndex(null);
      } else {
        setLocalVotes(res.data.votes);
        setWinningChainIndex(res.data.winningChainIndex);
        toast.success('Vote recorded!');
      }
    } catch {
      toast.error('An unexpected error occurred while voting.');
    }
  };

  return {
    revealData,
    chains,
    currentChain,
    selectedChainIndex,
    currentStepIndex,
    totalSteps,
    isPlaying,
    isAllCompleted,
    isHost: revealData?.isHost ?? false,
    isSpectator: revealData?.isSpectator ?? false,
    votes: localVotes,
    hasVoted,
    votedChainIndex,
    winningChainIndex,
    isLoading,
    isError,
    nextStep,
    prevStep,
    goToChain,
    togglePlayPause,
    castVote,
    refetch,
  };
}
