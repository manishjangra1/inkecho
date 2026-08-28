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
        'relative overflow-hidden rounded-2xl border bg-card/60 p-6 shadow-md backdrop-blur-md transition-all',
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        {type === 'DRAWING' ? (
          <>
            <ImageIcon className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prior Drawing to Describe
            </span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {type === 'STARTER_PROMPT' ? 'Starter Secret Prompt' : 'Prior Prompt'}
            </span>
          </>
        )}
      </div>

      {type === 'DRAWING' && drawingUrl ? (
        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border bg-black/40">
          <Image
            src={drawingUrl}
            alt="Drawing to describe"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      ) : (
        <p className="font-mono text-xl font-bold leading-relaxed tracking-tight text-foreground/90 sm:text-2xl">
          &ldquo;{text || 'Write anything you want!'}&rdquo;
        </p>
      )}
    </div>
  );
}
