'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { toggleReadyAction } from '../actions/toggle-ready.action';
import { toast } from '@/shared/ui/toast';
import { LOBBY_COPY } from '@/shared/constants/copy/lobby';
import { cn } from '@/shared/lib/cn';

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
      size="default"
      variant={isReady ? 'outline' : 'default'}
      onClick={handleToggle}
      isLoading={isLoading}
      disabled={isLoading}
      className={cn(
        'min-w-[120px] gap-1.5 font-semibold text-xs h-8 rounded-[4px] transition-colors',
        isReady
          ? 'border border-neutral-700 bg-[#161616] text-neutral-300 hover:border-neutral-500 hover:text-white'
          : 'border border-white bg-white text-black hover:bg-neutral-200'
      )}
    >
      {isReady ? (
        <>
          <X className="h-3.5 w-3.5 text-neutral-400" />
          <span>{LOBBY_COPY.READY_BUTTON.NOT_READY}</span>
        </>
      ) : (
        <>
          <Check className="h-3.5 w-3.5" />
          <span>{LOBBY_COPY.READY_BUTTON.READY}</span>
        </>
      )}
    </Button>
  );
}
