import { NextResponse } from 'next/server';
import { revealService } from '@/features/reveal/services/reveal.service';
import { voteChainSchema } from '@/features/reveal/schemas/vote-chain.schema';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const correlationId = await getCorrelationId();

  try {
    const { code } = await params;
    const body = await request.json();
    const input = voteChainSchema.parse({
      ...body,
      roomCode: code.toUpperCase(),
    });

    const ctx = await getAuthContext();
    const res = await revealService.voteChain(input, ctx);

    if (!res.ok) {
      return handleApiError(res.error, correlationId);
    }

    return NextResponse.json({ data: res.value });
  } catch (err) {
    return handleApiError(err, correlationId);
  }
}
