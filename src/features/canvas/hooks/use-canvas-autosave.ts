'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Stroke, CanvasDraft } from '../types/canvas.types';
import { canvasDraftSchema } from '../schemas/canvas.schema';
import { CANVAS_CONFIG } from '@/shared/config/canvas.config';

export interface UseCanvasAutosaveOptions {
  readonly gameId: string;
  readonly chainIndex: number;
  readonly turnIndex: number;
  readonly strokes: readonly Stroke[];
  readonly onDraftFound?: (draft: CanvasDraft) => void;
}

export function useCanvasAutosave({
  gameId,
  chainIndex,
  turnIndex,
  strokes,
  onDraftFound,
}: UseCanvasAutosaveOptions) {
  const storageKey = `${CANVAS_CONFIG.AUTOSAVE.STORAGE_KEY_PREFIX}${gameId}:${chainIndex}:${turnIndex}`;
  const [foundDraft, setFoundDraft] = useState<CanvasDraft | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for existing draft on mount or when turn identity changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const result = canvasDraftSchema.safeParse(parsed);
        if (result.success && result.data.strokes.length > 0) {
          setFoundDraft(result.data);
          if (onDraftFound) {
            onDraftFound(result.data);
          }
        }
      }
    } catch {
      // Ignore localStorage read errors (incognito/security)
    }
  }, [storageKey, onDraftFound]);

  // Debounced autosave whenever strokes change
  useEffect(() => {
    if (strokes.length === 0) {
      return;
    }

    setIsSaved(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        const draft: CanvasDraft = {
          gameId,
          chainIndex,
          turnIndex,
          strokes,
          savedAt: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(draft));
        setIsSaved(true);
      } catch {
        // Ignore quota/security errors
      }
    }, CANVAS_CONFIG.AUTOSAVE.DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [strokes, gameId, chainIndex, turnIndex, storageKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setFoundDraft(null);
      setIsSaved(true);
    } catch {
      // Ignore
    }
  }, [storageKey]);

  return {
    foundDraft,
    hasDraft: !!foundDraft && foundDraft.strokes.length > 0,
    isSaved,
    clearDraft,
    dismissFoundDraft: () => setFoundDraft(null),
  };
}
