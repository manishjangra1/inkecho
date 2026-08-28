'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from '@/shared/ui/sonner';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
