import * as React from 'react';

interface RoomShellProps {
  readonly header: React.ReactNode;
  readonly children: React.ReactNode;
}

export function RoomShell({ header, children }: RoomShellProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#080808] text-foreground selection:bg-neutral-800 selection:text-white">
      {header}
      <main className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
