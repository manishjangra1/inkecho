import { NextResponse } from 'next/server';
import { revealService } from '@/features/reveal/services/reveal.service';
import { rematchSchema } from '@/features/reveal/schemas/rematch.schema';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';

export async function POST(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const correlationId = await getCorrelationId();

  try {
    const { code } = await params;
    const input = rematchSchema.parse({
      roomCode: code.toUpperCase(),
    });

    const ctx = await getAuthContext();
    const res = await revealService.rematch(input, ctx);

    if (!res.ok) {
      return handleApiError(res.error, correlationId);
    }

    return NextResponse.json({ data: res.value });
  } catch (err) {
    return handleApiError(err, correlationId);
  }
}
