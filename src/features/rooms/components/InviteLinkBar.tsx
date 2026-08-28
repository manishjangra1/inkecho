'use client';

import * as React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { CopyLinkButton } from './CopyLinkButton';
import { LOBBY_COPY } from '@/shared/constants/copy/lobby';
import { env } from '@/shared/config/env';

interface InviteLinkBarProps {
  readonly roomCode: string;
}

export function InviteLinkBar({ roomCode }: InviteLinkBarProps) {
  const [inviteUrl, setInviteUrl] = React.useState('');

  React.useEffect(() => {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    setInviteUrl(`${origin}/join/${roomCode}`);
  }, [roomCode]);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join my InkEcho Game!',
          text: `Join my room on InkEcho with code ${roomCode}`,
          url: inviteUrl,
        });
      } catch {
        // User dismissed share dialog
      }
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex w-full flex-col items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/60 p-3.5 shadow-sm backdrop-blur-md sm:flex-row">
      <div className="flex w-full items-center gap-3 sm:w-auto">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Room Code:
        </span>
        <span className="rounded-lg border border-border bg-muted/60 px-3 py-1 font-mono text-xl font-black tracking-widest text-brand-primary">
          {roomCode}
        </span>
      </div>

      <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
        {hasNativeShare && (
          <Button type="button" variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
        <CopyLinkButton textToCopy={inviteUrl} label={LOBBY_COPY.COPY_LINK} />
      </div>
    </div>
  );
}
