'use client';

import React from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/shared/lib/cn';

export interface PromptCardProps {
  readonly type: 'STARTER_PROMPT' | 'DESCRIPTION' | 'DRAWING';
  readonly text?: string | null;
  readonly drawingUrl?: string | null;
  readonly className?: string;
}

export function PromptCard({ type, text, drawingUrl, className }: PromptCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[4px] border border-border bg-[#111111] p-4 shadow-xl select-none',
        className
      )}
    >
      <div className="mb-2 flex items-center gap-1.5">
        {type === 'DRAWING' ? (
          <>
            <ImageIcon className="h-3.5 w-3.5 text-white" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Prior Drawing
            </span>
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {type === 'STARTER_PROMPT' ? 'Starter Secret Prompt' : 'Prior Prompt'}
            </span>
          </>
        )}
      </div>

      {type === 'DRAWING' && drawingUrl ? (
        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[4px] border border-neutral-800 bg-[#262626]">
          <Image
            src={drawingUrl}
            alt="Drawing to describe"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      ) : (
        <p className="font-mono text-sm sm:text-base font-bold leading-relaxed text-white">
          &ldquo;{text || 'Write anything you want!'}&rdquo;
        </p>
      )}
    </div>
  );
}
