'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
    <div className="flex h-full w-full flex-col justify-between space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between rounded-[4px] border border-border bg-[#111111] px-4 py-2">
        <span className="text-xs font-semibold text-white uppercase tracking-wider">
          Guess Phase
        </span>
        <span className="text-[11px] text-neutral-400">
          Describe the drawing below as accurately as possible
        </span>
      </div>

      {/* Center: Prior Drawing Preview */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
        {currentTurn.promptContext && (
          <div className="max-h-[50vh] w-auto max-w-lg aspect-[4/3] rounded-[4px] border border-border bg-[#111111] overflow-hidden flex items-center justify-center">
            {currentTurn.promptContext.drawingUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTurn.promptContext.drawingUrl}
                alt="Previous Drawing"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="p-6 text-center text-sm text-neutral-300 font-mono">
                &ldquo;{currentTurn.promptContext.text}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom: Description Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-[4px] border border-border bg-[#111111] p-3 transition-colors focus-within:border-white">
          <label htmlFor="describe-input" className="sr-only">
            {GAME_COPY.DESCRIBE_INPUT_LABEL}
          </label>
          <input
            id="describe-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, GAME_CONFIG.MAX_DESCRIPTION_LENGTH))}
            placeholder={GAME_COPY.DESCRIBE_INPUT_PLACEHOLDER}
            disabled={isSubmitting}
            className="w-full border-0 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-neutral-500">
            {charsLeft} characters remaining
          </span>
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
