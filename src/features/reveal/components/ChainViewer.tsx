'use client';

import React from 'react';
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
  const visibleSteps = chain.steps.slice(0, currentStepIndex + 1);

  return (
    <div className={cn('flex w-full items-center gap-3 overflow-x-auto py-2 select-none', className)}>
      {visibleSteps.map((step, idx) => {
        const isLatest = idx === visibleSteps.length - 1;
        const showArrow = idx > 0;

        return (
          <React.Fragment key={step.id}>
            {showArrow && (
              <div className="shrink-0 text-neutral-600">
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
            <RevealStep step={step} isLatest={isLatest} onReport={onReportStep} />
          </React.Fragment>
        );
      })}
    </div>
  );
}
