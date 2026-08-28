import * as React from 'react';
import Link from 'next/link';
import { LogoMark } from '@/shared/ui/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { COMMON_COPY } from '@/shared/constants/copy/common';
import { ROUTES } from '@/shared/constants/routes';

interface AuthCardProps {
  readonly title: string;
  readonly description: string;
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card variant="glass" className="border-border/60 shadow-xl backdrop-blur-md">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#141414] border border-neutral-800 text-white shadow-glow">
            <Link href={ROUTES.HOME} className="flex items-center justify-center">
              <LogoMark sizeClassName="h-7 w-7" />
            </Link>
          </div>
          <div>
            <CardTitle className="font-display text-2xl font-bold text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
          {footer && <div className="border-t border-border/40 pt-2">{footer}</div>}
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-xs text-muted-foreground/60">
        {COMMON_COPY.APP_NAME} &bull; {COMMON_COPY.APP_TAGLINE}
      </p>
    </div>
  );
}
