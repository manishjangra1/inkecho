import { NextResponse, type NextRequest } from 'next/server';
import { roomService } from '@/features/rooms/services/room.service';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import { GUEST_COOKIE_NAME } from '@/infrastructure/auth/guest-jwt';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const correlationId = await getCorrelationId();

  try {
    const { code } = await params;
    const ctx = await getAuthContext();

    const result = await roomService.leaveRoom(code, ctx);
    if (!result.ok) {
      return handleApiError(result.error, correlationId);
    }

    const response = NextResponse.json({ success: true, data: result.value }, { status: 200 });
    response.cookies.delete(GUEST_COOKIE_NAME);

    return response;
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}
