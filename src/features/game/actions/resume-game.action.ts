'use server';

import { z } from 'zod';
import { gameService } from '../services/game.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import { roomCodeSchema } from '@/shared/lib/validation/schemas';
import type { ActionResult } from '@/shared/types/api.types';
import type { ResumeGameResponse } from '../types/game.types';

const resumeGameSchema = z.object({
  roomCode: roomCodeSchema,
});

export async function resumeGameAction(
  input: z.infer<typeof resumeGameSchema>
): Promise<ActionResult<ResumeGameResponse>> {
  const correlationId = await getCorrelationId();

  try {
    const validated = resumeGameSchema.parse(input);
    const ctx = await getAuthContext(validated.roomCode);
    const result = await gameService.resumeGame(validated.roomCode, ctx);

    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    return { success: true, data: result.value, correlationId };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
