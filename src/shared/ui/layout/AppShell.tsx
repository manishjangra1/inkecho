'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/cn';
import { TopNavigation, type TopNavigationProps } from './TopNavigation';
import { LeftSidebar, type LeftSidebarProps } from './LeftSidebar';
import { RightContextPanel, type RightContextPanelProps } from './RightContextPanel';
import { StatusBar, type StatusBarProps } from './StatusBar';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly header?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly topNavProps?: TopNavigationProps;
  readonly leftSidebarProps?: LeftSidebarProps;
  readonly rightPanelProps?: RightContextPanelProps;
  readonly statusBarProps?: StatusBarProps;
  readonly showLeftSidebar?: boolean;
  readonly showRightPanel?: boolean;
  readonly showStatusBar?: boolean;
}

export function AppShell({
  header,
  footer,
  children,
  className,
  topNavProps,
  leftSidebarProps,
  rightPanelProps,
  statusBarProps,
  showLeftSidebar = false,
  showRightPanel = false,
  showStatusBar = false,
  ...props
}: AppShellProps) {
  // If custom header or footer is passed (e.g. from marketing layout), render with standard responsive container
  if (header || footer) {
    return (
      <div
        className={cn(
          'flex min-h-screen flex-col bg-[#080808] text-foreground font-sans antialiased selection:bg-neutral-800 selection:text-white',
          className
        )}
        {...props}
      >
        {header}
        <main className="flex flex-1 flex-col">{children}</main>
        {footer}
      </div>
    );
  }

  // Full 3-Panel Desktop Application Shell
  return (
    <div
      className={cn(
        'flex h-screen w-screen flex-col overflow-hidden bg-[#080808] text-foreground font-sans antialiased select-none',
        className
      )}
      {...props}
    >
      {/* Top Bar */}
      <TopNavigation {...topNavProps} />

      {/* Main 3-Panel Row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {showLeftSidebar && <LeftSidebar {...leftSidebarProps} />}

        {/* Center Main Stage / Workspace (No Scroll by Default for Game) */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-[#080808]">
          {children}
        </main>

        {/* Right Context Panel */}
        {showRightPanel && <RightContextPanel {...rightPanelProps} />}
      </div>

      {/* Bottom Status Bar */}
      {showStatusBar && <StatusBar {...statusBarProps} />}
    </div>
  );
}
