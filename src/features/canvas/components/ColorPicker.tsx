'use client';

import React from 'react';
import { CANVAS_CONFIG } from '@/shared/config/canvas.config';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Palette, Check } from 'lucide-react';

export interface ColorPickerProps {
  readonly selectedColor: string;
  readonly onSelectColor: (color: string) => void;
  readonly disabled?: boolean;
}

export function ColorPicker({ selectedColor, onSelectColor, disabled = false }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {CANVAS_CONFIG.BRUSH.PALETTE.map((item) => {
        const isSelected = selectedColor.toLowerCase() === item.hex.toLowerCase();
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectColor(item.hex)}
            aria-label={`Select ${item.name} color`}
            title={item.name}
            className={cn(
              'relative h-7 w-7 rounded-full border border-border/40 transition-transform focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background sm:h-8 sm:w-8',
              isSelected
                ? 'scale-110 ring-2 ring-primary'
                : 'opacity-90 hover:scale-105 hover:opacity-100',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            style={{ backgroundColor: item.hex }}
          >
            {isSelected && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check
                  className={cn(
                    'h-4 w-4',
                    item.hex.toLowerCase() === '#ffffff' || item.hex.toLowerCase() === '#eab308'
                      ? 'text-black'
                      : 'text-white'
                  )}
                  strokeWidth={3}
                />
              </span>
            )}
          </button>
        );
      })}

      {/* Custom Color Picker Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            className="h-7 w-7 rounded-full border-dashed sm:h-8 sm:w-8"
            aria-label="Custom color picker"
            title="Custom color"
          >
            <Palette className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-48 space-y-2 border-border bg-card/95 p-3 backdrop-blur"
          align="center"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Custom Hex
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onSelectColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
              aria-label="Color input"
            />
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  onSelectColor(val);
                }
              }}
              placeholder="#FFFFFF"
              maxLength={7}
              className="flex-1 rounded border border-input bg-background px-2 py-1 font-mono text-xs uppercase"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
