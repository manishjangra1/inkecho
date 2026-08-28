import { NextResponse } from 'next/server';
import { gameService } from '@/features/game/services/game.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import { roomCodeSchema } from '@/shared/lib/validation/schemas';

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const correlationId = await getCorrelationId();

  try {
    const params = await context.params;
    const roomCode = roomCodeSchema.parse(params.code);
    const ctx = await getAuthContext(roomCode);

    const snapshotRes = await gameService.getSnapshot(roomCode, ctx);
    if (!snapshotRes.ok) {
      return handleApiError(snapshotRes.error, correlationId);
    }

    return NextResponse.json({
      success: true,
      data: snapshotRes.value,
    });
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}
