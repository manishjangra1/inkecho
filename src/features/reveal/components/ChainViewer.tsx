'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RevealStep } from './RevealStep';
import { ArrowDown } from 'lucide-react';
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
    <div className={cn('flex w-full flex-col items-center gap-6 py-4', className)}>
      <AnimatePresence mode="popLayout">
        {visibleSteps.map((step, idx) => {
          const isLatest = idx === visibleSteps.length - 1;
          const showArrow = idx > 0;

          return (
            <React.Fragment key={step.id}>
              {showArrow && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 0.25, delay: 0.2, ease: 'easeOut' }}
                  style={{ originY: 0 }}
                  className="my-1 flex flex-col items-center justify-center text-muted-foreground/50"
                >
                  <div className="h-6 w-0.5 bg-border/80" />
                  <ArrowDown className="-mt-1 h-4 w-4 text-muted-foreground" />
                </motion.div>
              )}

              <RevealStep step={step} isLatest={isLatest} onReport={onReportStep} />
            </React.Fragment>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
