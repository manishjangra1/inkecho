import React from 'react';
import Link from 'next/link';
import { Container } from '@/shared/ui/layout/Container';
import { User, History, BarChart3, Award, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const metadata = {
  title: 'My Profile | InkEcho',
  description: 'Manage your InkEcho player profile, match history, and achievements.',
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Account Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-md">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="gap-1 rounded-full text-xs">
              <Link href="/">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
              </Link>
            </Button>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-bold tracking-tight">Account & Profile</span>
          </div>

          <Button variant="default" size="sm" asChild className="rounded-full text-xs">
            <Link href="/browse">Play Game</Link>
          </Button>
        </Container>
      </header>

      {/* Account Subnavigation Tabs */}
      <div className="border-b border-border/40 bg-muted/20 px-4">
        <Container className="scrollbar-none flex items-center gap-2 overflow-x-auto py-2.5 text-xs font-semibold">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-foreground/80 transition-colors hover:bg-card hover:text-foreground"
          >
            <User className="h-3.5 w-3.5 text-primary" />
            <span>Overview</span>
          </Link>

          <Link
            href="/profile/history"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <History className="h-3.5 w-3.5" />
            <span>Match History</span>
          </Link>

          <Link
            href="/profile/stats"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Statistics</span>
          </Link>

          <Link
            href="/profile/achievements"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <Award className="h-3.5 w-3.5" />
            <span>Achievements</span>
          </Link>
        </Container>
      </div>

      <main className="flex-1 py-8">
        <Container className="max-w-5xl space-y-8">{children}</Container>
      </main>
    </div>
  );
}
