import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma.client';
import { gameService } from '@/features/game/services/game.service';
import { env } from '@/shared/config/env';

async function handleProcessTimers(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    env.NODE_ENV === 'production' &&
    env.CRON_SECRET &&
    authHeader !== `Bearer ${env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const expiredGames = await prisma.game.findMany({
      where: {
        status: 'IN_PROGRESS',
        turnEndsAt: { lt: new Date() },
      },
      select: { id: true },
      take: 50,
    });

    let expiredTurnsProcessed = 0;
    for (const g of expiredGames) {
      const res = await gameService.processTimerExpiry(g.id);
      if (res.ok) expiredTurnsProcessed++;
    }

    return NextResponse.json({
      data: { expiredTurnsProcessed },
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'CRON_ERROR', message: 'Failed to process timers' } },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleProcessTimers(request);
}

export async function POST(request: Request) {
  return handleProcessTimers(request);
}
