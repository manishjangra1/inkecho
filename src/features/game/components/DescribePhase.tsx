'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { submitDescriptionAction } from '../actions/submit-description.action';
import { useGameStore } from '../stores/game-store';
import { GAME_CONFIG } from '@/shared/config/game.config';
import { MessageSquare, Sparkles, Send, Loader2 } from 'lucide-react';
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
  const isDrawingImage = Boolean(currentTurn.promptContext?.drawingUrl);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() && !isSubmitting) {
        void handleSubmit(e);
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col lg:flex-row gap-3 overflow-hidden select-none">
      {/* Left Column: Drawing covers the entire section with zero padding */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[4px] border border-border bg-[#262626] shadow-xl">
        <div className="flex h-full w-full items-center justify-center bg-[#262626]">
          {currentTurn.promptContext ? (
            currentTurn.promptContext.drawingUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTurn.promptContext.drawingUrl}
                alt="Previous Drawing"
                className="h-full w-full object-contain bg-[#262626]"
              />
            ) : (
              <div className="w-full max-w-lg space-y-3 rounded-[4px] border border-border bg-[#141414] p-8 text-center shadow-2xl">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                  <span>Starting Prompt</span>
                </div>
                <p className="font-mono text-xl sm:text-2xl font-bold text-white tracking-wide">
                  &ldquo;{currentTurn.promptContext.text}&rdquo;
                </p>
                <p className="text-xs text-neutral-500">
                  Describe what this prompt means in your own creative words
                </p>
              </div>
            )
          ) : (
            <div className="text-xs text-neutral-500 font-mono">No drawing preview available</div>
          )}
        </div>
      </div>

      {/* Right Column: Describing Section Form */}
      <div className="flex w-full lg:w-[360px] xl:w-[400px] shrink-0 flex-col justify-between rounded-[4px] border border-border bg-[#111111] p-4 shadow-xl">
        <div className="space-y-4">
          {/* Section Header */}
          <div className="space-y-1 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-white" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                {isDrawingImage ? 'Guess the Drawing' : 'Initial Description'}
              </h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {isDrawingImage
                ? 'Examine the artwork on the left and write what you think is happening.'
                : 'Write your sentence explaining the prompt on the left.'}
            </p>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="describe-textarea" className="text-xs font-medium text-neutral-300">
                Your Description
              </label>
              <textarea
                id="describe-textarea"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, GAME_CONFIG.MAX_DESCRIPTION_LENGTH))}
                onKeyDown={handleKeyDown}
                placeholder="e.g., An astronaut riding a rainbow dolphin through space..."
                disabled={isSubmitting}
                className="w-full resize-none rounded-[4px] border border-neutral-700 bg-[#161616] p-3 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              <span>{charsLeft} characters remaining</span>
              <span>
                Press <kbd className="font-mono bg-neutral-800 px-1 py-0.5 rounded text-[10px] text-neutral-300">Enter ⏎</kbd>
              </span>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={!text.trim() || isSubmitting}
                className="w-full h-9 text-xs font-semibold bg-white text-black hover:bg-neutral-200 border border-white gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Description</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Tip at bottom of panel */}
        <div className="rounded-[4px] border border-neutral-800 bg-[#141414] p-2.5 text-[11px] text-neutral-500">
          <span className="font-semibold text-neutral-400">💡 Tip:</span> Be specific and humorous! The next player will have to draw your exact words.
        </div>
      </div>
    </div>
  );
}
