'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import { Trash2 } from 'lucide-react';

export interface ClearCanvasDialogProps {
  readonly onClear: () => void;
  readonly disabled?: boolean;
}

export function ClearCanvasDialog({ onClear, disabled = false }: ClearCanvasDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label="Clear canvas"
          title="Clear all strokes"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-border bg-card/95 backdrop-blur">
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Canvas?</AlertDialogTitle>
          <AlertDialogDescription>
            This will wipe all drawings from your current turn. You can still undo this action
            immediately if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onClear}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Clear Drawing
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
