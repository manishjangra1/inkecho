'use client';

import * as React from 'react';
import { Kbd } from '@/shared/ui/kbd';
import { cn } from '@/shared/lib/cn';

export interface StatusBarProps {
  readonly latencyMs?: number;
  readonly isConnected?: boolean;
  readonly version?: string;
  readonly shortcuts?: Array<{ key: string; label: string }>;
}

export function StatusBar({
  latencyMs = 24,
  isConnected = true,
  version = 'v1.0.4',
  shortcuts = [
    { key: '⌘K', label: 'Command' },
    { key: '1-9', label: 'Palette' },
    { key: '⌘Z', label: 'Undo' },
  ],
}: StatusBarProps) {
  return (
    <footer className="flex h-8 w-full shrink-0 items-center justify-between border-t border-border bg-[#0E0E0E] px-3 text-[11px] text-neutral-400 select-none">
      {/* Left: Connection State & Ping */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isConnected ? 'bg-white' : 'bg-[#D9534F]'
            )}
          />
          <span className="text-neutral-300">
            {isConnected ? `Ably: ${latencyMs}ms` : 'Connecting...'}
          </span>
        </div>
        <div className="h-2.5 w-px bg-neutral-800" />
        <span className="font-mono text-[10px] text-neutral-500">{version}</span>
      </div>

      {/* Right: Keyboard Shortcut Badges */}
      <div className="hidden sm:flex items-center gap-3">
        {shortcuts.map((sc) => (
          <div key={sc.key} className="flex items-center gap-1">
            <Kbd>{sc.key}</Kbd>
            <span className="text-[10px] text-neutral-500">{sc.label}</span>
          </div>
        ))}
      </div>
    </footer>
  );
}
