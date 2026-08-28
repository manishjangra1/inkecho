'use server';

import { z } from 'zod';
import { roomCodeSchema, uuidSchema } from '@/shared/lib/validation/schemas';
import { lobbyService } from '../services/lobby.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { RoomSnapshotDto } from '@/infrastructure/db/mappers/room.mapper';

const transferHostSchema = z.object({
  roomCode: roomCodeSchema,
  newHostPlayerId: uuidSchema,
});

export async function transferHostAction(input: {
  roomCode: string;
  newHostPlayerId: string;
}): Promise<ActionResult<RoomSnapshotDto>> {
  const correlationId = await getCorrelationId();

  try {
    const parsed = transferHostSchema.parse(input);
    const ctx = await getAuthContext();

    const result = await lobbyService.transferHost(parsed.roomCode, parsed.newHostPlayerId, ctx);
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
