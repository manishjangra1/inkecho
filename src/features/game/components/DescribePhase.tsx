'use client';

import React, { useState } from 'react';
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

export function DescribePhase({
  roomCode,
  roomId,
  currentTurn,
}: DescribePhaseProps) {
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
        if (result.error.code === 'VERSION_CONFLICT' && result.error.snapshot) {
          replaceFromSnapshot(result.error.snapshot as never);
        }
        toast.error(result.error.message || 'Failed to submit description.');
        return;
      }

      toast.success('Description submitted!');
      setText('');
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charsLeft = GAME_CONFIG.MAX_DESCRIPTION_LENGTH - text.length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight">
          {GAME_COPY.DESCRIBE_PHASE_TITLE}
        </h2>
        <p className="text-sm text-muted-foreground">
          {GAME_COPY.DESCRIBE_PHASE_SUBTITLE}
        </p>
      </div>

      {currentTurn.promptContext && (
        <PromptCard
          type={currentTurn.promptContext.type}
          text={currentTurn.promptContext.text}
          drawingUrl={currentTurn.promptContext.drawingUrl}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative rounded-2xl border bg-card/60 backdrop-blur-md p-4 shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-all">
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
            className="w-full bg-transparent border-0 resize-none text-base sm:text-lg focus:outline-none placeholder:text-muted-foreground/60 leading-relaxed"
            autoFocus
          />
          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
            <span>Make it fun and imaginative!</span>
            <span className={charsLeft < 20 ? 'text-amber-500 font-bold' : ''}>
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
