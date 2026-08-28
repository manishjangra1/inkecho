import { NextResponse, type NextRequest } from 'next/server';
import { roomService } from '@/features/rooms/services/room.service';
import { joinRoomSchema } from '@/features/rooms/schemas/join-room.schema';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import { GUEST_COOKIE_NAME, getGuestCookieName } from '@/infrastructure/auth/guest-jwt';
import { env } from '@/shared/config/env';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const correlationId = await getCorrelationId();

  try {
    const { code } = await params;
    const body = await request.json();
    const parsed = joinRoomSchema.parse({ ...body, roomCode: code });
    const ctx = await getAuthContext();

    const result = await roomService.joinRoom(parsed, ctx);
    if (!result.ok) {
      return handleApiError(result.error, correlationId);
    }

    const { token, playerId, role, redirectTo, room } = result.value;
    const ttlSeconds = (env.GUEST_SESSION_TTL_HOURS || 24) * 60 * 60;

    const response = NextResponse.json(
      {
        success: true,
        data: { playerId, role, redirectTo, room },
      },
      { status: 200 }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: ttlSeconds,
      path: '/',
    };

    response.cookies.set(getGuestCookieName(code), token, cookieOptions);
    response.cookies.set(GUEST_COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}
