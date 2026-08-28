import { NextResponse } from 'next/server';
import { adminService } from '@/features/admin/services/admin.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';

export async function GET() {
  const correlationId = await getCorrelationId();

  try {
    const ctx = await getAuthContext();
    const res = await adminService.getAnalytics(ctx);

    if (!res.ok) {
      return handleApiError(res.error, correlationId);
    }

    return NextResponse.json({ success: true, data: res.value });
  } catch (err) {
    return handleApiError(err, correlationId);
  }
}
