'use client';

import { useEffect, useRef } from 'react';

interface UseRoomLeaveGuardParams {
  readonly roomCode: string;
  readonly onRequestLeave: () => void;
  readonly enabled?: boolean;
}

/**
 * Guard hook for active room sessions:
 * 1. Prompts before tab/browser close or reload (beforeunload)
 * 2. Emits beacon to leave room on pagehide/unload
 * 3. Traps browser back button navigation (popstate) and triggers leave confirmation
 */
export function useRoomLeaveGuard({
  roomCode,
  onRequestLeave,
  enabled = true,
}: UseRoomLeaveGuardParams) {
  const onRequestLeaveRef = useRef(onRequestLeave);

  useEffect(() => {
    onRequestLeaveRef.current = onRequestLeave;
  }, [onRequestLeave]);

  // 1. Tab / window close or reload warning & beacon leave
  useEffect(() => {
    if (!enabled || !roomCode) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern standard way to show browser confirmation prompt
      e.returnValue = '';
      return '';
    };

    const handlePageHide = () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon(`/api/rooms/${roomCode}/leave`);
        }
      } catch {
        // Ignore beacon errors on cleanup
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [roomCode, enabled]);

  // 2. Browser Back Button interceptor (popstate)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Push a dummy state so that pressing Back triggers popstate on our page instead of instantly navigating away
    window.history.pushState({ inInkEchoRoom: true }, '', window.location.href);

    const handlePopState = (_e: PopStateEvent) => {
      // Re-push state to keep the user on the current room page
      window.history.pushState({ inInkEchoRoom: true }, '', window.location.href);
      // Trigger confirmation dialog
      onRequestLeaveRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled]);
}
