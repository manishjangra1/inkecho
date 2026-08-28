'use server';

import { createReportSchema, type CreateReportInput } from '../schemas/create-report.schema';
import { reportRepository } from '@/infrastructure/db/repositories/report.repository';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import { ForbiddenError } from '@/shared/lib/errors/app-error';
import type { ActionResult } from '@/shared/types/api.types';

export async function createReportAction(
  rawInput: CreateReportInput
): Promise<ActionResult<{ reportId: string }>> {
  const correlationId = await getCorrelationId();

  try {
    const input = createReportSchema.parse(rawInput);
    const ctx = await getAuthContext();

    if (ctx.type === 'anonymous') {
      return handleActionError(
        new ForbiddenError('NOT_IN_ROOM', 'Must have an active player session to submit reports.'),
        correlationId
      );
    }

    const reporterPlayerId = ctx.playerId || 'anonymous-player';
    const reporterUserId = ctx.type === 'registered' ? ctx.userId : null;

    const res = await reportRepository.create({
      reporterPlayerId,
      reporterUserId,
      targetType: input.targetType,
      targetId: input.targetId,
      gameId: input.gameId,
      reason: input.reason,
      notes: input.notes,
    });

    if (!res.ok) {
      return handleActionError(res.error, correlationId);
    }

    return { success: true, data: { reportId: res.value.id }, correlationId };
  } catch (err) {
    return handleActionError(err, correlationId);
  }
}
