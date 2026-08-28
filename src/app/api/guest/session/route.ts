import { NextResponse, type NextRequest } from 'next/server';
import { guestSessionSchema } from '@/features/auth/schemas/guest-session.schema';
import { guestSessionService } from '@/features/auth/services/guest-session.service';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import { GUEST_COOKIE_NAME } from '@/infrastructure/auth/guest-jwt';
import { env } from '@/shared/config/env';

export async function POST(request: NextRequest) {
  const correlationId = await getCorrelationId();

  try {
    const body = await request.json();
    const parsed = guestSessionSchema.parse(body);

    let roomId = parsed.roomId;
    let roomCode = parsed.roomCode;

    if (parsed.roomCode) {
      const roomResult = await roomRepository.findByCode(parsed.roomCode);
      if (!roomResult.ok) {
        return handleApiError(roomResult.error, correlationId);
      }
      roomId = roomResult.value.id;
      roomCode = roomResult.value.code;
    } else if (parsed.roomId) {
      const roomResult = await roomRepository.findById(parsed.roomId);
      if (!roomResult.ok) {
        return handleApiError(roomResult.error, correlationId);
      }
      roomId = roomResult.value.id;
      roomCode = roomResult.value.code;
    }

    if (!roomId || !roomCode) {
      throw new Error('Could not resolve room.');
    }

    const sessionResult = await guestSessionService.create({
      roomId,
      displayName: parsed.displayName,
    });

    if (!sessionResult.ok) {
      return handleApiError(sessionResult.error, correlationId);
    }

    const session = sessionResult.value;
    const ttlSeconds = (env.GUEST_SESSION_TTL_HOURS || 24) * 60 * 60;

    const response = NextResponse.json(
      {
        success: true,
        data: {
          guestSessionId: session.guestSessionId,
          playerId: session.playerId,
          roomId,
          roomCode,
          displayName: parsed.displayName,
          token: session.token,
          expiresAt: session.expiresAt.toISOString(),
        },
      },
      { status: 201 }
    );

    response.cookies.set(GUEST_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ttlSeconds,
      path: '/',
    });

    return response;
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}
