import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function AppShell({ header, footer, children, className, ...props }: AppShellProps) {
  return (
    <div className={cn('min-h-screen flex flex-col bg-background text-foreground', className)} {...props}>
      {header}
      <main className="flex-1 flex flex-col">{children}</main>
      {footer}
    </div>
  );
}
