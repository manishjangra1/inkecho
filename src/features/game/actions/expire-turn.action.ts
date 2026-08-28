'use server';

import { z } from 'zod';
import { gameService } from '../services/game.service';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';

const expireTurnSchema = z.object({
  roomCode: z.string().min(1),
  expectedVersion: z.number().int().positive().optional(),
});

export type ExpireTurnSchema = z.infer<typeof expireTurnSchema>;

export async function expireTurnAction(
  input: ExpireTurnSchema
): Promise<ActionResult<{ version: number; gameStatus: string }>> {
  const correlationId = await getCorrelationId();

  try {
    const validated = expireTurnSchema.parse(input);
    const result = await gameService.expireTurn(validated.roomCode, validated.expectedVersion);

    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    return { success: true, data: result.value, correlationId };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
