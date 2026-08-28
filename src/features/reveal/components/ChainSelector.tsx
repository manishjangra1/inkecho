'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/cn';
import { Sparkles, Trophy } from 'lucide-react';
import type { RevealChainItem } from '../types/reveal.types';

export interface ChainSelectorProps {
  chains: readonly RevealChainItem[];
  selectedChainIndex: number;
  onSelectChain: (index: number) => void;
  votes: Record<string, number>;
  winningChainIndex: number | null;
  className?: string;
}

export function ChainSelector({
  chains,
  selectedChainIndex,
  onSelectChain,
  votes,
  winningChainIndex,
  className,
}: ChainSelectorProps) {
  if (chains.length <= 1) return null;

  return (
    <div
      className={cn(
        'scrollbar-none flex items-center gap-2 overflow-x-auto pb-2 sm:justify-center',
        className
      )}
    >
      {chains.map((chain, index) => {
        const isSelected = selectedChainIndex === index;
        const voteCount = votes[String(index)] || 0;
        const isWinner = winningChainIndex === index && voteCount > 0;

        return (
          <Button
            key={chain.chainIndex}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectChain(index)}
            className={cn(
              'relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/40'
                : 'border-border/50 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground',
              isWinner && !isSelected && 'border-amber-500/50 text-amber-500 dark:text-amber-400'
            )}
          >
            {isWinner ? (
              <Trophy className="h-3.5 w-3.5 animate-pulse text-amber-400" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 opacity-70" />
            )}
            <span>Story {index + 1}</span>
            {voteCount > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  'ml-1 rounded-full px-1.5 py-0 text-[10px] font-bold',
                  isSelected
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {voteCount}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
