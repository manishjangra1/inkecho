'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          variant={isVotedByMe ? 'default' : 'outline'}
          size="lg"
          disabled={hasVoted && !isVotedByMe}
          onClick={() => onVote(chainIndex)}
          className={cn(
            'group relative rounded-full px-6 py-3 font-semibold shadow-md transition-all duration-300',
            isVotedByMe
              ? 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600'
              : 'border-border/60 bg-card hover:border-rose-500/50 hover:text-rose-500'
          )}
        >
          <Heart
            className={cn(
              'mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110',
              isVotedByMe ? 'fill-white text-white' : 'text-rose-500'
            )}
          />
          <span>{isVotedByMe ? 'Voted!' : 'Vote for this Story'}</span>
          <span className="ml-2 inline-flex items-center justify-center rounded-full bg-black/10 px-2.5 py-0.5 text-xs font-bold dark:bg-white/20">
            {voteCount}
          </span>
        </Button>
      </motion.div>
    </div>
  );
}
