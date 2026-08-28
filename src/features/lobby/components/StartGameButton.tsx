'use client';

import * as React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/tooltip';
import { toast } from '@/shared/ui/toast';
import { LOBBY_COPY } from '@/shared/constants/copy/lobby';

interface StartGameButtonProps {
  readonly canStart: boolean;
  readonly canStartReasons: ReadonlyArray<string>;
  readonly onStartGame: () => Promise<void>;
  readonly isLoading?: boolean;
}

export function StartGameButton({
  canStart,
  canStartReasons,
  onStartGame,
  isLoading = false,
}: StartGameButtonProps) {
  const handleClick = async () => {
    if (!canStart) {
      toast.error(canStartReasons[0] || 'Cannot start game yet.');
      return;
    }
    await onStartGame();
  };

  const button = (
    <Button
      type="button"
      size="lg"
      variant="default"
      onClick={handleClick}
      isLoading={isLoading}
      disabled={!canStart || isLoading}
      className="shadow-glow min-w-[160px] font-bold text-base bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent hover:opacity-90 transition-opacity gap-2"
    >
      <Play className="h-4 w-4 fill-white" />
      {LOBBY_COPY.START_GAME}
    </Button>
  );

  if (!canStart && canStartReasons.length > 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-block cursor-not-allowed">
            {button}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          <ul className="list-disc pl-4 space-y-1">
            {canStartReasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
