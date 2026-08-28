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
    <div className="flex h-full w-full flex-col justify-between space-y-3">
      {/* Top Prompt Banner */}
      <div className="flex items-center justify-between rounded-[4px] border border-border bg-[#111111] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Prompt:
          </span>
          <span className="font-semibold text-sm text-white">
            &ldquo;{promptText}&rdquo;
          </span>
        </div>
        <div className="text-[11px] text-neutral-400">
          Draw what you see above before time expires
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 flex flex-col justify-center overflow-hidden">
        <DrawingCanvas engine={engine} className="max-h-[58vh] w-auto mx-auto aspect-[4/3]" />
      </div>

      {/* Bottom Controls Row: Toolbar + Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
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

        <div className="shrink-0">
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
