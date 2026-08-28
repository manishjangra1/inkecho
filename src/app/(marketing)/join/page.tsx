import { Container } from '@/shared/ui/layout/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui/card';
import { JoinRoomForm } from '@/features/rooms/components/JoinRoomForm';
import { COMMON_COPY } from '@/shared/constants/copy/common';

export const metadata = {
  title: 'Join Game Room',
  description: 'Enter a 6-character room code to join an InkEcho drawing game.',
};

export default function JoinPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-3 sm:p-4 select-none">
      <Container size="sm" className="max-w-md">
        <Card className="rounded-[4px] border border-border bg-[#111111]">
          <CardHeader className="space-y-1 p-4 pb-2 text-center">
            <CardTitle className="text-lg font-bold text-white">
              {COMMON_COPY.QUICK_JOIN.TITLE}
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400">
              {COMMON_COPY.QUICK_JOIN.SUBTITLE}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <JoinRoomForm />
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
