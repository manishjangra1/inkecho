import { NextResponse } from 'next/server';
import { ablyTokenService } from '@/infrastructure/realtime/ably-token.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import { objectIdSchema } from '@/shared/lib/validation/schemas';
import { ForbiddenError } from '@/shared/lib/errors/app-error';

export async function GET(request: Request) {
  const correlationId = await getCorrelationId();

  try {
    const { searchParams } = new URL(request.url);
    const roomIdParam = searchParams.get('roomId');
    const roomId = objectIdSchema.parse(roomIdParam);

    const ctx = await getAuthContext();

    // Verify player is member of room or spectator
    if (ctx.type === 'guest' && ctx.roomId !== roomId) {
      throw new ForbiddenError('ROOM_MISMATCH', 'Session does not match this room.');
    }

    const playerId =
      ctx.type !== 'anonymous' && ctx.playerId
        ? ctx.playerId
        : `spectator_${Math.random().toString(36).substring(2, 9)}`;

    const tokenRes = await ablyTokenService.createTokenRequest(roomId, playerId);
    if (!tokenRes.ok) {
      throw tokenRes.error;
    }

    return NextResponse.json(tokenRes.value);
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}
