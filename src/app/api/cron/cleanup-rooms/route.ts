import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma.client';
import { gameService } from '@/features/game/services/game.service';
import { env } from '@/shared/config/env';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (env.NODE_ENV === 'production' && authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Close idle lobby rooms
    const closedRooms = await prisma.room.updateMany({
      where: {
        status: 'LOBBY',
        lastActivityAt: { lt: twoHoursAgo },
      },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closeReason: 'IDLE_TIMEOUT',
      },
    });

    // Process expired timers in active games
    const activeGames = await prisma.game.findMany({
      where: {
        status: 'IN_PROGRESS',
        turnEndsAt: { lt: new Date() },
      },
      select: { id: true },
      take: 20,
    });

    for (const g of activeGames) {
      await gameService.processTimerExpiry(g.id);
    }

    return NextResponse.json({
      success: true,
      cleanedRooms: closedRooms.count,
      processedExpiries: activeGames.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to run cleanup cron' },
      { status: 500 }
    );
  }
}
