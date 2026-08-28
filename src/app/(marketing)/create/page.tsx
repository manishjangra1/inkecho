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
    <div className="py-12 px-4">
      <Container size="sm">
        <Card variant="glass" className="border-border/60 shadow-xl backdrop-blur-md">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <PlusCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold font-display text-foreground">
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
