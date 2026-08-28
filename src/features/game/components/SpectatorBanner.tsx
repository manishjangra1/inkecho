'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { GAME_COPY } from '@/shared/constants/copy/game';

export function SpectatorBanner() {
  return (
    <div className="w-full bg-primary/10 border-b border-primary/20 py-2 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
      <Eye className="w-4 h-4" />
      <span>{GAME_COPY.SPECTATING_BANNER}</span>
    </div>
  );
}
