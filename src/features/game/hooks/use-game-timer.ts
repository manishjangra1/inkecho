'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/game-store';

export interface UseGameTimerOptions {
  readonly onExpired?: () => void;
}

export function useGameTimer(options: UseGameTimerOptions = {}) {
  const isPaused = useGameStore((state) => state.isPaused);
  const remainingSeconds = useGameStore((state) => state.remainingSeconds);
  const setRemainingSeconds = useGameStore((state) => state.setRemainingSeconds);
  const turnEndsAt = useGameStore((state) => state.game?.currentTurn.turnEndsAt);
  const hasTriggeredExpiryRef = useRef<string | null>(null);

  useEffect(() => {
    if (isPaused || !turnEndsAt) return;

    // Reset expiry trigger for new turnEndsAt
    if (hasTriggeredExpiryRef.current !== turnEndsAt) {
      hasTriggeredExpiryRef.current = null;
    }

    const checkTimer = () => {
      const now = Date.now();
      const ends = new Date(turnEndsAt).getTime();
      const diff = Math.max(0, Math.ceil((ends - now) / 1000));
      setRemainingSeconds(diff);

      if (diff === 0 && hasTriggeredExpiryRef.current !== turnEndsAt) {
        hasTriggeredExpiryRef.current = turnEndsAt;
        options.onExpired?.();
      }
    };

    // Run immediately
    checkTimer();

    // Check frequently (every 250ms) for high accuracy and precision
    const interval = setInterval(checkTimer, 250);

    return () => clearInterval(interval);
  }, [isPaused, turnEndsAt, setRemainingSeconds, options]);

  return {
    remainingSeconds,
    isUrgent: remainingSeconds > 0 && remainingSeconds <= 10,
    isExpired: remainingSeconds === 0,
  };
}
