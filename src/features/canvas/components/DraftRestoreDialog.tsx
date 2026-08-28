'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Sparkles, Trash2 } from 'lucide-react';
import type { CanvasDraft } from '../types/canvas.types';

export interface DraftRestoreDialogProps {
  readonly draft: CanvasDraft | null;
  readonly onRestore: () => void;
  readonly onDiscard: () => void;
}

export function DraftRestoreDialog({ draft, onRestore, onDiscard }: DraftRestoreDialogProps) {
  if (!draft) return null;

  const timeString = new Date(draft.savedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Dialog open={!!draft} onOpenChange={(open) => !open && onDiscard()}>
      <DialogContent className="border-border bg-card/95 backdrop-blur sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">Restore Unsaved Draft?</DialogTitle>
          <DialogDescription className="text-center">
            We found an autosaved sketch with {draft.strokes.length} strokes from {timeString}.
            Would you like to resume where you left off?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onDiscard}
            className="w-full text-muted-foreground hover:text-destructive sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Discard
          </Button>
          <Button
            type="button"
            onClick={onRestore}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Restore Drawing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
