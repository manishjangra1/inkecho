'use server';

import { z } from 'zod';
import { roomCodeSchema } from '@/shared/lib/validation/schemas';
import { lobbyService } from '../services/lobby.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { ParticipantDto } from '@/infrastructure/db/mappers/participant.mapper';

const toggleReadySchema = z.object({
  roomCode: roomCodeSchema,
  isReady: z.boolean(),
});

export async function toggleReadyAction(
  input: { roomCode: string; isReady: boolean }
): Promise<
  ActionResult<{
    playerId: string;
    isReady: boolean;
    participant: ParticipantDto;
  }>
> {
  const correlationId = await getCorrelationId();

  try {
    const parsed = toggleReadySchema.parse(input);
    const ctx = await getAuthContext();

    const result = await lobbyService.toggleReady(parsed.roomCode, parsed.isReady, ctx);
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
