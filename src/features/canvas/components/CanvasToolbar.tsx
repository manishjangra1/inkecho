'use client';

import React from 'react';
import { CANVAS_CONFIG, type CanvasTool } from '@/shared/config/canvas.config';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Undo2, Redo2, Paintbrush, Eraser } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
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
    <div className="flex w-full items-center justify-between gap-2 rounded-[4px] border border-border bg-[#111111] p-2 select-none">
      {/* Left: Undo, Redo, Tools, Size */}
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || !canUndo}
          onClick={onUndo}
          className="h-7 w-7 p-0 text-neutral-400 hover:text-white"
          title="Undo (⌘Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || !canRedo}
          onClick={onRedo}
          className="h-7 w-7 p-0 text-neutral-400 hover:text-white"
          title="Redo (⌘⇧Z)"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-[#232323] mx-1" />

        {/* Tool Selectors */}
        <Button
          type="button"
          variant={isBrush ? 'secondary' : 'ghost'}
          size="sm"
          disabled={disabled}
          onClick={() => onSelectTool(CANVAS_CONFIG.TOOLS.BRUSH)}
          className={cn(
            'h-7 gap-1 px-2 text-xs',
            isBrush ? 'bg-[#222222] text-white border border-neutral-600' : 'text-neutral-400 hover:text-white'
          )}
        >
          <Paintbrush className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Brush</span>
        </Button>

        <Button
          type="button"
          variant={isEraser ? 'secondary' : 'ghost'}
          size="sm"
          disabled={disabled}
          onClick={() => onSelectTool(CANVAS_CONFIG.TOOLS.ERASER)}
          className={cn(
            'h-7 gap-1 px-2 text-xs',
            isEraser ? 'bg-[#222222] text-white border border-neutral-600' : 'text-neutral-400 hover:text-white'
          )}
        >
          <Eraser className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Eraser</span>
        </Button>

        <div className="h-4 w-px bg-[#232323] mx-1" />

        {/* Brush Size Preset */}
        <div className="flex items-center gap-1">
          {[2, 4, 8].map((s) => (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => onChangeSize(s)}
              className={cn(
                'h-6 px-1.5 rounded-[3px] font-mono text-[10px] transition-colors border',
                size === s
                  ? 'border-white bg-white text-black font-bold'
                  : 'border-transparent text-neutral-400 hover:bg-[#1A1A1A] hover:text-white'
              )}
            >
              {s}px
            </button>
          ))}
        </div>
      </div>

      {/* Center: Color Palette (Only Colorful Component) */}
      <div className="flex items-center gap-1.5">
        <ColorPicker
          selectedColor={color}
          onSelectColor={onSelectColor}
          disabled={disabled || !isBrush}
        />
      </div>

      {/* Right: Clear Dialog */}
      <div className="flex items-center">
        <ClearCanvasDialog onClear={onClear} disabled={disabled} />
      </div>
    </div>
  );
}
