'use client';

import * as React from 'react';
import Link from 'next/link';
import { LogOut, Settings, Users, Copy, Check, Trash2 } from 'lucide-react';
import { Logo } from '@/shared/ui/logo';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { RoomSettingsDrawer } from './RoomSettingsDrawer';
import { leaveRoomAction } from '../actions/leave-room.action';
import { deleteRoomAction } from '../actions/delete-room.action';
import { useRouter } from 'next/navigation';
import { toast } from '@/shared/ui/toast';
import { ROUTES } from '@/shared/constants/routes';
import { useRoom } from '../hooks/use-room';
import { useGameStore } from '@/features/game/stores/game-store';
import type { RoomSnapshotDto } from '../types/room.types';

interface RoomHeaderProps {
  readonly room: RoomSnapshotDto;
  readonly isHost: boolean;
}

export function RoomHeader({ room: initialRoom, isHost: initialIsHost }: RoomHeaderProps) {
  const router = useRouter();
  const { data: room = initialRoom } = useRoom(initialRoom.code, { initialData: initialRoom });
  const storePlayerId = useGameStore((s) => s.playerId);
  const isHost = storePlayerId ? room.hostPlayerId === storePlayerId : initialIsHost;

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
  const [isLeaving, setIsLeaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
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

  const handleDeleteRoom = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteRoomAction({ roomCode: room.code });
      if (!res.success) {
        toast.error(res.error.message || 'Failed to delete room.');
        setIsDeleting(false);
        return;
      }
      toast.success(`Room ${room.code} deleted successfully.`);
      router.push(ROUTES.HOME);
    } catch {
      toast.error('An unexpected error occurred while deleting room.');
      setIsDeleting(false);
    }
  };

  const handleCopyInvite = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/room/${room.code}` : '';
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Invite link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast.success(`Room code ${room.code} copied!`);
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
            <button
              type="button"
              onClick={handleCopyCode}
              className="group flex items-center gap-1.5 rounded-[4px] px-1.5 py-0.5 font-mono text-xs font-semibold text-neutral-300 hover:bg-[#1C1C1C] hover:text-white transition-colors cursor-pointer"
              title="Click to copy room code"
            >
              <span>Room:</span>
              <strong className="text-white font-mono">{room.code}</strong>
              <Copy className="h-2.5 w-2.5 text-neutral-500 group-hover:text-neutral-300 opacity-60 group-hover:opacity-100 transition-all" />
            </button>
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
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="h-7 gap-1.5 px-2.5 text-xs text-neutral-300 hover:text-white"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Settings</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteAlertOpen(true)}
                disabled={isDeleting}
                className="h-7 gap-1.5 px-2.5 text-xs text-neutral-400 hover:text-[#D9534F] hover:bg-neutral-900"
                title="Delete Room"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Room</span>
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            disabled={isLeaving}
            className="h-7 gap-1.5 px-2.5 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Leave Room</span>
          </Button>
        </div>
      </header>

      {isHost && (
        <RoomSettingsDrawer
          room={room}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          onDeleteRoom={() => {
            setSettingsOpen(false);
            setDeleteAlertOpen(true);
          }}
        />
      )}

      {/* Delete Room Confirmation Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent className="max-w-md bg-[#111111] border border-border p-5 rounded-[6px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-[#D9534F]" />
              Delete Room {room.code}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-neutral-400 leading-relaxed pt-1">
              Are you sure you want to delete this room? All connected players will be disconnected and the room will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-8 text-xs border-[#262626] bg-[#161616] text-neutral-300 hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              disabled={isDeleting}
              className="h-8 text-xs font-semibold bg-[#D9534F] hover:bg-[#c9302c] text-white border-none"
            >
              {isDeleting ? 'Deleting...' : 'Delete Room'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
