import * as React from 'react';
import { notFound } from 'next/navigation';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { getAuthContext } from '@/infrastructure/auth/session';
import { RoomHeader } from '@/features/rooms/components/RoomHeader';
import { RoomShell } from '@/shared/ui/layout/RoomShell';
import { RealtimeProvider } from '@/features/realtime/providers/RealtimeProvider';

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return {
    title: `Room ${code.toUpperCase()}`,
    description: `InkEcho game room ${code.toUpperCase()}`,
  };
}

export default async function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const roomResult = await roomRepository.findByCode(code);

  if (!roomResult.ok) {
    notFound();
  }

  const room = roomResult.value;
  const ctx = await getAuthContext();
  const isHost = ctx.type !== 'anonymous' && ctx.playerId === room.hostPlayerId;

  const playerId =
    ctx.type !== 'anonymous' && ctx.playerId
      ? ctx.playerId
      : `spectator_${room.code.toLowerCase()}`;
  const displayName = ctx.type !== 'anonymous' && ctx.displayName ? ctx.displayName : 'Spectator';
  const role = ctx.type !== 'anonymous' && ctx.role ? ctx.role : isHost ? 'HOST' : 'SPECTATOR';

  return (
    <RealtimeProvider
      roomId={room.id}
      roomCode={room.code}
      playerId={playerId}
      displayName={displayName}
      role={role}
    >
      <RoomShell header={<RoomHeader room={room} isHost={isHost} />}>{children}</RoomShell>
    </RealtimeProvider>
  );
}
