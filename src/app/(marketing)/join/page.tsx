import { Container } from '@/shared/ui/layout/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import { JoinRoomForm } from '@/features/rooms/components/JoinRoomForm';
import { Users } from 'lucide-react';
import { COMMON_COPY } from '@/shared/constants/copy/common';

export const metadata = {
  title: 'Join Game Room',
  description: 'Enter a 6-character room code to join an InkEcho drawing game.',
};

export default function JoinPage() {
  return (
    <div className="py-12 px-4">
      <Container size="sm">
        <Card variant="glass" className="border-border/60 shadow-xl backdrop-blur-md">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20">
              <Users className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold font-display text-foreground">
              {COMMON_COPY.QUICK_JOIN.TITLE}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {COMMON_COPY.QUICK_JOIN.SUBTITLE}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JoinRoomForm />
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
