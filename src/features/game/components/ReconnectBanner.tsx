'use client';

import React from 'react';
import { WifiOff, Loader2 } from 'lucide-react';
import { GAME_COPY } from '@/shared/constants/copy/game';

export function ReconnectBanner() {
  return (
    <div className="flex w-full items-center justify-center gap-2 border-b border-amber-500/30 bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-400">
      <WifiOff className="h-4 w-4" />
      <span>{GAME_COPY.RECONNECTING_BANNER}</span>
      <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin" />
    </div>
  );
}
