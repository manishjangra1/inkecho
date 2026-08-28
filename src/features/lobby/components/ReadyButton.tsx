'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { toggleReadyAction } from '../actions/toggle-ready.action';
import { toast } from '@/shared/ui/toast';
import { LOBBY_COPY } from '@/shared/constants/copy/lobby';

interface ReadyButtonProps {
  readonly roomCode: string;
  readonly isReady: boolean;
  readonly onToggled?: (newReady: boolean) => void;
}

export function ReadyButton({ roomCode, isReady, onToggled }: ReadyButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleToggle = async () => {
    try {
      setIsLoading(true);
      const nextState = !isReady;
      const res = await toggleReadyAction({
        roomCode,
        isReady: nextState,
      });

      if (!res.success) {
        toast.error(res.error.message);
        setIsLoading(false);
        return;
      }

      onToggled?.(nextState);
      setIsLoading(false);
    } catch {
      toast.error('Failed to change ready state.');
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="lg"
      variant={isReady ? 'secondary' : 'default'}
      onClick={handleToggle}
      isLoading={isLoading}
      disabled={isLoading}
      className={`min-w-[140px] font-semibold gap-2 ${
        isReady
          ? 'bg-game-ready/20 text-game-ready border border-game-ready/40 hover:bg-game-ready/30'
          : 'shadow-glow'
      }`}
    >
      {isReady ? (
        <>
          <Check className="h-4 w-4" />
          {LOBBY_COPY.READY_BUTTON.READY}
        </>
      ) : (
        <>
          <X className="h-4 w-4" />
          {LOBBY_COPY.READY_BUTTON.NOT_READY}
        </>
      )}
    </Button>
  );
}
