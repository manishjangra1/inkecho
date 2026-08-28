'use server';

import { cookies } from 'next/headers';
import { joinRoomSchema, type JoinRoomInput } from '../schemas/join-room.schema';
import { roomService } from '../services/room.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { GUEST_COOKIE_NAME, getGuestCookieName } from '@/infrastructure/auth/guest-jwt';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { JoinRoomResponse } from '../types/room.types';
import { env } from '@/shared/config/env';
import { assertRateLimit } from '@/infrastructure/cache/rate-limiter';

export async function joinRoomAction(
  input: JoinRoomInput
): Promise<ActionResult<JoinRoomResponse>> {
  const correlationId = await getCorrelationId();

  try {
    const parsed = joinRoomSchema.parse(input);
    const ctx = await getAuthContext();

    const identifier = ctx.type === 'registered' ? ctx.userId : 'anonymous';
    await assertRateLimit(`join-room:${identifier}`, 20, 60);

    const result = await roomService.joinRoom(parsed, ctx);
    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    const { token, playerId, role, redirectTo, room } = result.value;
    const ttlSeconds = (env.GUEST_SESSION_TTL_HOURS || 24) * 60 * 60;

    const cookieOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: ttlSeconds,
      path: '/',
    };

    const cookieStore = await cookies();
    cookieStore.set(getGuestCookieName(parsed.roomCode), token, cookieOptions);
    cookieStore.set(GUEST_COOKIE_NAME, token, cookieOptions);

    return {
      success: true,
      data: {
        playerId,
        role,
        redirectTo,
        room,
      },
    };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
