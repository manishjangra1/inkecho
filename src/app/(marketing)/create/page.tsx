import { Container } from '@/shared/ui/layout/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import { CreateRoomForm } from '@/features/rooms/components/CreateRoomForm';
import { COMMON_COPY } from '@/shared/constants/copy/common';

export const metadata = {
  title: 'Create a Game Room',
  description: 'Set up customized rules, timers, and rounds for your InkEcho game session.',
};

export default function CreateRoomPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-3 sm:p-4 select-none">
      <Container size="sm" className="max-w-xl">
        <Card className="rounded-[4px] border border-border bg-[#111111]">
          <CardHeader className="space-y-1 p-4 pb-2 text-center">
            <CardTitle className="text-lg font-bold text-white">
              {COMMON_COPY.CREATE_ROOM.TITLE}
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400">
              {COMMON_COPY.CREATE_ROOM.SUBTITLE}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <CreateRoomForm />
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
