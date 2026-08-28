import Link from 'next/link';
import { Home, Compass } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Container } from '@/shared/ui/layout/Container';
import { Card } from '@/shared/ui/card';
import { ROUTES } from '@/shared/constants/routes';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Container size="sm">
        <Card variant="glass" className="space-y-6 p-8 text-center">
          <div className="space-y-2">
            <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text font-display text-7xl font-extrabold text-transparent sm:text-8xl">
              404
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Lost in the Echo?
            </h1>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              The page or game room you are looking for does not exist, was closed, or drifted off
              into the doodle cosmos.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href={ROUTES.HOME}>
              <Button variant="default" className="gap-2 shadow-glow">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href={ROUTES.BROWSE}>
              <Button variant="outline" className="gap-2">
                <Compass className="h-4 w-4" />
                Browse Rooms
              </Button>
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}
