import { NextResponse } from 'next/server';
import { lobbyService } from '@/features/lobby/services/lobby.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import { roomCodeSchema } from '@/shared/lib/validation/schemas';

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const correlationId = await getCorrelationId();

  try {
    const params = await context.params;
    const roomCode = roomCodeSchema.parse(params.code);
    const ctx = await getAuthContext();

    const startRes = await lobbyService.startGame(roomCode, ctx);
    if (!startRes.ok) {
      return handleApiError(startRes.error, correlationId);
    }

    return NextResponse.json({
      success: true,
      data: startRes.value,
    });
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}
