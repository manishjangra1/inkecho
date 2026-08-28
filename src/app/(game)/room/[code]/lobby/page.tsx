import { notFound } from 'next/navigation';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { getAuthContext } from '@/infrastructure/auth/session';
import { LobbyView } from '@/features/lobby/components/LobbyView';

export const metadata = {
  title: 'Game Lobby',
  description: 'Lobby room awaiting players to start the game.',
};

export default async function LobbyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const roomResult = await roomRepository.findByCode(code);

  if (!roomResult.ok) {
    notFound();
  }

  const room = roomResult.value;
  const ctx = await getAuthContext();
  const currentPlayerId = ctx.type !== 'anonymous' ? ctx.playerId : undefined;

  return <LobbyView initialRoom={room} currentPlayerId={currentPlayerId} />;
}
