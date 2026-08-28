'use client';

import Link from 'next/link';
import { Sparkles, Plus, Compass, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { Container } from '@/shared/ui/layout/Container';
import { useSession, signOut } from '@/features/auth/lib/auth-client';
import { ROUTES } from '@/shared/constants/routes';
import { COMMON_COPY } from '@/shared/constants/copy/common';

export function MarketingHeader() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <Container size="lg">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2.5 group transition-transform hover:scale-105"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary shadow-md shadow-brand-primary/20 text-white">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              {COMMON_COPY.APP_NAME}
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link
              href={ROUTES.BROWSE}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Compass className="h-4 w-4" />
              {COMMON_COPY.NAV.BROWSE}
            </Link>
          </nav>

          {/* Action CTAs & Controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link href={ROUTES.CREATE} className="hidden sm:inline-flex">
              <Button variant="default" size="sm" className="gap-1.5 font-medium shadow-glow">
                <Plus className="h-4 w-4" />
                {COMMON_COPY.NAV.CREATE}
              </Button>
            </Link>

            {session?.user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium px-2 py-1 bg-card rounded-md border border-border/60">
                  <UserIcon className="h-3 w-3 text-brand-primary" />
                  {session.user.name || session.user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="gap-1.5 text-xs"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href={ROUTES.AUTH.LOGIN}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  {COMMON_COPY.NAV.LOGIN}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
