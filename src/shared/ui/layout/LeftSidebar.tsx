'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  PlusSquare,
  LogIn,
  History,
  Settings,
  Sparkles,
  Radio,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { ROUTES } from '@/shared/constants/routes';

export interface LeftSidebarProps {
  readonly currentUserName?: string;
  readonly isOnline?: boolean;
}

export function LeftSidebar({ currentUserName = 'Guest Player', isOnline = true }: LeftSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Browse Rooms', href: ROUTES.BROWSE, icon: Compass },
    { label: 'Create Room', href: ROUTES.CREATE, icon: PlusSquare },
    { label: 'Join Room', href: ROUTES.JOIN, icon: LogIn },
    { label: 'Game History', href: '/history', icon: History },
  ];

  const recentRooms = [
    { code: 'FUN-SQUAD', players: '4/8', status: 'In Lobby' },
    { code: 'SKETCH-44', players: '6/8', status: 'Drawing' },
    { code: 'NIGHT-OWL', players: '3/6', status: 'In Lobby' },
  ];

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col justify-between border-r border-border bg-[#0E0E0E] text-neutral-300 select-none">
      <div className="flex flex-col gap-5 p-3">
        {/* Nav Header */}
        <div className="flex items-center gap-2 px-2 pt-1 text-xs font-semibold text-white">
          <Sparkles className="h-3.5 w-3.5" />
          <span>InkEcho Hub</span>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-[4px] px-2.5 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#1C1C1C] text-white border border-neutral-700'
                    : 'text-neutral-400 hover:bg-[#161616] hover:text-white'
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Rooms */}
        <div className="flex flex-col space-y-1.5 pt-2">
          <div className="flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            <span>Rooms</span>
            <Radio className="h-2.5 w-2.5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col space-y-1">
            {recentRooms.map((room) => (
              <Link
                key={room.code}
                href={`/room/${room.code}`}
                className="flex items-center justify-between rounded-[4px] px-2.5 py-1.5 text-xs text-neutral-400 hover:bg-[#161616] hover:text-white transition-colors"
              >
                <span className="font-mono font-medium text-neutral-200">{room.code}</span>
                <Badge variant="outline" className="h-4 px-1 text-[9px] text-neutral-400 font-mono">
                  {room.players}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between rounded-[4px] border border-transparent p-1.5 hover:border-neutral-800 hover:bg-[#141414] transition-colors">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="h-7 w-7 rounded-[4px] border border-neutral-700 bg-[#1A1A1A]">
                <AvatarFallback className="text-[10px] font-bold text-white bg-neutral-800">
                  {currentUserName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#0E0E0E] bg-white" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white leading-none">{currentUserName}</span>
              <span className="text-[10px] text-neutral-500 leading-none mt-1">Online</span>
            </div>
          </div>
          <Link
            href="/settings"
            className="p-1 text-neutral-500 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
