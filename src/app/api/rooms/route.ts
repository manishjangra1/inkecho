import { NextResponse, type NextRequest } from 'next/server';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { roomService } from '@/features/rooms/services/room.service';
import { createRoomSchema } from '@/features/rooms/schemas/create-room.schema';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import { GUEST_COOKIE_NAME, getGuestCookieName } from '@/infrastructure/auth/guest-jwt';
import { env } from '@/shared/config/env';

export async function GET(request: NextRequest) {
  const correlationId = await getCorrelationId();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const result = await roomRepository.listPublic({ page, limit });
    if (!result.ok) {
      return handleApiError(result.error, correlationId);
    }

    return NextResponse.json({ success: true, data: result.value }, { status: 200 });
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}

export async function POST(request: NextRequest) {
  const correlationId = await getCorrelationId();

  try {
    const body = await request.json();
    const parsed = createRoomSchema.parse(body);
    const ctx = await getAuthContext();

    const result = await roomService.createRoom(parsed, ctx);
    if (!result.ok) {
      return handleApiError(result.error, correlationId);
    }

    const { token, roomId, roomCode, playerId, inviteUrl } = result.value;
    const ttlSeconds = (env.GUEST_SESSION_TTL_HOURS || 24) * 60 * 60;

    const response = NextResponse.json(
      {
        success: true,
        data: { roomId, roomCode, playerId, inviteUrl },
      },
      { status: 201 }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: ttlSeconds,
      path: '/',
    };

    response.cookies.set(getGuestCookieName(roomCode), token, cookieOptions);
    response.cookies.set(GUEST_COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}
