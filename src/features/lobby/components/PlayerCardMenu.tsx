'use client';

import * as React from 'react';
import { MoreVertical, Crown, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui/dropdown-menu';
import { Button } from '@/shared/ui/button';
import { kickPlayerAction } from '../actions/kick-player.action';
import { transferHostAction } from '../actions/transfer-host.action';
import { toast } from '@/shared/ui/toast';
import { LOBBY_COPY } from '@/shared/constants/copy/lobby';
import type { ParticipantDto } from '@/infrastructure/db/mappers/participant.mapper';

interface PlayerCardMenuProps {
  readonly roomCode: string;
  readonly participant: ParticipantDto;
  readonly onPlayerUpdated?: () => void;
}

export function PlayerCardMenu({ roomCode, participant, onPlayerUpdated }: PlayerCardMenuProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleKick = async () => {
    try {
      setIsLoading(true);
      const res = await kickPlayerAction({
        roomCode,
        playerId: participant.playerId,
      });

      if (!res.success) {
        toast.error(res.error.message);
        setIsLoading(false);
        return;
      }

      toast.success(`${participant.displayName} was removed from the room.`);
      onPlayerUpdated?.();
    } catch {
      toast.error('Failed to kick player.');
      setIsLoading(false);
    }
  };

  const handleTransferHost = async () => {
    try {
      setIsLoading(true);
      const res = await transferHostAction({
        roomCode,
        newHostPlayerId: participant.playerId,
      });

      if (!res.success) {
        toast.error(res.error.message);
        setIsLoading(false);
        return;
      }

      toast.success(`Host transferred to ${participant.displayName}.`);
      onPlayerUpdated?.();
    } catch {
      toast.error('Failed to transfer host.');
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          disabled={isLoading}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={handleTransferHost} className="cursor-pointer gap-2">
          <Crown className="h-4 w-4 text-amber-400" />
          <span>{LOBBY_COPY.TRANSFER_HOST}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleKick}
          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
        >
          <UserX className="h-4 w-4" />
          <span>{LOBBY_COPY.KICK_PLAYER}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
