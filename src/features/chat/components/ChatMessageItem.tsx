'use client';

import * as React from 'react';
import { Crown, Eye, Sparkles } from 'lucide-react';
import { PlayerAvatar } from '@/shared/ui/player-avatar';
import { cn } from '@/shared/lib/cn';
import type { ChatMessageDto } from '../types/chat.types';

export interface ChatMessageItemProps {
  readonly message: ChatMessageDto;
  readonly isCurrentUser: boolean;
}

export function ChatMessageItem({ message, isCurrentUser }: ChatMessageItemProps) {
  const formattedTime = React.useMemo(() => {
    try {
      const d = new Date(message.timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '';
    }
  }, [message.timestamp]);

  // System Notification Styling
  if (message.isSystem || message.role === 'SYSTEM') {
    return (
      <div className="flex items-center gap-1.5 rounded-[4px] border border-neutral-800/80 bg-[#121212]/60 px-2 py-1 text-[11px] text-neutral-400">
        <Sparkles className="h-3 w-3 shrink-0 text-amber-400/90" />
        <span className="flex-1 italic leading-tight text-neutral-300">{message.text}</span>
        {formattedTime && <span className="font-mono text-[9px] text-neutral-600">{formattedTime}</span>}
      </div>
    );
  }

  // Check if message is purely 1-3 emojis
  const isEmojiOnly = React.useMemo(() => {
    const trimmed = message.text.trim();
    // Simple check: short length and no alphanumeric characters
    return trimmed.length <= 8 && !/[a-zA-Z0-9]/.test(trimmed);
  }, [message.text]);

  return (
    <div
      className={cn(
        'group flex items-start gap-2 rounded-[4px] px-2 py-1.5 transition-colors',
        isCurrentUser ? 'bg-[#141414]/40 hover:bg-[#181818]' : 'hover:bg-[#141414]/60'
      )}
    >
      {/* 24px Compact Avatar */}
      <PlayerAvatar
        name={message.senderName}
        seed={message.senderId || message.senderName}
        sizeClassName="h-6 w-6"
        className="h-6 w-6 shrink-0 rounded-full border border-neutral-800 mt-0.5"
      />

      {/* Message Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header line: Sender Name + Badges + Time */}
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-xs font-semibold text-white truncate max-w-[130px]">
            {message.senderName}
          </span>

          {message.role === 'HOST' && (
            <span className="inline-flex items-center gap-0.5 rounded-[2px] border border-amber-500/40 bg-amber-500/10 px-1 py-0.5 text-[8px] font-bold text-amber-300 uppercase tracking-wider">
              <Crown className="h-2 w-2" />
              <span>Host</span>
            </span>
          )}

          {message.role === 'SPECTATOR' && (
            <span className="inline-flex items-center gap-0.5 rounded-[2px] border border-purple-500/40 bg-purple-500/10 px-1 py-0.5 text-[8px] font-medium text-purple-300">
              <Eye className="h-2 w-2" />
              <span>Spectator</span>
            </span>
          )}

          {isCurrentUser && (
            <span className="rounded-[2px] bg-neutral-800 px-1 py-0.2 text-[8px] font-mono text-neutral-400">
              You
            </span>
          )}

          {formattedTime && (
            <span className="ml-auto font-mono text-[9px] text-neutral-600 group-hover:text-neutral-400 transition-colors shrink-0">
              {formattedTime}
            </span>
          )}
        </div>

        {/* Message Text */}
        <div
          className={cn(
            'mt-0.5 break-words text-neutral-200 leading-snug select-text',
            isEmojiOnly ? 'text-xl py-0.5' : 'text-xs'
          )}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
}
