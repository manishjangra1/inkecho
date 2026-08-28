'use client';

import * as React from 'react';
import Link from 'next/link';
import { LogOut, Settings, Users, Copy, Check } from 'lucide-react';
import { Logo } from '@/shared/ui/logo';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { RoomSettingsDrawer } from './RoomSettingsDrawer';
import { leaveRoomAction } from '../actions/leave-room.action';
import { useRouter } from 'next/navigation';
import { toast } from '@/shared/ui/toast';
import { ROUTES } from '@/shared/constants/routes';
import type { RoomSnapshotDto } from '../types/room.types';

interface RoomHeaderProps {
  readonly room: RoomSnapshotDto;
  readonly isHost: boolean;
}

export function RoomHeader({ room, isHost }: RoomHeaderProps) {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [isLeaving, setIsLeaving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleLeave = async () => {
    try {
      setIsLeaving(true);
      await leaveRoomAction({ roomCode: room.code });
      toast.success('Left the room.');
      router.push(ROUTES.HOME);
    } catch {
      router.push(ROUTES.HOME);
    }
  };

  const handleCopyInvite = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/room/${room.code}` : '';
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Invite link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const totalPlayers = room.participants.length;

  return (
    <>
      <header className="sticky top-0 z-40 flex h-12 w-full shrink-0 items-center justify-between border-b border-border bg-[#0E0E0E] px-4 select-none">
        {/* Left: Brand & Room Code */}
        <div className="flex items-center gap-3">
          <Logo href={ROUTES.HOME} size="md" />
          <div className="h-3 w-px bg-neutral-800" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-neutral-300">
              Room: <strong className="text-white font-mono">{room.code}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyInvite}
              className="h-6 gap-1 px-2 text-[11px] text-neutral-300 hover:text-white"
            >
              {copied ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy Invite'}</span>
            </Button>
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] text-neutral-400">
              <Users className="h-2.5 w-2.5 mr-1" />
              {totalPlayers}/{room.settings.maxPlayers}
            </Badge>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {isHost && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="h-7 gap-1.5 px-2.5 text-xs text-neutral-300 hover:text-white"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            disabled={isLeaving}
            className="h-7 gap-1.5 px-2.5 text-xs text-neutral-400 hover:text-[#D9534F] hover:bg-neutral-900"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Leave Room</span>
          </Button>
        </div>
      </header>

      {isHost && (
        <RoomSettingsDrawer room={room} open={settingsOpen} onOpenChange={setSettingsOpen} />
      )}
    </>
  );
}
