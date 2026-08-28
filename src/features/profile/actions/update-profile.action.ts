'use server';

import { updateProfileSchema, type UpdateProfileInput } from '../schemas/update-profile.schema';
import { profileService } from '../services/profile.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { UserProfileDto } from '@/infrastructure/db/mappers/user.mapper';

export async function updateProfileAction(
  rawInput: UpdateProfileInput
): Promise<ActionResult<UserProfileDto>> {
  const correlationId = await getCorrelationId();

  try {
    const input = updateProfileSchema.parse(rawInput);
    const ctx = await getAuthContext();

    const result = await profileService.updateProfile(input, ctx);
    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    return { success: true, data: result.value, correlationId };
  } catch (err) {
    return handleActionError(err, correlationId);
  }
}
