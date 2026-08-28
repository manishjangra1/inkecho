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
      size="default"
      variant="default"
      onClick={handleClick}
      isLoading={isLoading}
      disabled={!canStart || isLoading}
      className="min-w-[120px] gap-1.5 font-semibold text-xs h-8 bg-white text-black hover:bg-neutral-200 border border-white"
    >
      <Play className="h-3 w-3 fill-black" />
      <span>{LOBBY_COPY.START_GAME}</span>
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
        <TooltipContent side="top" className="max-w-xs text-xs bg-[#1A1A1A] border border-[#333] text-neutral-300">
          <ul className="list-disc space-y-1 pl-4">
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
