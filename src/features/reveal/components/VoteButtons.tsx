'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface VoteButtonsProps {
  chainIndex: number;
  voteCount: number;
  hasVoted: boolean;
  isVotedByMe: boolean;
  onVote: (chainIndex: number) => void;
  className?: string;
}

export function VoteButtons({
  chainIndex,
  voteCount,
  hasVoted,
  isVotedByMe,
  onVote,
  className,
}: VoteButtonsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant={isVotedByMe ? 'default' : 'outline'}
        size="sm"
        disabled={hasVoted && !isVotedByMe}
        onClick={() => onVote(chainIndex)}
        className={cn(
          'h-7 gap-1.5 rounded-[4px] px-3 text-xs font-medium border transition-colors',
          isVotedByMe
            ? 'bg-white text-black border-white'
            : 'border-[#232323] bg-[#111111] text-neutral-300 hover:text-white hover:border-neutral-600'
        )}
      >
        <Heart className={cn('h-3.5 w-3.5', isVotedByMe ? 'fill-black text-black' : 'text-neutral-400')} />
        <span>{isVotedByMe ? 'Voted' : 'Vote for this Story'}</span>
        {voteCount > 0 && (
          <span className="font-mono text-[10px] font-bold text-neutral-400">({voteCount})</span>
        )}
      </Button>
    </div>
  );
}
