import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function AppShell({ header, footer, children, className, ...props }: AppShellProps) {
  return (
    <div
      className={cn('flex min-h-screen flex-col bg-background text-foreground', className)}
      {...props}
    >
      {header}
      <main className="flex flex-1 flex-col">{children}</main>
      {footer}
    </div>
  );
}
