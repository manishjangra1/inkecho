'use client';

import React, { useEffect, useRef } from 'react';
import { RevealStep } from './RevealStep';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { RevealChainItem, RevealStepItem } from '../types/reveal.types';

export interface ChainViewerProps {
  chain: RevealChainItem;
  currentStepIndex: number;
  onReportStep?: (step: RevealStepItem) => void;
  className?: string;
}

export function ChainViewer({
  chain,
  currentStepIndex,
  onReportStep,
  className,
}: ChainViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeStepRef = useRef<HTMLDivElement | null>(null);

  const visibleSteps = chain.steps.slice(0, currentStepIndex + 1);

  // Auto-scroll to latest revealed step when step index changes
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentStepIndex]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex w-full overflow-x-auto py-2 px-4 select-none scroll-smooth',
        className
      )}
    >
      <div className="flex min-w-max items-center gap-2.5 mx-auto px-2">
        {visibleSteps.map((step, idx) => {
          const isLatest = idx === visibleSteps.length - 1;
          const showArrow = idx > 0;

          return (
            <React.Fragment key={step.id}>
              {showArrow && (
                <div className="flex flex-col items-center justify-center shrink-0 px-0.5 text-neutral-500">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
              <div ref={isLatest ? activeStepRef : undefined}>
                <RevealStep
                  step={step}
                  isLatest={isLatest}
                  onReport={onReportStep}
                  stepNumber={idx + 1}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
