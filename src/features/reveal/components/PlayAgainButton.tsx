'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { toast } from 'sonner';
import { RotateCcw, Loader2 } from 'lucide-react';
import { rematchAction } from '../actions/rematch.action';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';

export interface PlayAgainButtonProps {
  roomCode: string;
  isHost: boolean;
  className?: string;
}

export function PlayAgainButton({ roomCode, isHost, className }: PlayAgainButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRematch = async () => {
    setIsLoading(true);
    try {
      const res = await rematchAction({ roomCode });
      if (!res.success) {
        toast.error(res.error.message || 'Failed to start rematch.');
      } else {
        toast.success('Returning to Lobby!');
        router.push(ROUTES.ROOM.LOBBY(roomCode));
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHost) {
    return (
      <div className={cn('text-xs text-neutral-400 font-mono', className)}>
        Waiting for host...
      </div>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleRematch}
      disabled={isLoading}
      className={cn(
        'h-7 gap-1.5 rounded-[4px] px-3 text-xs font-semibold bg-white text-black hover:bg-neutral-200 border border-white',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <RotateCcw className="h-3 w-3" />
      )}
      <span>Play Again</span>
    </Button>
  );
}
