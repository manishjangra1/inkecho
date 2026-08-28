'use server';

import {
  updateRoomSettingsSchema,
  type UpdateRoomSettingsInput,
} from '../schemas/room-settings.schema';
import { roomService } from '../services/room.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { RoomSnapshotDto } from '../types/room.types';

export async function updateRoomSettingsAction(
  input: UpdateRoomSettingsInput
): Promise<ActionResult<RoomSnapshotDto>> {
  const correlationId = await getCorrelationId();

  try {
    const parsed = updateRoomSettingsSchema.parse(input);
    const ctx = await getAuthContext(parsed.roomCode);

    const result = await roomService.updateSettings(parsed, ctx);
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
