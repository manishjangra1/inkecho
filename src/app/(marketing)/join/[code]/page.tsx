import { Container } from '@/shared/ui/layout/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import { JoinRoomForm } from '@/features/rooms/components/JoinRoomForm';
import { Users } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return {
    title: `Join Room ${code.toUpperCase()}`,
    description: `Join InkEcho game room ${code.toUpperCase()} now.`,
  };
}

export default async function JoinWithCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return (
    <div className="px-4 py-12">
      <Container size="sm">
        <Card variant="glass" className="border-border/60 shadow-xl backdrop-blur-md">
          <CardHeader className="space-y-2 pb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/10 text-brand-primary">
              <Users className="h-6 w-6" />
            </div>
            <CardTitle className="font-display text-2xl font-bold text-foreground">
              Join Room {code.toUpperCase()}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              You were invited to play! Enter your name below to enter the lobby.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JoinRoomForm initialCode={code} />
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
