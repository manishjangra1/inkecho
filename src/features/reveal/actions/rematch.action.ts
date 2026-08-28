'use server';

import { rematchSchema, type RematchInput } from '../schemas/rematch.schema';
import { revealService } from '../services/reveal.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { RematchResponse } from '../types/reveal.types';

export async function rematchAction(
  rawInput: RematchInput
): Promise<ActionResult<RematchResponse>> {
  const correlationId = await getCorrelationId();

  try {
    const input = rematchSchema.parse(rawInput);
    const ctx = await getAuthContext();

    const result = await revealService.rematch(input, ctx);
    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    return { success: true, data: result.value, correlationId };
  } catch (err) {
    return handleActionError(err, correlationId);
  }
}
