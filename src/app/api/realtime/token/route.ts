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

    // The Ably client passes its own clientId on every auth request.
    // We MUST honour it to avoid "clientId mismatch" errors when
    // multiple browser tabs share the same cookie jar (e.g. incognito).
    const clientIdParam = searchParams.get('clientId');

    let playerId: string;
    if (clientIdParam && clientIdParam.length > 0) {
      playerId = clientIdParam;
    } else {
      const ctx = await getAuthContext();

      if (ctx.type === 'guest' && ctx.roomId !== roomId) {
        throw new ForbiddenError('ROOM_MISMATCH', 'Session does not match this room.');
      }

      playerId =
        ctx.type !== 'anonymous' && ctx.playerId
          ? ctx.playerId
          : `spectator_${Math.random().toString(36).substring(2, 9)}`;
    }

    const tokenRes = await ablyTokenService.createTokenRequest(roomId, playerId);
    if (!tokenRes.ok) {
      throw tokenRes.error;
    }

    return NextResponse.json(tokenRes.value);
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}

