'use server';

import {
  submitDescriptionSchema,
  type SubmitDescriptionSchema,
} from '../schemas/submit-description.schema';
import { gameService } from '../services/game.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { SubmitDescriptionResponse } from '../types/game.types';

export async function submitDescriptionAction(
  input: SubmitDescriptionSchema
): Promise<ActionResult<SubmitDescriptionResponse>> {
  const correlationId = await getCorrelationId();

  try {
    const validated = submitDescriptionSchema.parse(input);
    const ctx = await getAuthContext();
    const result = await gameService.submitDescription(validated, ctx);

    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    return { success: true, data: result.value, correlationId };
  } catch (error) {
    return handleActionError(error, correlationId);
  }
}
