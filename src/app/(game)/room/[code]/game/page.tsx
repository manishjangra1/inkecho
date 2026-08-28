import { GameShell } from '@/features/game/components/GameShell';

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return {
    title: `Game — Room ${code.toUpperCase()} | InkEcho`,
    description: `Active InkEcho game match in room ${code.toUpperCase()}`,
  };
}

export default async function GamePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <GameShell roomCode={code.toUpperCase()} />;
}
