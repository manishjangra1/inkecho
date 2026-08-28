'use client';

import React from 'react';
import { PromptCard } from './PromptCard';

export interface PriorDrawingCardProps {
  readonly drawingUrl: string;
  readonly className?: string;
}

export function PriorDrawingCard({ drawingUrl, className }: PriorDrawingCardProps) {
  return (
    <PromptCard
      type="DRAWING"
      drawingUrl={drawingUrl}
      className={className}
    />
  );
}
