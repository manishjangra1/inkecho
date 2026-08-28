'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { PromptCard } from './PromptCard';
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
        if (result.error.code === 'VERSION_CONFLICT' && result.error.snapshot) {
          replaceFromSnapshot(result.error.snapshot as never);
        }
        toast.error(result.error.message || 'Failed to submit drawing.');
        return;
      }

      engine.clearDraft();
      toast.success('Drawing submitted successfully!');
    } catch {
      toast.error('An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 duration-300 animate-in fade-in slide-in-from-bottom-3 sm:space-y-6">
      {/* Turn Header */}
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold tracking-tight">{GAME_COPY.DRAW_PHASE_TITLE}</h2>
        <p className="text-sm text-muted-foreground">{GAME_COPY.DRAW_PHASE_SUBTITLE}</p>
      </div>

      {/* Prompt Context Card */}
      {currentTurn.promptContext && (
        <PromptCard
          type={currentTurn.promptContext.type}
          text={currentTurn.promptContext.text}
          drawingUrl={currentTurn.promptContext.drawingUrl}
        />
      )}

      {/* Drawing Canvas Area */}
      <div className="space-y-3">
        <DrawingCanvas engine={engine} />

        {/* Toolbar */}
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

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="hidden text-xs text-muted-foreground sm:block">
          {engine.strokes.length} strokes • Autosaved locally
        </div>
        <div className="flex w-full justify-end sm:w-auto">
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
