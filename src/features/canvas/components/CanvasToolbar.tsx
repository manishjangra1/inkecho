'use client';

import React from 'react';
import { CANVAS_CONFIG, type CanvasTool } from '@/shared/config/canvas.config';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Paintbrush, Eraser } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { BrushSizeSlider } from './BrushSizeSlider';
import { UndoRedoButtons } from './UndoRedoButtons';
import { ClearCanvasDialog } from './ClearCanvasDialog';

export interface CanvasToolbarProps {
  readonly tool: CanvasTool;
  readonly onSelectTool: (tool: CanvasTool) => void;
  readonly color: string;
  readonly onSelectColor: (color: string) => void;
  readonly size: number;
  readonly onChangeSize: (size: number) => void;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onClear: () => void;
  readonly disabled?: boolean;
}

export function CanvasToolbar({
  tool,
  onSelectTool,
  color,
  onSelectColor,
  size,
  onChangeSize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  disabled = false,
}: CanvasToolbarProps) {
  const isBrush = tool === CANVAS_CONFIG.TOOLS.BRUSH;
  const isEraser = tool === CANVAS_CONFIG.TOOLS.ERASER;

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-2.5 shadow-lg backdrop-blur-md sm:p-3">
      {/* Top Row: Primary Tools, Undo/Redo, Clear */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Tool Mode Buttons (Brush & Eraser) */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border/40 bg-muted/60 p-1">
          <Button
            type="button"
            variant={isBrush ? 'default' : 'ghost'}
            size="sm"
            disabled={disabled}
            onClick={() => onSelectTool(CANVAS_CONFIG.TOOLS.BRUSH)}
            className={cn(
              'h-9 min-h-[40px] min-w-[44px] gap-1.5 rounded-lg px-3 text-xs font-semibold',
              isBrush && 'shadow-sm'
            )}
            aria-label="Brush tool"
            aria-pressed={isBrush}
          >
            <Paintbrush className="h-4 w-4" />
            <span className="hidden sm:inline">Brush</span>
          </Button>

          <Button
            type="button"
            variant={isEraser ? 'default' : 'ghost'}
            size="sm"
            disabled={disabled}
            onClick={() => onSelectTool(CANVAS_CONFIG.TOOLS.ERASER)}
            className={cn(
              'h-9 min-h-[40px] min-w-[44px] gap-1.5 rounded-lg px-3 text-xs font-semibold',
              isEraser && 'shadow-sm'
            )}
            aria-label="Eraser tool"
            aria-pressed={isEraser}
          >
            <Eraser className="h-4 w-4" />
            <span className="hidden sm:inline">Eraser</span>
          </Button>
        </div>

        {/* Undo, Redo, Clear */}
        <div className="flex items-center gap-1">
          <UndoRedoButtons
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={onUndo}
            onRedo={onRedo}
            disabled={disabled}
          />
          <div className="mx-1 h-5 w-px bg-border/60" />
          <ClearCanvasDialog onClear={onClear} disabled={disabled} />
        </div>
      </div>

      {/* Bottom Row: Colors & Brush Size */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-2 md:flex-row">
        {/* Color Palette (only active/visible when Brush is selected) */}
        <div className={cn('flex items-center', !isBrush && 'pointer-events-none opacity-40')}>
          <ColorPicker
            selectedColor={color}
            onSelectColor={onSelectColor}
            disabled={disabled || !isBrush}
          />
        </div>

        {/* Size Slider */}
        <div className="flex w-full justify-end md:w-auto">
          <BrushSizeSlider
            size={size}
            onChange={onChangeSize}
            color={isBrush ? color : '#FFFFFF'}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
