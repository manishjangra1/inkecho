'use client';

import * as React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { GameChatSidebar } from './GameChatSidebar';
import { useChatStore } from '../stores/chat-store';
import { cn } from '@/shared/lib/cn';

export interface MobileChatDrawerProps {
  readonly roomCode: string;
  readonly currentUserId?: string;
}

export function MobileChatDrawer({ roomCode, currentUserId }: MobileChatDrawerProps) {
  const { isMobileDrawerOpen, setMobileDrawerOpen, unreadCount } = useChatStore();

  return (
    <>
      {/* Floating Trigger Button (Mobile Only) */}
      <div className="fixed bottom-4 left-4 z-40 md:hidden">
        <Button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="relative h-11 w-11 rounded-full bg-[#1A1A1A] border border-neutral-700 text-white shadow-xl hover:bg-[#252525] active:scale-95 transition-all p-0"
          title="Open in-game chat"
        >
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 font-mono text-[10px] font-bold text-black ring-2 ring-[#080808]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Slide-Over Drawer Backdrop & Container */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative z-50 flex h-full w-[85%] max-w-sm flex-col bg-[#0E0E0E] shadow-2xl border-r border-neutral-800 animate-in slide-in-from-left duration-200">
            {/* Mobile Close Button Bar */}
            <div className="absolute top-2.5 right-2 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileDrawerOpen(false)}
                className="h-7 w-7 p-0 text-neutral-400 hover:text-white"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Sidebar Body */}
            <GameChatSidebar
              roomCode={roomCode}
              currentUserId={currentUserId}
              collapsible={false}
              className="w-full border-r-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
