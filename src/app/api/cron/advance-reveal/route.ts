import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma.client';
import { eventPublisher } from '@/infrastructure/realtime/event-publisher';
import { env } from '@/shared/config/env';

async function handleAdvanceReveal(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    env.NODE_ENV === 'production' &&
    env.CRON_SECRET &&
    authHeader !== `Bearer ${env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const revealGames = await prisma.game.findMany({
      where: {
        status: 'REVEAL',
      },
      take: 20,
    });

    let advancedRooms = 0;
    for (const game of revealGames) {
      const currentChain = game.chains[game.revealChainIndex];
      if (!currentChain) continue;

      const totalSteps = currentChain.turns.length + 1;
      let nextStepIndex = game.revealStepIndex + 1;
      let nextChainIndex = game.revealChainIndex;

      if (nextStepIndex >= totalSteps) {
        if (nextChainIndex < game.chains.length - 1) {
          nextChainIndex += 1;
          nextStepIndex = 0;
        } else {
          // All chains revealed
          continue;
        }
      }

      await prisma.game.update({
        where: { id: game.id },
        data: {
          revealChainIndex: nextChainIndex,
          revealStepIndex: nextStepIndex,
        },
      });

      // Broadcast step event
      const chain = game.chains[nextChainIndex];
      if (chain) {
        const isPrompt = nextStepIndex === 0;
        const turn = !isPrompt ? chain.turns[nextStepIndex - 1] : null;

        await eventPublisher.revealChainStep(
          game.roomId,
          nextChainIndex,
          nextStepIndex,
          isPrompt ? 'STARTER_PROMPT' : turn?.phase === 'DRAW' ? 'DRAWING' : 'DESCRIPTION',
          {
            promptText: isPrompt ? chain.starterPrompt : undefined,
            textContent: turn?.textContent ?? undefined,
            drawingUrl: turn?.drawingUrl ?? undefined,
          },
          isPrompt ? 'Original Prompt' : `Player ${nextStepIndex}`
        );
      }

      advancedRooms++;
    }

    return NextResponse.json({
      data: { advancedRooms },
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'CRON_ERROR', message: 'Failed to advance reveal' } },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleAdvanceReveal(request);
}

export async function POST(request: Request) {
  return handleAdvanceReveal(request);
}
