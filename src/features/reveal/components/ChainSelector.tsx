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
        'flex items-center gap-1.5 overflow-x-auto pb-1 select-none',
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
              'h-7 gap-1.5 rounded-[4px] px-2.5 text-xs font-medium border transition-colors',
              isSelected
                ? 'bg-white text-black border-white'
                : 'border-[#232323] bg-[#111111] text-neutral-400 hover:text-white hover:border-neutral-600'
            )}
          >
            {isWinner ? (
              <Trophy className="h-3 w-3 text-white" />
            ) : (
              <Sparkles className="h-3 w-3 text-neutral-400" />
            )}
            <span>Story {index + 1}</span>
            {voteCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-4 rounded-[2px] px-1 text-[9px] font-mono font-bold"
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
