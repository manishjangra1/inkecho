import { NextResponse } from 'next/server';
import { gameService } from '@/features/game/services/game.service';
import { roomRepository } from '@/infrastructure/db/repositories/room.repository';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';
import {
  NotFoundError,
  ValidationError,
  PayloadTooLargeError,
} from '@/shared/lib/errors/app-error';
import { CANVAS_CONFIG } from '@/shared/config/canvas.config';

export async function POST(request: Request, props: { params: Promise<{ code: string }> }) {
  const correlationId = await getCorrelationId();
  const params = await props.params;
  const roomCode = params.code.toUpperCase();

  try {
    const roomRes = await roomRepository.findByCode(roomCode);
    if (!roomRes.ok) {
      return handleApiError(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'), correlationId);
    }

    const room = roomRes.value;
    const ctx = await getAuthContext();
    const contentType = request.headers.get('content-type') || '';

    let imageBuffer: Buffer | undefined;
    let imageDataUrl: string | undefined;
    let expectedVersion: number;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('image') as File | null;
      const expectedVersionRaw = formData.get('expectedVersion');

      if (!file) {
        return handleApiError(new ValidationError('An image file is required.'), correlationId);
      }

      if (file.size > CANVAS_CONFIG.EXPORT.MAX_UPLOAD_SIZE_BYTES) {
        return handleApiError(
          new PayloadTooLargeError(
            `Drawing upload exceeds maximum size of ${CANVAS_CONFIG.EXPORT.MAX_UPLOAD_SIZE_BYTES / 1024 / 1024}MB.`
          ),
          correlationId
        );
      }

      const rawVersionNum = Number(expectedVersionRaw);
      if (!rawVersionNum || rawVersionNum < 1 || !Number.isInteger(rawVersionNum)) {
        return handleApiError(
          new ValidationError('expectedVersion must be a positive integer.'),
          correlationId
        );
      }

      expectedVersion = rawVersionNum;
      const arrayBuffer = await file.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else {
      // JSON body format
      const body = await request.json();
      imageDataUrl = body.imageDataUrl || body.imageBase64;
      expectedVersion = Number(body.expectedVersion);

      if (!imageDataUrl) {
        return handleApiError(
          new ValidationError('Image data URL or base64 is required.'),
          correlationId
        );
      }

      if (!expectedVersion || expectedVersion < 1) {
        return handleApiError(
          new ValidationError('expectedVersion must be a positive integer.'),
          correlationId
        );
      }
    }

    const submitRes = await gameService.submitDrawing(
      {
        roomCode,
        roomId: room.id,
        expectedVersion,
        imageBuffer,
        imageDataUrl,
      },
      ctx
    );

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
