import { NextResponse } from 'next/server';
import { createReportSchema } from '@/features/admin/schemas/create-report.schema';
import { reportRepository } from '@/infrastructure/db/repositories/report.repository';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import { ForbiddenError } from '@/shared/lib/errors/app-error';

export async function POST(request: Request) {
  const correlationId = await getCorrelationId();

  try {
    const body = await request.json();
    const input = createReportSchema.parse(body);
    const ctx = await getAuthContext();

    if (ctx.type === 'anonymous') {
      return handleApiError(
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
      return handleApiError(res.error, correlationId);
    }

    return NextResponse.json({ data: { reportId: res.value.id } }, { status: 201 });
  } catch (err) {
    return handleApiError(err, correlationId);
  }
}
