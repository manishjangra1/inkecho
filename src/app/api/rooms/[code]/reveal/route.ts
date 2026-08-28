import { NextResponse } from 'next/server';
import { revealService } from '@/features/reveal/services/reveal.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const correlationId = await getCorrelationId();

  try {
    const { code } = await params;
    const ctx = await getAuthContext();

    const res = await revealService.getRevealData(code.toUpperCase(), ctx);
    if (!res.ok) {
      return handleApiError(res.error, correlationId);
    }

    return NextResponse.json({ success: true, data: res.value });
  } catch (err) {
    return handleApiError(err, correlationId);
  }
}
