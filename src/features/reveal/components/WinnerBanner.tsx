'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/shared/ui/card';
import { Crown, Sparkles } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
      className={cn('mx-auto my-6 w-full max-w-2xl', className)}
    >
      <Card className="relative overflow-hidden border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 shadow-2xl shadow-amber-500/10 backdrop-blur-md">
        {/* Decorative corner glows */}
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-yellow-400/20 blur-2xl" />

        <CardContent className="relative z-10 flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/20 text-amber-400 shadow-inner">
              <Crown className="h-8 w-8 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                  Most Voted Story
                </span>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                Story #{winningChain.chainIndex + 1}: &ldquo;{winningChain.starterPrompt}&rdquo;
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-2.5">
            <span className="text-2xl font-black text-amber-400">{voteCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {voteCount === 1 ? 'Vote' : 'Votes'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
