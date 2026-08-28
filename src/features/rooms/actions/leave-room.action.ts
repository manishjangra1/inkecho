'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { roomCodeSchema } from '@/shared/lib/validation/schemas';
import { roomService } from '../services/room.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { getGuestCookieName } from '@/infrastructure/auth/guest-jwt';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { LeaveRoomResponse } from '../types/room.types';

const leaveSchema = z.object({
  roomCode: roomCodeSchema,
});

export async function leaveRoomAction(input: {
  roomCode: string;
}): Promise<ActionResult<LeaveRoomResponse>> {
  const correlationId = await getCorrelationId();

  try {
    const parsed = leaveSchema.parse(input);
    const ctx = await getAuthContext(parsed.roomCode);

    const result = await roomService.leaveRoom(parsed.roomCode, ctx);
    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    const cookieStore = await cookies();
    cookieStore.delete(getGuestCookieName(parsed.roomCode));

    return {
      success: true,
      data: result.value,
    };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
