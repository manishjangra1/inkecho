'use client';

import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/shared/lib/cn';
import { AlertCircle } from 'lucide-react';
import type { RevealStepItem } from '../types/reveal.types';

export interface RevealStepProps {
  step: RevealStepItem;
  isLatest: boolean;
  onReport?: (step: RevealStepItem) => void;
  className?: string;
}

export function RevealStep({ step, isLatest, onReport, className }: RevealStepProps) {
  const isPrompt = step.type === 'STARTER_PROMPT';
  const isDraw = step.type === 'DRAWING';

  return (
    <div className={cn('w-[260px] shrink-0', className)}>
      <Card
        className={cn(
          'flex h-[320px] flex-col justify-between overflow-hidden rounded-[4px] border bg-[#111111] transition-colors',
          isLatest ? 'border-white' : 'border-border'
        )}
      >
        {/* Step Header */}
        <div className="flex items-center justify-between border-b border-border bg-[#0E0E0E] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              {isPrompt ? 'Prompt' : isDraw ? 'Drawing' : 'Guess'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <span className="truncate max-w-[80px] font-medium text-neutral-300">
              {step.authorDisplayName}
            </span>
            {onReport && !isPrompt && (
              <button
                onClick={() => onReport(step)}
                title="Report"
                className="text-neutral-600 hover:text-[#D9534F] transition-colors"
              >
                <AlertCircle className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Step Content */}
        <CardContent className="flex flex-1 items-center justify-center p-3 overflow-hidden">
          {isDraw ? (
            <div className="relative flex aspect-[4/3] h-full w-full items-center justify-center overflow-hidden rounded-[3px] border border-[#232323] bg-[#161616]">
              {step.drawingUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={step.drawingUrl}
                  alt={`Drawing by ${step.authorDisplayName}`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="text-center text-xs text-neutral-500 font-mono">
                  Drawing skipped
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-2 text-center">
              <blockquote className="font-sans text-sm font-semibold leading-relaxed text-white">
                &ldquo;{step.textContent || 'No description'}&rdquo;
              </blockquote>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
