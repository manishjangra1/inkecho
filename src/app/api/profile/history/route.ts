import { NextResponse } from 'next/server';
import { profileService } from '@/features/profile/services/profile.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';

export async function GET(request: Request) {
  const correlationId = await getCorrelationId();

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    const ctx = await getAuthContext();
    const res = await profileService.getGameHistory(page, limit, ctx);

    if (!res.ok) {
      return handleApiError(res.error, correlationId);
    }

    return NextResponse.json({ success: true, data: res.value });
  } catch (err) {
    return handleApiError(err, correlationId);
  }
}
