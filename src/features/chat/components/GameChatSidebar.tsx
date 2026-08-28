'use client';

import * as React from 'react';
import {
  MessageSquare,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInput } from './ChatInput';
import { useChatStore } from '../stores/chat-store';
import { playChatNotificationSound } from '../lib/sound';
import { cn } from '@/shared/lib/cn';

export interface GameChatSidebarProps {
  readonly roomCode: string;
  readonly currentUserId?: string;
  readonly className?: string;
  readonly collapsible?: boolean;
}

export function GameChatSidebar({
  roomCode,
  currentUserId,
  className,
  collapsible = true,
}: GameChatSidebarProps) {
  const {
    messages,
    unreadCount,
    isCollapsed,
    isSoundEnabled,
    setCollapsed,
    toggleSound,
    markAsRead,
  } = useChatStore();

  const scrollViewportRef = React.useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const [newMessagesWhileScrolled, setNewMessagesWhileScrolled] = React.useState(0);
  const prevMessagesLength = React.useRef(messages.length);

  const handleToggleSound = () => {
    const willBeEnabled = !isSoundEnabled;
    toggleSound();
    if (willBeEnabled) {
      playChatNotificationSound();
    }
  };

  // Sound & Smart Auto-Scroll when new messages arrive
  React.useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      const latestMessage = messages[messages.length - 1];
      const isFromOther = Boolean(
        latestMessage &&
        (!currentUserId || latestMessage.senderId !== currentUserId) &&
        !latestMessage.isSystem
      );

      if (isFromOther && isSoundEnabled) {
        playChatNotificationSound();
      }

      if (isAtBottom) {
        // Automatically scroll to bottom smoothly
        setTimeout(() => {
          if (scrollViewportRef.current) {
            scrollViewportRef.current.scrollTo({
              top: scrollViewportRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }
        }, 50);
      } else {
        setNewMessagesWhileScrolled((prev) => prev + 1);
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isAtBottom, isSoundEnabled, currentUserId]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    const atBottom = distanceFromBottom < 30;
    setIsAtBottom(atBottom);

    if (atBottom) {
      setNewMessagesWhileScrolled(0);
      markAsRead();
    }
  };

  const scrollToBottom = () => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setNewMessagesWhileScrolled(0);
      setIsAtBottom(true);
      markAsRead();
    }
  };

  // Collapsed View (Slim Strip)
  if (isCollapsed && collapsible) {
    return (
      <aside
        className={cn(
          'flex h-full w-12 flex-col items-center justify-between border-r border-border bg-[#0E0E0E] py-3 text-neutral-400 select-none transition-all',
          className
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(false)}
            className="relative h-8 w-8 p-0 text-neutral-400 hover:bg-[#1C1C1C] hover:text-white"
            title="Expand in-game chat"
          >
            <MessageSquare className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 font-mono text-[9px] font-bold text-black animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(false)}
          className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
          title="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'flex h-full w-64 md:w-72 lg:w-80 shrink-0 flex-col justify-between border-r border-border bg-[#0E0E0E] text-neutral-300 select-none shadow-lg transition-all',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-11 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white">Live Chat</span>
          <Badge variant="outline" className="h-4 px-1 text-[9px] font-mono text-neutral-400">
            {messages.length}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleSound}
            className="h-6 w-6 p-0 text-neutral-400 hover:bg-[#1A1A1A] hover:text-white"
            title={isSoundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
          >
            {isSoundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3 text-neutral-600" />}
          </Button>

          {/* Collapse Toggle */}
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(true)}
              className="h-6 w-6 p-0 text-neutral-400 hover:bg-[#1A1A1A] hover:text-white"
              title="Collapse chat sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Message Feed */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div
          ref={scrollViewportRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 px-4 space-y-2 select-text"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center text-neutral-500">
              <Sparkles className="h-5 w-5 mb-2 text-neutral-600 animate-pulse" />
              <p className="text-xs font-medium text-neutral-400">No messages yet</p>
              <p className="text-[11px] text-neutral-600 mt-1 max-w-[180px]">
                Chat with players, drop quick emojis, and react live to game turns!
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                isCurrentUser={msg.senderId === currentUserId}
              />
            ))
          )}
        </div>

        {/* Jump to New Messages Floating Pill */}
        {!isAtBottom && newMessagesWhileScrolled > 0 && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-black shadow-lg hover:bg-neutral-200 transition-all animate-bounce"
          >
            <ArrowDown className="h-3 w-3" />
            <span>{newMessagesWhileScrolled} new message{newMessagesWhileScrolled > 1 ? 's' : ''}</span>
          </button>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput roomCode={roomCode} />
    </aside>
  );
}
