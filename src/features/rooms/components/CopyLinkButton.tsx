'use client';

import * as React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { toast } from '@/shared/ui/toast';
import { LOBBY_COPY } from '@/shared/constants/copy/lobby';

interface CopyLinkButtonProps {
  readonly textToCopy: string;
  readonly label?: string;
  readonly className?: string;
}

export function CopyLinkButton({
  textToCopy,
  label = LOBBY_COPY.COPY_LINK,
  className,
}: CopyLinkButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setHasCopied(true);
      toast.success(LOBBY_COPY.LINK_COPIED);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error('Could not copy link to clipboard.');
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={className}
    >
      {hasCopied ? (
        <Check className="h-4 w-4 text-game-ready" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span>{hasCopied ? 'Copied!' : label}</span>
    </Button>
  );
}
