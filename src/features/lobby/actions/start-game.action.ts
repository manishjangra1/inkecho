'use server';

import { z } from 'zod';
import { lobbyService } from '../services/lobby.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import { roomCodeSchema } from '@/shared/lib/validation/schemas';
import type { ActionResult } from '@/shared/types/api.types';
import type { StartGameResponse } from '@/features/game/types/game.types';

const startGameSchema = z.object({
  roomCode: roomCodeSchema,
});

export async function startGameAction(
  input: z.infer<typeof startGameSchema>
): Promise<ActionResult<StartGameResponse>> {
  const correlationId = await getCorrelationId();

  try {
    const validated = startGameSchema.parse(input);
    const ctx = await getAuthContext();
    const result = await lobbyService.startGame(validated.roomCode, ctx);

    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    return { success: true, data: result.value, correlationId };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
