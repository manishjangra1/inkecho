'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/cn';
import { Palette, MessageSquareText, Sparkles, User, AlertCircle } from 'lucide-react';
import type { RevealStepItem } from '../types/reveal.types';

export interface RevealStepProps {
  step: RevealStepItem;
  isLatest: boolean;
  onReport?: (step: RevealStepItem) => void;
  className?: string;
}

export function RevealStep({ step, isLatest, onReport, className }: RevealStepProps) {
  const isPrompt = step.type === 'STARTER_PROMPT';
  const isDraw = step.type === 'DRAWING';
  const isDescribe = step.type === 'DESCRIPTION';

  const animationVariants = isDraw
    ? {
        initial: { opacity: 0, scale: 0.92 },
        animate: { opacity: 1, scale: 1 },
      }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <motion.div
      variants={animationVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
      className={cn('mx-auto w-full max-w-xl', className)}
    >
      <Card
        className={cn(
          'relative overflow-hidden border backdrop-blur-sm transition-all duration-300',
          isPrompt && 'border-primary/40 bg-gradient-to-b from-primary/5 via-card to-card',
          isDraw && 'border-indigo-500/30 bg-card shadow-lg shadow-indigo-500/5',
          isDescribe && 'border-cyan-500/30 bg-card',
          isLatest && 'shadow-xl ring-2 ring-primary/40'
        )}
      >
        {/* Step Header */}
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-2.5">
          <div className="flex items-center gap-2">
            {isPrompt && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-primary/30 bg-primary/10 text-xs text-primary"
              >
                <Sparkles className="h-3 w-3" /> Starter Prompt
              </Badge>
            )}
            {isDraw && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-400"
              >
                <Palette className="h-3 w-3" /> Drawing #{step.stepIndex}
              </Badge>
            )}
            {isDescribe && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-cyan-500/30 bg-cyan-500/10 text-xs text-cyan-400"
              >
                <MessageSquareText className="h-3 w-3" /> Description #{step.stepIndex}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5">
              <User className="h-3 w-3" />
              <span>{step.authorDisplayName}</span>
            </div>
            {onReport && !isPrompt && (
              <button
                onClick={() => onReport(step)}
                title="Report inappropriate content"
                className="rounded p-1 text-muted-foreground/60 transition-colors hover:text-destructive"
              >
                <AlertCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Step Content */}
        <CardContent className="p-6">
          {isDraw ? (
            <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/10 shadow-inner">
              {step.drawingUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={step.drawingUrl}
                  alt={`Drawing by ${step.authorDisplayName}`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <Palette className="mb-2 h-10 w-10 opacity-30" />
                  <p className="text-sm font-medium">Drawing unavailable or skipped</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center px-2 py-4 text-center">
              <blockquote
                className={cn(
                  'font-sans text-lg font-bold leading-relaxed tracking-tight text-foreground/90 sm:text-xl',
                  isPrompt && 'italic text-primary dark:text-primary-foreground'
                )}
              >
                &ldquo;{step.textContent || 'No description provided'}&rdquo;
              </blockquote>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
