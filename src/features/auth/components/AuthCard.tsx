import * as React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
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
    <div className="w-full max-w-md mx-auto">
      <Card variant="glass" className="border-border/60 shadow-xl backdrop-blur-md">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-glow">
            <Link href={ROUTES.HOME}>
              <Sparkles className="h-6 w-6" />
            </Link>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold font-display text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
          {footer && <div className="pt-2 border-t border-border/40">{footer}</div>}
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground/60 mt-6">
        {COMMON_COPY.APP_NAME} &bull; {COMMON_COPY.APP_TAGLINE}
      </p>
    </div>
  );
}
