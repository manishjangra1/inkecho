'use client';

import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Trophy } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { RevealChainItem } from '../types/reveal.types';

export interface WinnerBannerProps {
  winningChain: RevealChainItem | null;
  voteCount: number;
  className?: string;
}

export function WinnerBanner({ winningChain, voteCount, className }: WinnerBannerProps) {
  if (!winningChain || voteCount <= 0) return null;

  return (
    <div className={cn('mx-auto w-full', className)}>
      <Card className="rounded-[4px] border border-border bg-[#111111] p-2.5">
        <CardContent className="flex items-center justify-between p-0">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-4 w-4 text-white" />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Most Voted Story:
              </span>
              <span className="ml-1.5 font-semibold text-xs text-white">
                Story #{winningChain.chainIndex + 1}: &ldquo;{winningChain.starterPrompt}&rdquo;
              </span>
            </div>
          </div>

          <div className="font-mono text-xs font-bold text-white bg-[#1A1A1A] border border-neutral-700 px-2 py-0.5 rounded-[3px]">
            {voteCount} {voteCount === 1 ? 'Vote' : 'Votes'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
