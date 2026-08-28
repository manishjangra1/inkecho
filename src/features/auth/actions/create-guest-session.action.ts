'use server';

import { cookies } from 'next/headers';
import { guestSessionSchema, type GuestSessionInput } from '../schemas/guest-session.schema';
import { guestSessionService } from '../services/guest-session.service';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { getGuestCookieName } from '@/infrastructure/auth/guest-jwt';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { GuestSessionResponse } from '../types/auth.types';
import { env } from '@/shared/config/env';

export async function createGuestSessionAction(
  input: GuestSessionInput
): Promise<ActionResult<GuestSessionResponse>> {
  const correlationId = await getCorrelationId();

  try {
    const parsed = guestSessionSchema.parse(input);

    let roomId = parsed.roomId;
    let roomCode = parsed.roomCode;

    if (parsed.roomCode) {
      const roomResult = await roomRepository.findByCode(parsed.roomCode);
      if (!roomResult.ok) {
        return handleActionError(roomResult.error, correlationId);
      }
      roomId = roomResult.value.id;
      roomCode = roomResult.value.code;
    } else if (parsed.roomId) {
      const roomResult = await roomRepository.findById(parsed.roomId);
      if (!roomResult.ok) {
        return handleActionError(roomResult.error, correlationId);
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
      return handleActionError(sessionResult.error, correlationId);
    }

    const session = sessionResult.value;
    const ttlSeconds = (env.GUEST_SESSION_TTL_HOURS || 24) * 60 * 60;

    const cookieStore = await cookies();
    cookieStore.set(getGuestCookieName(roomCode!), session.token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ttlSeconds,
      path: '/',
    });

    return {
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
    };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
