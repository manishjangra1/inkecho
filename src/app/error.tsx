'use client';

import * as React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Container } from '@/shared/ui/layout/Container';

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Root error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Container size="sm">
        <Card variant="glass" className="space-y-6 border-destructive/30 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-sm">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Something went wrong
            </h1>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              We encountered an unexpected glitch. Your session data is intact.
            </p>
            {error.digest && (
              <p className="font-mono text-xs text-muted-foreground/60">Digest: {error.digest}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={() => reset()} variant="default" className="gap-2 shadow-glow">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
}
