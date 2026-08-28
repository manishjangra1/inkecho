import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Container } from '@/shared/ui/layout/Container';
import { ROUTES } from '@/shared/constants/routes';
import { COMMON_COPY } from '@/shared/constants/copy/common';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 py-12 backdrop-blur-sm">
      <Container size="lg">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              {COMMON_COPY.APP_NAME}
            </span>
          </div>

          {/* Nav & Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href={ROUTES.BROWSE} className="transition-colors hover:text-foreground">
              {COMMON_COPY.NAV.BROWSE}
            </Link>
            <Link href={ROUTES.CREATE} className="transition-colors hover:text-foreground">
              {COMMON_COPY.NAV.CREATE}
            </Link>
            <Link href={ROUTES.LEGAL.PRIVACY} className="transition-colors hover:text-foreground">
              {COMMON_COPY.FOOTER.PRIVACY}
            </Link>
            <Link href={ROUTES.LEGAL.TERMS} className="transition-colors hover:text-foreground">
              {COMMON_COPY.FOOTER.TERMS}
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-muted-foreground">{COMMON_COPY.FOOTER.COPYRIGHT}</div>
        </div>
      </Container>
    </footer>
  );
}
