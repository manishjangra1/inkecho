import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { uuidSchema } from '@/shared/lib/validation/schemas';
import { lobbyService } from '@/features/lobby/services/lobby.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';

const kickSchema = z.object({
  playerId: uuidSchema,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const correlationId = await getCorrelationId();

  try {
    const { code } = await params;
    const body = await request.json();
    const parsed = kickSchema.parse(body);
    const ctx = await getAuthContext();

    const result = await lobbyService.kickPlayer(code, parsed.playerId, ctx);
    if (!result.ok) {
      return handleApiError(result.error, correlationId);
    }

    return NextResponse.json({ success: true, data: result.value }, { status: 200 });
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}
