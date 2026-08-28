'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SubmitButton } from './SubmitButton';
import {
  DrawingCanvas,
  DraftRestoreDialog,
  useCanvasEngine,
  ColorPicker,
  ClearCanvasDialog,
} from '@/features/canvas';
import { submitDrawingAction } from '../actions/submit-drawing.action';
import { useGameStore } from '../stores/game-store';
import { GAME_COPY } from '@/shared/constants/copy/game';
import { CANVAS_CONFIG } from '@/shared/config/canvas.config';
import { Pencil, Paintbrush, Eraser, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/cn';
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

  const isBrush = engine.tool === CANVAS_CONFIG.TOOLS.BRUSH;
  const isEraser = engine.tool === CANVAS_CONFIG.TOOLS.ERASER;

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
          router.push(`/room/${encodeURIComponent(roomCode)}/reveal`);
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
        router.push(`/room/${encodeURIComponent(roomCode)}/reveal`);
      }
    } catch {
      toast.error('An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const promptText = currentTurn.promptContext?.text || 'Sketch your prompt';

  return (
    <div className="flex h-full w-full flex-col lg:flex-row gap-3 overflow-hidden select-none">
      {/* Left Column: Full Drawing Canvas with zero padding */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[4px] border border-border bg-[#262626] shadow-xl min-h-0">
        <DrawingCanvas engine={engine} className="h-full w-full" />
      </div>

      {/* Right Column: Prompt, Drawing Tools & Submit Panel */}
      <div className="flex w-full lg:w-[320px] xl:w-[340px] shrink-0 flex-col justify-between rounded-[4px] border border-border bg-[#111111] p-3 shadow-xl overflow-hidden">
        <div className="space-y-2.5">
          {/* Prompt Section Card */}
          <div className="space-y-1.5 border-b border-border pb-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                <Pencil className="h-3 w-3 text-white" />
                <span>Your Prompt</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSubmitting || engine.isExporting || !engine.canUndo}
                  onClick={engine.undo}
                  className="h-6 w-6 p-0 text-neutral-400 hover:text-white"
                  title="Undo (⌘Z)"
                >
                  <Undo2 className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSubmitting || engine.isExporting || !engine.canRedo}
                  onClick={engine.redo}
                  className="h-6 w-6 p-0 text-neutral-400 hover:text-white"
                  title="Redo (⌘⇧Z)"
                >
                  <Redo2 className="h-3 w-3" />
                </Button>
                <div className="h-3.5 w-px bg-[#232323] mx-0.5" />
                <ClearCanvasDialog
                  onClear={engine.clearStrokes}
                  disabled={isSubmitting || engine.isExporting}
                />
              </div>
            </div>

            {/* Prominent Prompt Text Display */}
            <div className="rounded-[4px] border border-neutral-800 bg-[#161616] px-2.5 py-1.5 text-center">
              <p className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide">
                &ldquo;{promptText}&rdquo;
              </p>
            </div>
          </div>

          {/* Tool Mode: Brush vs Eraser */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Tool Mode
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={isSubmitting || engine.isExporting}
                onClick={() => engine.setTool(CANVAS_CONFIG.TOOLS.BRUSH)}
                className={cn(
                  'flex h-7 items-center justify-center gap-1.5 rounded-[4px] border text-xs font-semibold transition-colors',
                  isBrush
                    ? 'border-white bg-white text-black font-bold'
                    : 'border-neutral-700 bg-[#161616] text-neutral-400 hover:border-neutral-500 hover:text-white'
                )}
              >
                <Paintbrush className="h-3 w-3" />
                <span>Brush</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting || engine.isExporting}
                onClick={() => engine.setTool(CANVAS_CONFIG.TOOLS.ERASER)}
                className={cn(
                  'flex h-7 items-center justify-center gap-1.5 rounded-[4px] border text-xs font-semibold transition-colors',
                  isEraser
                    ? 'border-white bg-white text-black font-bold'
                    : 'border-neutral-700 bg-[#161616] text-neutral-400 hover:border-neutral-500 hover:text-white'
                )}
              >
                <Eraser className="h-3 w-3" />
                <span>Eraser</span>
              </button>
            </div>
          </div>

          {/* Stroke Size Selection */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Stroke Size
              </span>
              <span className="font-mono text-[10px] font-semibold text-white">
                {engine.currentSize}px
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[2, 4, 8, 16, 24].map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={isSubmitting || engine.isExporting}
                  onClick={() => {
                    if (isEraser) {
                      engine.setEraserSize(s);
                    } else {
                      engine.setBrushSize(s);
                    }
                  }}
                  className={cn(
                    'flex h-6 flex-col items-center justify-center rounded-[3px] border font-mono text-[10px] transition-colors',
                    engine.currentSize === s
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-neutral-800 bg-[#161616] text-neutral-400 hover:bg-[#1F1F1F] hover:text-white'
                  )}
                >
                  <span>{s}px</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette (Single Row) */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Color Palette
            </span>
            <div className="rounded-[4px] border border-neutral-800 bg-[#161616] px-2 py-1.5">
              <ColorPicker
                selectedColor={engine.color}
                onSelectColor={engine.setColor}
                disabled={isSubmitting || engine.isExporting || isEraser}
              />
            </div>
          </div>
        </div>

        {/* Bottom Submit Section */}
        <div className="space-y-2 pt-1">
          <SubmitButton
            isSubmitting={isSubmitting || engine.isExporting}
            disabled={engine.strokes.length === 0}
            onClick={handleSubmit}
            label={GAME_COPY.DRAW_SUBMIT_BUTTON || 'Submit Drawing'}
            className="w-full h-8 py-0 text-xs font-semibold bg-white text-black hover:bg-neutral-200 border border-white shadow-none"
          />

          <div className="rounded-[4px] border border-neutral-800 bg-[#141414] px-2 py-1.5 text-[10px] text-neutral-500">
            <span className="font-semibold text-neutral-400">💡 Tip:</span> Draw bold shapes so others can guess accurately.
          </div>
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
