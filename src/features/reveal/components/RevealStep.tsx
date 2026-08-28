'use client';

import React from 'react';
import { cn } from '@/shared/lib/cn';
import { AlertCircle } from 'lucide-react';
import type { RevealStepItem } from '../types/reveal.types';

export interface RevealStepProps {
  step: RevealStepItem;
  isLatest: boolean;
  onReport?: (step: RevealStepItem) => void;
  stepNumber?: number;
  className?: string;
}

export function RevealStep({ step, isLatest, onReport, stepNumber, className }: RevealStepProps) {
  const isPrompt = step.type === 'STARTER_PROMPT';
  const isDraw = step.type === 'DRAWING';

  return (
    <div className={cn('shrink-0 transition-all duration-200 select-none', isDraw ? 'w-[280px] sm:w-[300px]' : 'w-[240px] sm:w-[260px]', className)}>
      <div
        className={cn(
          'flex h-[340px] flex-col justify-between overflow-hidden rounded-[4px] border bg-[#111111] shadow-2xl transition-all',
          isLatest ? 'border-white ring-1 ring-white/30' : 'border-border'
        )}
      >
        {/* Step Header */}
        <div className="flex h-9 items-center justify-between border-b border-border bg-[#0E0E0E] px-3">
          <div className="flex items-center gap-2">
            {stepNumber && (
              <span className="font-mono text-[10px] font-bold text-neutral-400">
                #{stepNumber}
              </span>
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">
              {isPrompt ? 'Original Prompt' : isDraw ? 'Drawing' : 'Guess'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <span className="truncate max-w-[100px] font-medium text-neutral-300">
              {step.authorDisplayName}
            </span>
            {onReport && !isPrompt && (
              <button
                onClick={() => onReport(step)}
                title="Report"
                className="text-neutral-600 hover:text-[#D9534F] transition-colors p-0.5"
              >
                <AlertCircle className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex flex-1 items-center justify-center p-0 overflow-hidden">
          {isDraw ? (
            <div className="flex h-full w-full items-center justify-center bg-[#262626] p-0 overflow-hidden">
              {step.drawingUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={step.drawingUrl}
                  alt={`Drawing by ${step.authorDisplayName}`}
                  className="h-full w-full object-contain bg-[#262626]"
                  loading="lazy"
                />
              ) : (
                <div className="text-center text-xs text-neutral-500 font-mono">
                  Drawing skipped
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-5 text-center bg-[#141414]">
              <span className="text-2xl text-neutral-600 font-serif leading-none select-none mb-1">“</span>
              <p className="font-mono text-xs sm:text-sm font-bold text-white leading-snug max-w-[200px]">
                {step.textContent || 'No description'}
              </p>
              <span className="text-2xl text-neutral-600 font-serif leading-none select-none mt-1">”</span>
            </div>
          )}
        </div>

        {/* Step Footer */}
        <div className="flex h-8 items-center justify-between border-t border-border bg-[#0E0E0E] px-3">
          <span className="text-[10px] text-neutral-500 font-medium">
            {isPrompt ? 'Starting idea' : isDraw ? 'Canvas Sketch' : 'Description'}
          </span>
          <span className="font-mono text-[10px] text-neutral-400">
            by {step.authorDisplayName}
          </span>
        </div>
      </div>
    </div>
  );
}
