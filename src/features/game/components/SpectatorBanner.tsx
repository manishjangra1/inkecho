'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { GAME_COPY } from '@/shared/constants/copy/game';

export function SpectatorBanner() {
  return (
    <div className="flex w-full items-center justify-center gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
      <Eye className="h-4 w-4" />
      <span>{GAME_COPY.SPECTATING_BANNER}</span>
    </div>
  );
}
