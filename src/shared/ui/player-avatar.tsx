'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { getAvatarUrl, getDeterministicAvatarSvg, getInitials } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/cn';

export interface PlayerAvatarProps {
  readonly src?: string | null;
  readonly name?: string;
  readonly seed?: string;
  readonly className?: string;
  readonly sizeClassName?: string;
  readonly isHost?: boolean;
}

export function PlayerAvatar({
  src,
  name = 'Player',
  seed,
  className,
  sizeClassName = 'h-8 w-8',
}: PlayerAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const effectiveSeed = seed || name;
  const initials = getInitials(name);

  // Primary URL from DB/props or DiceBear SVG API (upgrading legacy bottts URLs to vibrant people avatars)
  const isLegacyAvatar = Boolean(src && (src.includes('bottts') || src.includes('bottts-neutral')));
  const primaryUrl = (!src || isLegacyAvatar) ? getAvatarUrl(effectiveSeed) : src;
  // Instant deterministic offline SVG fallback
  const offlineSvg = getDeterministicAvatarSvg(effectiveSeed);

  return (
    <Avatar
      className={cn(
        'relative shrink-0 overflow-hidden rounded-[4px] border border-neutral-700 bg-[#1A1A1A] select-none',
        sizeClassName,
        className
      )}
    >
      <AvatarImage
        src={hasError ? offlineSvg : primaryUrl}
        alt={name}
        onError={() => setHasError(true)}
        className="h-full w-full object-cover rounded-[4px]"
      />
      <AvatarFallback className="rounded-[4px] bg-[#222222] font-mono text-[11px] font-bold text-white flex items-center justify-center">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
