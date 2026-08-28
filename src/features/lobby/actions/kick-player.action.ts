'use server';

import { z } from 'zod';
import { roomCodeSchema, uuidSchema } from '@/shared/lib/validation/schemas';
import { lobbyService } from '../services/lobby.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';

const kickPlayerSchema = z.object({
  roomCode: roomCodeSchema,
  playerId: uuidSchema,
});

export async function kickPlayerAction(input: {
  roomCode: string;
  playerId: string;
}): Promise<ActionResult<{ kickedPlayerId: string }>> {
  const correlationId = await getCorrelationId();

  try {
    const parsed = kickPlayerSchema.parse(input);
    const ctx = await getAuthContext(parsed.roomCode);

    const result = await lobbyService.kickPlayer(parsed.roomCode, parsed.playerId, ctx);
    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    return {
      success: true,
      data: result.value,
    };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
