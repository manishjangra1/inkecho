'use client';

import * as React from 'react';
import { GameChatSidebar, MobileChatDrawer } from '@/features/chat';
import { useGameStore } from '@/features/game/stores/game-store';

export interface RoomShellProps {
  readonly header: React.ReactNode;
  readonly roomCode?: string;
  readonly children: React.ReactNode;
}

export function RoomShell({ header, roomCode, children }: RoomShellProps) {
  const storeRoomCode = useGameStore((state) => state.roomCode);
  const playerId = useGameStore((state) => state.playerId) || undefined;
  const effectiveRoomCode = roomCode || storeRoomCode || undefined;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#080808] text-foreground selection:bg-neutral-800 selection:text-white">
      {header}
      <div className="flex flex-1 overflow-hidden">
        {/* Leftmost Chat Sidebar (Attached Edge-to-Edge Top to Bottom) */}
        {effectiveRoomCode && (
          <>
            <div className="hidden md:flex h-full shrink-0 border-r border-border bg-[#0E0E0E]">
              <GameChatSidebar
                roomCode={effectiveRoomCode}
                currentUserId={playerId}
              />
            </div>
            <MobileChatDrawer
              roomCode={effectiveRoomCode}
              currentUserId={playerId}
            />
          </>
        )}

        {/* Main Stage Workspace Area */}
        <main className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto flex h-full w-full max-w-5xl flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
