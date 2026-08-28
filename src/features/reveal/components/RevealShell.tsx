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
import { Loader2, Sparkles } from 'lucide-react';
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
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading story reveal...</p>
      </div>
    );
  }

  const winningChain = winningChainIndex !== null ? (chains[winningChainIndex] ?? null) : null;
  const winningVoteCount = winningChainIndex !== null ? votes[String(winningChainIndex)] || 0 : 0;

  const currentChainVotes = votes[String(selectedChainIndex)] || 0;
  const isCurrentChainVotedByMe = votedChainIndex === selectedChainIndex;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 px-4 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Story Reveal</h1>
              <p className="font-mono text-xs text-muted-foreground">Room: {roomCode}</p>
            </div>
          </div>

          <PlayAgainButton roomCode={roomCode} isHost={isHost} className="hidden sm:inline-flex" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 py-6 sm:py-10">
        {/* Chain Selector Tabs */}
        <ChainSelector
          chains={chains}
          selectedChainIndex={selectedChainIndex}
          onSelectChain={goToChain}
          votes={votes}
          winningChainIndex={winningChainIndex}
          className="mb-6 w-full"
        />

        {/* Winner Banner if voting completed/active */}
        {winningChain && <WinnerBanner winningChain={winningChain} voteCount={winningVoteCount} />}

        {/* Active Chain Viewer */}
        {currentChain && (
          <div className="my-2 flex w-full flex-col items-center">
            <ChainViewer
              chain={currentChain}
              currentStepIndex={currentStepIndex}
              onReportStep={(step) => setReportingStep(step)}
            />

            {/* Voting Component */}
            <div className="my-8 w-full">
              <VoteButtons
                chainIndex={selectedChainIndex}
                voteCount={currentChainVotes}
                hasVoted={hasVoted}
                isVotedByMe={isCurrentChainVotedByMe}
                onVote={castVote}
              />
            </div>
          </div>
        )}

        {/* Rematch button on mobile */}
        <div className="my-6 flex w-full justify-center sm:hidden">
          <PlayAgainButton roomCode={roomCode} isHost={isHost} />
        </div>
      </main>

      {/* Playback Controls (Sticky bottom) */}
      {currentChain && (
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
