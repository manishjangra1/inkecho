'use server';

import { voteChainSchema, type VoteChainInput } from '../schemas/vote-chain.schema';
import { revealService } from '../services/reveal.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { VoteChainResponse } from '../types/reveal.types';

export async function voteChainAction(
  rawInput: VoteChainInput
): Promise<ActionResult<VoteChainResponse>> {
  const correlationId = await getCorrelationId();

  try {
    const input = voteChainSchema.parse(rawInput);
    const ctx = await getAuthContext(input.roomCode);

    const result = await revealService.voteChain(input, ctx);
    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    return { success: true, data: result.value, correlationId };
  } catch (err) {
    return handleActionError(err, correlationId);
  }
}
