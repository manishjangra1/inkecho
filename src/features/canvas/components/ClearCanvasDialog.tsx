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
          className="h-6 w-6 rounded-[4px] p-0 text-neutral-400 hover:bg-[#1A1A1A] hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-border bg-[#111111] max-w-sm rounded-[4px] p-4">
        <AlertDialogHeader className="space-y-1.5 text-left">
          <AlertDialogTitle className="text-sm font-bold text-white">Clear Canvas?</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-neutral-400">
            This will wipe all drawings from your current turn. You can still undo this action
            immediately if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 pt-2 sm:space-x-0">
          <AlertDialogCancel className="h-8 text-xs font-semibold rounded-[4px] border-neutral-700 bg-transparent text-neutral-300 hover:bg-[#1A1A1A] hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onClear}
            className="h-8 text-xs font-semibold rounded-[4px] bg-[#D9534F] text-white hover:bg-[#c44744] border border-[#D9534F]"
          >
            Clear Drawing
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
