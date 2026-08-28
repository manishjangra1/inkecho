'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Undo2, Redo2 } from 'lucide-react';

export interface UndoRedoButtonsProps {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly disabled?: boolean;
}

export function UndoRedoButtons({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  disabled = false,
}: UndoRedoButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || !canUndo}
        onClick={onUndo}
        aria-label="Undo (Ctrl+Z)"
        title="Undo (Ctrl+Z / Cmd+Z)"
        className="h-8 w-8 rounded-lg"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || !canRedo}
        onClick={onRedo}
        aria-label="Redo (Ctrl+Shift+Z)"
        title="Redo (Ctrl+Shift+Z / Cmd+Shift+Z)"
        className="h-8 w-8 rounded-lg"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
