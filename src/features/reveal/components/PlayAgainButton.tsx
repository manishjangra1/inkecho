'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { toast } from 'sonner';
import { RotateCcw, Loader2 } from 'lucide-react';
import { rematchAction } from '../actions/rematch.action';
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
        router.push(`/room/${encodeURIComponent(roomCode)}/lobby`);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHost) {
    return (
      <div className={cn('py-2 text-center', className)}>
        <p className="animate-pulse text-xs font-medium text-muted-foreground">
          Waiting for host to start the next match...
        </p>
      </div>
    );
  }

  return (
    <Button
      variant="default"
      size="lg"
      onClick={handleRematch}
      disabled={isLoading}
      className={cn(
        'rounded-full px-8 py-6 text-base font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <RotateCcw className="mr-2 h-5 w-5" />
      )}
      <span>Play Again (Return to Lobby)</span>
    </Button>
  );
}
