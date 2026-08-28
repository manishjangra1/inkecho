'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/shared/ui/layout/Container';
import { Button } from '@/shared/ui/button';
import { ShieldCheck, AlertTriangle, Users, BarChart3, ArrowLeft } from 'lucide-react';

export interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-md">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="gap-1 rounded-full text-xs">
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to App
              </Link>
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold tracking-tight">Admin Moderation Console</span>
            </div>
          </div>
        </Container>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="border-b border-border/40 bg-muted/20 px-4">
        <Container className="scrollbar-none flex items-center gap-2 overflow-x-auto py-2.5 text-xs font-semibold">
          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-foreground/80 transition-colors hover:bg-card hover:text-foreground"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>Reports & Flags</span>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <Users className="h-3.5 w-3.5" />
            <span>User Management</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Platform Analytics</span>
          </Link>
        </Container>
      </div>

      <main className="flex-1 py-8">
        <Container className="max-w-6xl space-y-8">{children}</Container>
      </main>
    </div>
  );
}
