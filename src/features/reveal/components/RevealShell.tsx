'use client';

import React, { useState } from 'react';
import { useRevealPlayback } from '../hooks/use-reveal-playback';
import { ChainSelector } from './ChainSelector';
import { ChainViewer } from './ChainViewer';
import { RevealControls } from './RevealControls';
import { VoteButtons } from './VoteButtons';
import { WinnerBanner } from './WinnerBanner';
import { PlayAgainButton } from './PlayAgainButton';
import { ReportButton } from './ReportButton';
import { Loader2 } from 'lucide-react';
import type { RevealStepItem } from '../types/reveal.types';

export interface RevealShellProps {
  roomCode: string;
}

export function RevealShell({ roomCode }: RevealShellProps) {
  const {
    revealData,
    chains,
    currentChain,
    selectedChainIndex,
    currentStepIndex,
    totalSteps,
    isPlaying,
    isAllCompleted,
    isHost,
    votes,
    hasVoted,
    votedChainIndex,
    winningChainIndex,
    isLoading,
    nextStep,
    prevStep,
    goToChain,
    togglePlayPause,
    castVote,
  } = useRevealPlayback({ roomCode });

  const [reportingStep, setReportingStep] = useState<RevealStepItem | null>(null);

  if (isLoading || !revealData) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-3 p-4">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
        <p className="text-xs font-mono text-neutral-400">Loading story reveal...</p>
      </div>
    );
  }

  const winningChain = winningChainIndex !== null ? (chains[winningChainIndex] ?? null) : null;
  const winningVoteCount = winningChainIndex !== null ? votes[String(winningChainIndex)] || 0 : 0;

  const currentChainVotes = votes[String(selectedChainIndex)] || 0;
  const isCurrentChainVotedByMe = votedChainIndex === selectedChainIndex;

  return (
    <div className="flex h-full flex-col justify-between space-y-4 select-none">
      {/* Top Header Row: Story Switcher Tabs & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-white">
            Story Reveal
          </span>
          <ChainSelector
            chains={chains}
            selectedChainIndex={selectedChainIndex}
            onSelectChain={goToChain}
            votes={votes}
            winningChainIndex={winningChainIndex}
          />
        </div>

        <div className="flex items-center gap-2">
          {currentChain && (
            <VoteButtons
              chainIndex={selectedChainIndex}
              voteCount={currentChainVotes}
              hasVoted={hasVoted}
              isVotedByMe={isCurrentChainVotedByMe}
              onVote={castVote}
            />
          )}
          <PlayAgainButton roomCode={roomCode} isHost={isHost} />
        </div>
      </div>

      {/* Center: Horizontal Side-by-Side Story Chain */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        {winningChain && (
          <div className="mb-2">
            <WinnerBanner winningChain={winningChain} voteCount={winningVoteCount} />
          </div>
        )}

        {currentChain && (
          <ChainViewer
            chain={currentChain}
            currentStepIndex={currentStepIndex}
            onReportStep={(step) => setReportingStep(step)}
          />
        )}
      </div>

      {/* Bottom Playback Bar */}
      {currentChain && (
        <div className="border-t border-border bg-[#0E0E0E] p-2 rounded-[4px]">
          <RevealControls
            isPlaying={isPlaying}
            onTogglePlay={togglePlayPause}
            onNext={nextStep}
            onPrev={prevStep}
            canPrev={selectedChainIndex > 0 || currentStepIndex > 0}
            canNext={!isAllCompleted}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
          />
        </div>
      )}

      {/* Moderation Report Dialog */}
      <ReportButton
        gameId={revealData.gameId}
        step={reportingStep}
        isOpen={Boolean(reportingStep)}
        onClose={() => setReportingStep(null)}
      />
    </div>
  );
}
