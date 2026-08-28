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

export function PromptCard({
  type,
  text,
  drawingUrl,
  className,
}: PromptCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-md p-6 shadow-md transition-all',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        {type === 'DRAWING' ? (
          <>
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prior Drawing to Describe
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {type === 'STARTER_PROMPT' ? 'Starter Secret Prompt' : 'Prior Prompt'}
            </span>
          </>
        )}
      </div>

      {type === 'DRAWING' && drawingUrl ? (
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border bg-black/40 flex items-center justify-center">
          <Image
            src={drawingUrl}
            alt="Drawing to describe"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      ) : (
        <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground/90 leading-relaxed font-mono">
          &ldquo;{text || 'Write anything you want!'}&rdquo;
        </p>
      )}
    </div>
  );
}
