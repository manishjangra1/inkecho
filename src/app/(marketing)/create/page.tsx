import { Container } from '@/shared/ui/layout/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import { CreateRoomForm } from '@/features/rooms/components/CreateRoomForm';
import { PlusCircle } from 'lucide-react';
import { COMMON_COPY } from '@/shared/constants/copy/common';

export const metadata = {
  title: 'Create a Game Room',
  description: 'Set up customized rules, timers, and rounds for your InkEcho game session.',
};

export default function CreateRoomPage() {
  return (
    <div className="px-4 py-12">
      <Container size="sm">
        <Card variant="glass" className="border-border/60 shadow-xl backdrop-blur-md">
          <CardHeader className="space-y-2 pb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/10 text-brand-primary">
              <PlusCircle className="h-6 w-6" />
            </div>
            <CardTitle className="font-display text-2xl font-bold text-foreground">
              {COMMON_COPY.CREATE_ROOM.TITLE}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {COMMON_COPY.CREATE_ROOM.SUBTITLE}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateRoomForm />
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
