'use server';

import { banUserSchema, type BanUserInput } from '../schemas/ban-user.schema';
import { adminService } from '../services/admin.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';

export async function banUserAction(
  rawInput: BanUserInput
): Promise<ActionResult<{ bannedUntil: string | null; permanent: boolean }>> {
  const correlationId = await getCorrelationId();

  try {
    const input = banUserSchema.parse(rawInput);
    const ctx = await getAuthContext();

    const result = await adminService.banUser(input, ctx);
    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    return { success: true, data: result.value, correlationId };
  } catch (err) {
    return handleActionError(err, correlationId);
  }
}
