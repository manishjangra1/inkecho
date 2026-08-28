'use client';

import React from 'react';
import { WifiOff, Loader2 } from 'lucide-react';
import { GAME_COPY } from '@/shared/constants/copy/game';

export function ReconnectBanner() {
  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/30 py-2 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-amber-400">
      <WifiOff className="w-4 h-4" />
      <span>{GAME_COPY.RECONNECTING_BANNER}</span>
      <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" />
    </div>
  );
}
