'use client';

import React from 'react';
import { PromptCard } from './PromptCard';

export interface StarterPromptCardProps {
  readonly text: string;
  readonly className?: string;
}

export function StarterPromptCard({ text, className }: StarterPromptCardProps) {
  return <PromptCard type="STARTER_PROMPT" text={text} className={className} />;
}
