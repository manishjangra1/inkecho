import { NextResponse, type NextRequest } from 'next/server';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { roomService } from '@/features/rooms/services/room.service';
import { updateRoomSettingsSchema } from '@/features/rooms/schemas/room-settings.schema';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const correlationId = await getCorrelationId();

  try {
    const { code } = await params;
    const result = await roomRepository.findByCode(code);
    if (!result.ok) {
      return handleApiError(result.error, correlationId);
    }

    return NextResponse.json({ success: true, data: result.value }, { status: 200 });
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const correlationId = await getCorrelationId();

  try {
    const { code } = await params;
    const body = await request.json();
    const parsed = updateRoomSettingsSchema.parse({ ...body, roomCode: code });
    const ctx = await getAuthContext();

    const result = await roomService.updateSettings(parsed, ctx);
    if (!result.ok) {
      return handleApiError(result.error, correlationId);
    }

    return NextResponse.json({ success: true, data: result.value }, { status: 200 });
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const correlationId = await getCorrelationId();

  try {
    const { code } = await params;
    const ctx = await getAuthContext();

    const result = await roomService.closeRoom(code, ctx);
    if (!result.ok) {
      return handleApiError(result.error, correlationId);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, correlationId);
  }
}
