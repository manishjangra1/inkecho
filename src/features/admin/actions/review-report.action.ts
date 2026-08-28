'use server';

import { reviewReportSchema, type ReviewReportInput } from '../schemas/review-report.schema';
import { adminService } from '../services/admin.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleActionError } from '@/shared/lib/errors/handle-action-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import type { ActionResult } from '@/shared/types/api.types';
import type { ReportItemDto } from '@/infrastructure/db/repositories/report.repository';

export async function reviewReportAction(
  rawInput: ReviewReportInput
): Promise<ActionResult<ReportItemDto>> {
  const correlationId = await getCorrelationId();

  try {
    const input = reviewReportSchema.parse(rawInput);
    const ctx = await getAuthContext();

    const result = await adminService.reviewReport(input, ctx);
    if (!result.ok) {
      return handleActionError(result.error, correlationId);
    }

    return { success: true, data: result.value, correlationId };
  } catch (err) {
    return handleActionError(err, correlationId);
  }
}
