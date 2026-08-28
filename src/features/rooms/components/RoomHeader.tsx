'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, LogOut, Settings, Users } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
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

  const totalPlayers = room.participants.length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo & Room Code */}
          <div className="flex items-center gap-3">
            <Link href={ROUTES.HOME} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-lg sm:text-xl tracking-wider text-foreground">
                {room.code}
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex gap-1 text-xs">
                <Users className="h-3 w-3" />
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
                className="gap-1.5"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            )}

            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeave}
              disabled={isLeaving}
              className="text-muted-foreground hover:text-destructive gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Leave</span>
            </Button>
          </div>
        </div>
      </header>

      {isHost && (
        <RoomSettingsDrawer
          room={room}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      )}
    </>
  );
}
