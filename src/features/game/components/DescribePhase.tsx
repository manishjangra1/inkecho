'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PromptCard } from './PromptCard';
import { SubmitButton } from './SubmitButton';
import { submitDescriptionAction } from '../actions/submit-description.action';
import { useGameStore } from '../stores/game-store';
import { GAME_CONFIG } from '@/shared/config/game.config';
import { GAME_COPY } from '@/shared/constants/copy/game';
import type { TurnSnapshotDto } from '../types/game.types';

export interface DescribePhaseProps {
  readonly roomCode: string;
  readonly roomId: string;
  readonly currentTurn: TurnSnapshotDto;
}

export function DescribePhase({ roomCode, roomId, currentTurn }: DescribePhaseProps) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const version = useGameStore((state) => state.game?.version ?? 1);
  const replaceFromSnapshot = useGameStore((state) => state.replaceFromSnapshot);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error('Please enter a description before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitDescriptionAction({
        roomCode,
        roomId,
        text: trimmed,
        expectedVersion: version,
      });

      if (!result.success) {
        if (
          result.error.message?.includes('REVEAL') ||
          result.error.code === 'INVALID_GAME_TRANSITION'
        ) {
          toast.info('Game has finished! Moving to reveal…');
          router.push(`/room/${roomCode}/reveal`);
          return;
        }
        if (result.error.code === 'VERSION_CONFLICT' && result.error.snapshot) {
          replaceFromSnapshot(result.error.snapshot as never);
        }
        toast.error(result.error.message || 'Failed to submit description.');
        return;
      }

      toast.success('Description submitted!');
      setText('');
      if (result.data?.gameStatus === 'REVEAL' || result.data?.gameStatus === 'COMPLETED') {
        router.push(`/room/${roomCode}/reveal`);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charsLeft = GAME_CONFIG.MAX_DESCRIPTION_LENGTH - text.length;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 duration-300 animate-in fade-in slide-in-from-bottom-3">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-bold tracking-tight">{GAME_COPY.DESCRIBE_PHASE_TITLE}</h2>
        <p className="text-sm text-muted-foreground">{GAME_COPY.DESCRIBE_PHASE_SUBTITLE}</p>
      </div>

      {currentTurn.promptContext && (
        <PromptCard
          type={currentTurn.promptContext.type}
          text={currentTurn.promptContext.text}
          drawingUrl={currentTurn.promptContext.drawingUrl}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative rounded-2xl border bg-card/60 p-4 shadow-sm backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-primary/40">
          <label htmlFor="describe-input" className="sr-only">
            {GAME_COPY.DESCRIBE_INPUT_LABEL}
          </label>
          <textarea
            id="describe-input"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, GAME_CONFIG.MAX_DESCRIPTION_LENGTH))}
            placeholder={GAME_COPY.DESCRIBE_INPUT_PLACEHOLDER}
            disabled={isSubmitting}
            rows={4}
            className="w-full resize-none border-0 bg-transparent text-base leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none sm:text-lg"
            autoFocus
          />
          <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted-foreground">
            <span>Make it fun and imaginative!</span>
            <span className={charsLeft < 20 ? 'font-bold text-amber-500' : ''}>
              {charsLeft} chars left
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <SubmitButton
            isSubmitting={isSubmitting}
            disabled={!text.trim()}
            label={GAME_COPY.DESCRIBE_SUBMIT_BUTTON}
          />
        </div>
      </form>
    </div>
  );
}
