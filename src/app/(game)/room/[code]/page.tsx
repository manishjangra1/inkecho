import { notFound, redirect } from 'next/navigation';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';

export const dynamic = 'force-dynamic';

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomResult = await roomRepository.findByCode(code);

  if (!roomResult.ok) {
    notFound();
  }

  const room = roomResult.value;

  if (room.status === 'LOBBY') {
    redirect(`/room/${code}/lobby`);
  } else if (room.status === 'IN_PROGRESS') {
    redirect(`/room/${code}/game`);
  } else if (room.status === 'REVEAL') {
    redirect(`/room/${code}/reveal`);
  } else {
    redirect('/');
  }
}
