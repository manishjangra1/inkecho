import { NextResponse } from 'next/server';
import { adminService } from '@/features/admin/services/admin.service';
import { reviewReportSchema } from '@/features/admin/schemas/review-report.schema';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = await getCorrelationId();

  try {
    const { id } = await params;
    const ctx = await getAuthContext();

    const res = await adminService.getReportById(id, ctx);
    if (!res.ok) {
      return handleApiError(res.error, correlationId);
    }

    return NextResponse.json({ success: true, data: res.value });
  } catch (err) {
    return handleApiError(err, correlationId);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = await getCorrelationId();

  try {
    const { id } = await params;
    const body = await request.json();
    const input = reviewReportSchema.parse({
      ...body,
      reportId: id,
    });

    const ctx = await getAuthContext();
    const res = await adminService.reviewReport(input, ctx);

    if (!res.ok) {
      return handleApiError(res.error, correlationId);
    }

    return NextResponse.json({ success: true, data: res.value });
  } catch (err) {
    return handleApiError(err, correlationId);
  }
}
