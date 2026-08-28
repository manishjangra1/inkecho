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
  readonly className?: string;
}

export function ColorPicker({
  selectedColor,
  onSelectColor,
  disabled = false,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn('flex items-center justify-between gap-1 w-full', className)}>
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
              'relative h-6 w-6 shrink-0 rounded-full border border-neutral-700 transition-transform focus:outline-none',
              isSelected
                ? 'scale-110 ring-2 ring-white border-transparent'
                : 'opacity-85 hover:scale-105 hover:opacity-100',
              disabled && 'cursor-not-allowed opacity-40'
            )}
            style={{ backgroundColor: item.hex }}
          >
            {isSelected && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check
                  className={cn(
                    'h-3 w-3',
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
            className="h-6 w-6 shrink-0 rounded-full border border-dashed border-neutral-600 bg-[#1A1A1A] p-0 text-neutral-400 hover:text-white hover:border-neutral-400"
            aria-label="Custom color picker"
            title="Custom color"
          >
            <Palette className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-48 space-y-2 border-border bg-[#161616] p-3 text-white shadow-xl"
          align="end"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Custom Hex
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onSelectColor(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border border-border bg-transparent"
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
              className="flex-1 rounded border border-neutral-700 bg-[#111111] px-2 py-1 font-mono text-xs uppercase text-white"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
