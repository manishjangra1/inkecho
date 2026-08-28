import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Container } from '@/shared/ui/layout/Container';
import { ROUTES } from '@/shared/constants/routes';
import { COMMON_COPY } from '@/shared/constants/copy/common';

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#0E0E0E] py-8 text-neutral-400 select-none">
      <Container size="lg">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-xs">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span className="font-semibold text-white uppercase tracking-wider text-xs">
              {COMMON_COPY.APP_NAME}
            </span>
          </div>

          {/* Nav & Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400">
            <Link href={ROUTES.BROWSE} className="transition-colors hover:text-white">
              {COMMON_COPY.NAV.BROWSE}
            </Link>
            <Link href={ROUTES.CREATE} className="transition-colors hover:text-white">
              {COMMON_COPY.NAV.CREATE}
            </Link>
            <Link href={ROUTES.LEGAL.PRIVACY} className="transition-colors hover:text-white">
              {COMMON_COPY.FOOTER.PRIVACY}
            </Link>
            <Link href={ROUTES.LEGAL.TERMS} className="transition-colors hover:text-white">
              {COMMON_COPY.FOOTER.TERMS}
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-[11px] text-neutral-500">{COMMON_COPY.FOOTER.COPYRIGHT}</div>
        </div>
      </Container>
    </footer>
  );
}
