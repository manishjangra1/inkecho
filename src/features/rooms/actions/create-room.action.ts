'use server';

import { cookies } from 'next/headers';
import { createRoomSchema, type CreateRoomInput } from '../schemas/create-room.schema';
import { roomService } from '../services/room.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { GUEST_COOKIE_NAME } from '@/infrastructure/auth/guest-jwt';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { CreateRoomResponse } from '../types/room.types';
import { env } from '@/shared/config/env';
import { assertRateLimit } from '@/infrastructure/cache/rate-limiter';

export async function createRoomAction(
  input: CreateRoomInput
): Promise<ActionResult<CreateRoomResponse>> {
  const correlationId = await getCorrelationId();

  try {
    const parsed = createRoomSchema.parse(input);
    const ctx = await getAuthContext();

    const identifier = ctx.type === 'registered' ? ctx.userId : 'anonymous';
    await assertRateLimit(`create-room:${identifier}`, 10, 60);

    const result = await roomService.createRoom(parsed, ctx);
    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    const { token, roomId, roomCode, playerId, inviteUrl } = result.value;
    const ttlSeconds = (env.GUEST_SESSION_TTL_HOURS || 24) * 60 * 60;

    const cookieStore = await cookies();
    cookieStore.set(GUEST_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ttlSeconds,
      path: '/',
    });

    return {
      success: true,
      data: {
        roomId,
        roomCode,
        playerId,
        inviteUrl,
      },
    };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
