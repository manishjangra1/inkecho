import { Container } from '@/shared/ui/layout/Container';
import { PageHeader } from '@/shared/ui/layout/PageHeader';
import { PublicRoomList } from '@/features/rooms/components/PublicRoomList';
import { COMMON_COPY } from '@/shared/constants/copy/common';
import { Globe } from 'lucide-react';

export const metadata = {
  title: 'Browse Public Rooms',
  description: 'Join open InkEcho game lobbies with players around the globe.',
};

export default function BrowsePage() {
  return (
    <div className="py-12">
      <Container size="lg">
        <PageHeader
          title={COMMON_COPY.BROWSE.PAGE_TITLE}
          description={COMMON_COPY.BROWSE.PAGE_SUBTITLE}
          badge={
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <Globe className="h-3.5 w-3.5" />
              Live Lobbies
            </span>
          }
        />

        <div className="mt-8">
          <PublicRoomList />
        </div>
      </Container>
    </div>
  );
}
