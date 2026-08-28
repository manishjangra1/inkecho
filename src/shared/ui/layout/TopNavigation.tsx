'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Check, Settings, LogOut, Users } from 'lucide-react';
import { Logo } from '@/shared/ui/logo';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { toast } from '@/shared/ui/toast';
import { ROUTES } from '@/shared/constants/routes';

export interface TopNavigationProps {
  readonly roomCode?: string;
  readonly isHost?: boolean;
  readonly onOpenSettings?: () => void;
  readonly onLeaveRoom?: () => void;
  readonly playerCount?: number;
  readonly maxPlayers?: number;
}

export function TopNavigation({
  roomCode,
  isHost,
  onOpenSettings,
  onLeaveRoom,
  playerCount,
  maxPlayers,
}: TopNavigationProps) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);

  const handleCopyInvite = () => {
    if (!roomCode) return;
    const url = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomCode}` : '';
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Invite link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    toast.success(`Room code ${roomCode} copied!`);
  };

  const handleLeave = () => {
    if (onLeaveRoom) {
      onLeaveRoom();
    } else {
      router.push(ROUTES.HOME);
    }
  };

  return (
    <header className="flex h-12 w-full shrink-0 items-center justify-between border-b border-border bg-[#0E0E0E] px-4 select-none">
      {/* Brand & Room Info */}
      <div className="flex items-center gap-3">
        <Logo href={ROUTES.HOME} size="md" />

        {roomCode && (
          <>
            <div className="h-3 w-px bg-neutral-800" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="group flex items-center gap-1.5 rounded-[4px] px-1.5 py-0.5 font-mono text-xs font-semibold text-neutral-200 hover:bg-[#1C1C1C] hover:text-white transition-colors cursor-pointer"
                title="Click to copy room code"
              >
                <span>Room:</span>
                <strong className="text-white font-mono">{roomCode}</strong>
                <Copy className="h-2.5 w-2.5 text-neutral-500 group-hover:text-neutral-300 opacity-60 group-hover:opacity-100 transition-all" />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyInvite}
                className="h-6 gap-1 px-2 text-[11px] text-neutral-300"
              >
                {copied ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy Invite'}</span>
              </Button>
              {playerCount !== undefined && maxPlayers !== undefined && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] text-neutral-400">
                  <Users className="h-2.5 w-2.5 mr-1" />
                  {playerCount}/{maxPlayers}
                </Badge>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isHost && onOpenSettings && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="h-7 gap-1.5 px-2.5 text-xs text-neutral-300 hover:text-white"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Settings</span>
          </Button>
        )}

        {roomCode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            className="h-7 gap-1.5 px-2.5 text-xs text-neutral-400 hover:text-[#D9534F] hover:bg-neutral-900"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Leave Room</span>
          </Button>
        )}
      </div>
    </header>
  );
}
