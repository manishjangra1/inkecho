import { RevealShell } from '@/features/reveal/components/RevealShell';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return {
    title: `Story Reveal — Room ${code.toUpperCase()} | InkEcho`,
    description: `Relive the funny and creative story chains from Room ${code.toUpperCase()}`,
  };
}

export default async function RevealPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <RevealShell roomCode={code.toUpperCase()} />;
}
