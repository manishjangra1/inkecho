import * as React from 'react';
import { Container } from './Container';

interface RoomShellProps {
  readonly header: React.ReactNode;
  readonly children: React.ReactNode;
}

export function RoomShell({ header, children }: RoomShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-brand-primary selection:text-white">
      {header}
      <main className="flex-1 py-6 sm:py-8">
        <Container size="lg">{children}</Container>
      </main>
    </div>
  );
}
