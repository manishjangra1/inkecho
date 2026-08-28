'use client';

import React from 'react';
import { CANVAS_CONFIG } from '@/shared/config/canvas.config';
import { Slider } from '@/shared/ui/slider';
import { cn } from '@/shared/lib/cn';

export interface BrushSizeSliderProps {
  readonly size: number;
  readonly onChange: (size: number) => void;
  readonly color?: string;
  readonly disabled?: boolean;
}

export function BrushSizeSlider({
  size,
  onChange,
  color = '#FFFFFF',
  disabled = false,
}: BrushSizeSliderProps) {
  return (
    <div className="flex w-full max-w-xs items-center gap-3">
      {/* Visual Brush Diameter Preview */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/40 bg-muted/40"
        title={`Brush size: ${size}px`}
      >
        <div
          className="rounded-full transition-all"
          style={{
            width: `${Math.max(2, size)}px`,
            height: `${Math.max(2, size)}px`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Preset Size Buttons */}
      <div className="flex items-center gap-1">
        {CANVAS_CONFIG.BRUSH.PRESET_SIZES.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() => onChange(preset)}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded font-mono text-xs transition-colors',
              size === preset
                ? 'bg-primary font-bold text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={`${preset}px`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="min-w-[80px] flex-1">
        <Slider
          value={[size]}
          min={CANVAS_CONFIG.BRUSH.MIN_SIZE}
          max={CANVAS_CONFIG.BRUSH.MAX_SIZE}
          step={1}
          disabled={disabled}
          onValueChange={([val]) => {
            if (val !== undefined) onChange(val);
          }}
          aria-label="Brush size"
        />
      </div>
    </div>
  );
}
