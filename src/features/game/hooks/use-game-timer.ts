'use client';

import { useEffect } from 'react';
import { useGameStore } from '../stores/game-store';

export function useGameTimer() {
  const isPaused = useGameStore((state) => state.isPaused);
  const remainingSeconds = useGameStore((state) => state.remainingSeconds);
  const setRemainingSeconds = useGameStore((state) => state.setRemainingSeconds);
  const turnEndsAt = useGameStore((state) => state.game?.currentTurn.turnEndsAt);

  useEffect(() => {
    if (isPaused || !turnEndsAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const ends = new Date(turnEndsAt).getTime();
      const diff = Math.max(0, Math.ceil((ends - now) / 1000));
      setRemainingSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, turnEndsAt, setRemainingSeconds]);

  return {
    remainingSeconds,
    isUrgent: remainingSeconds > 0 && remainingSeconds <= 10,
    isExpired: remainingSeconds === 0,
  };
}
