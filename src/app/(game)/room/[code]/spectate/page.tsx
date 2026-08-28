import { GameShell } from '@/features/game/components/GameShell';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return {
    title: `Spectating — Room ${code.toUpperCase()} | InkEcho`,
    description: `Spectating InkEcho match in room ${code.toUpperCase()}`,
  };
}

export default async function SpectatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <GameShell roomCode={code.toUpperCase()} />;
}
