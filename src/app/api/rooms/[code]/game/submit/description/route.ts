import { NextResponse } from 'next/server';
import { gameService } from '@/features/game/services/game.service';
import { submitDescriptionSchema } from '@/features/game/schemas/submit-description.schema';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';

export async function POST(request: Request) {
  const correlationId = await getCorrelationId();

  try {
    const body = await request.json();
    const validated = submitDescriptionSchema.parse(body);
    const ctx = await getAuthContext();

    const submitRes = await gameService.submitDescription(validated, ctx);
    if (!submitRes.ok) {
      return handleApiError(submitRes.error, correlationId);
    }

    return NextResponse.json({
      success: true,
      data: submitRes.value,
    });
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}
