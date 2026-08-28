'use server';

import { submitDrawingSchema, type SubmitDrawingSchema } from '../schemas/submit-drawing.schema';
import { gameService } from '../services/game.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { SubmitDrawingResponse } from '../types/game.types';

export async function submitDrawingAction(
  input: SubmitDrawingSchema
): Promise<ActionResult<SubmitDrawingResponse>> {
  const correlationId = await getCorrelationId();

  try {
    const validated = submitDrawingSchema.parse(input);
    const ctx = await getAuthContext(validated.roomCode);
    const result = await gameService.submitDrawing(validated, ctx);

    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    return { success: true, data: result.value, correlationId };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
