'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Stroke } from '../types/canvas.types';
import { CANVAS_CONFIG } from '@/shared/config/canvas.config';

export interface UseCanvasUndoRedoOptions {
  readonly initialStrokes?: readonly Stroke[];
  readonly enableKeyboardShortcuts?: boolean;
  readonly onStrokesChange?: (strokes: readonly Stroke[]) => void;
}

export function useCanvasUndoRedo(options: UseCanvasUndoRedoOptions = {}) {
  const { initialStrokes = [], enableKeyboardShortcuts = true, onStrokesChange } = options;

  const [strokes, setStrokesState] = useState<readonly Stroke[]>(initialStrokes);
  const [redoStack, setRedoStack] = useState<readonly Stroke[]>([]);

  const notifyChange = useCallback(
    (newStrokes: readonly Stroke[]) => {
      if (onStrokesChange) {
        onStrokesChange(newStrokes);
      }
    },
    [onStrokesChange]
  );

  const pushStroke = useCallback(
    (stroke: Stroke) => {
      setStrokesState((prev) => {
        let updated = [...prev, stroke];
        if (updated.length > CANVAS_CONFIG.UNDO_REDO.MAX_STACK_DEPTH) {
          updated = updated.slice(updated.length - CANVAS_CONFIG.UNDO_REDO.MAX_STACK_DEPTH);
        }
        notifyChange(updated);
        return updated;
      });
      setRedoStack([]);
    },
    [notifyChange]
  );

  const undo = useCallback(() => {
    setStrokesState((prev) => {
      if (prev.length === 0) return prev;
      const lastStroke = prev[prev.length - 1]!;
      const updated = prev.slice(0, -1);

      setRedoStack((redoPrev) => [...redoPrev, lastStroke]);
      notifyChange(updated);
      return updated;
    });
  }, [notifyChange]);

  const redo = useCallback(() => {
    setRedoStack((redoPrev) => {
      if (redoPrev.length === 0) return redoPrev;
      const strokeToRestore = redoPrev[redoPrev.length - 1]!;
      const updatedRedo = redoPrev.slice(0, -1);

      setStrokesState((prev) => {
        const updated = [...prev, strokeToRestore];
        notifyChange(updated);
        return updated;
      });

      return updatedRedo;
    });
  }, [notifyChange]);

  const clearStrokes = useCallback(() => {
    setStrokesState([]);
    setRedoStack([]);
    notifyChange([]);
  }, [notifyChange]);

  const setStrokes = useCallback(
    (newStrokes: readonly Stroke[]) => {
      setStrokesState(newStrokes);
      setRedoStack([]);
      notifyChange(newStrokes);
    },
    [notifyChange]
  );

  // Global keyboard shortcuts for undo / redo
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is currently typing in an input/textarea
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const isCmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      if (isCmdOrCtrl && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (isCmdOrCtrl && event.key.toLowerCase() === 'y' && !isMac) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, undo, redo]);

  return {
    strokes,
    redoStack,
    canUndo: strokes.length > 0,
    canRedo: redoStack.length > 0,
    pushStroke,
    undo,
    redo,
    clearStrokes,
    setStrokes,
  };
}
