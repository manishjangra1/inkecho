'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SubmitButton } from './SubmitButton';
import {
  DrawingCanvas,
  CanvasToolbar,
  DraftRestoreDialog,
  useCanvasEngine,
} from '@/features/canvas';
import { submitDrawingAction } from '../actions/submit-drawing.action';
import { useGameStore } from '../stores/game-store';
import { GAME_COPY } from '@/shared/constants/copy/game';
import { Pencil } from 'lucide-react';
import type { TurnSnapshotDto } from '../types/game.types';

export interface DrawPhaseProps {
  readonly roomCode: string;
  readonly roomId: string;
  readonly currentTurn: TurnSnapshotDto;
}

export function DrawPhase({ roomCode, roomId, currentTurn }: DrawPhaseProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const version = useGameStore((state) => state.game?.version ?? 1);
  const replaceFromSnapshot = useGameStore((state) => state.replaceFromSnapshot);

  const engine = useCanvasEngine({
    gameId: roomId,
    chainIndex: currentTurn.chainIndex,
    turnIndex: currentTurn.turnIndex,
  });

  const handleSubmit = async () => {
    if (engine.strokes.length === 0) {
      toast.error('Canvas is empty. Sketch something before submitting!');
      return;
    }

    setIsSubmitting(true);
    try {
      const exportResult = await engine.exportDrawing();
      if (!exportResult) {
        if (engine.exportError) {
          toast.error(engine.exportError);
        } else {
          toast.error('Failed to export drawing. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      const result = await submitDrawingAction({
        roomCode,
        roomId,
        expectedVersion: version,
        imageDataUrl: exportResult.dataUrl,
      });

      if (!result.success) {
        if (
          result.error.message?.includes('REVEAL') ||
          result.error.code === 'INVALID_GAME_TRANSITION'
        ) {
          toast.info('Game has finished! Moving to reveal…');
          router.push(`/room/${roomCode}/reveal`);
          return;
        }
        if (result.error.code === 'VERSION_CONFLICT' && result.error.snapshot) {
          replaceFromSnapshot(result.error.snapshot as never);
        }
        toast.error(result.error.message || 'Failed to submit drawing.');
        return;
      }

      engine.clearDraft();
      toast.success('Drawing submitted successfully!');
      if (result.data?.gameStatus === 'REVEAL' || result.data?.gameStatus === 'COMPLETED') {
        router.push(`/room/${roomCode}/reveal`);
      }
    } catch {
      toast.error('An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const promptText = currentTurn.promptContext?.text || 'Sketch your prompt';

  return (
    <div className="flex h-full w-full flex-col justify-between space-y-2.5 select-none">
      {/* Top Prompt Banner */}
      <div className="flex items-center justify-between rounded-[4px] border border-border bg-[#111111] px-3.5 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <Pencil className="h-3.5 w-3.5 text-white shrink-0" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 shrink-0">
            Prompt:
          </span>
          <span className="font-semibold text-xs sm:text-sm text-white truncate font-mono">
            &ldquo;{promptText}&rdquo;
          </span>
        </div>
        <div className="text-[11px] text-neutral-400 shrink-0 hidden sm:block">
          Draw what was described before time runs out
        </div>
      </div>

      {/* Canvas Workspace */}
      <div className="flex flex-1 items-center justify-center overflow-hidden py-1">
        <div className="flex aspect-[4/3] h-full max-h-[58vh] w-auto items-center justify-center overflow-hidden rounded-[4px] border border-neutral-700 bg-[#141414] shadow-2xl">
          <DrawingCanvas engine={engine} className="h-full w-full" />
        </div>
      </div>

      {/* Bottom Controls Row: Toolbar + Submit Action */}
      <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
        <div className="flex-1 w-full">
          <CanvasToolbar
            tool={engine.tool}
            onSelectTool={engine.setTool}
            color={engine.color}
            onSelectColor={engine.setColor}
            size={engine.currentSize}
            onChangeSize={(size) => {
              if (engine.tool === 'eraser') {
                engine.setEraserSize(size);
              } else {
                engine.setBrushSize(size);
              }
            }}
            canUndo={engine.canUndo}
            canRedo={engine.canRedo}
            onUndo={engine.undo}
            onRedo={engine.redo}
            onClear={engine.clearStrokes}
            disabled={isSubmitting || engine.isExporting}
          />
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <SubmitButton
            isSubmitting={isSubmitting || engine.isExporting}
            disabled={engine.strokes.length === 0}
            onClick={handleSubmit}
            label={GAME_COPY.DRAW_SUBMIT_BUTTON || 'Submit Drawing'}
          />
        </div>
      </div>

      {/* Draft Recovery Dialog */}
      <DraftRestoreDialog
        draft={engine.foundDraft}
        onRestore={engine.restoreDraftStrokes}
        onDiscard={engine.dismissFoundDraft}
      />
    </div>
  );
}
