import { NextResponse } from 'next/server';
import { profileService } from '@/features/profile/services/profile.service';
import { updateProfileSchema } from '@/features/profile/schemas/update-profile.schema';
import { getAuthContext } from '@/infrastructure/auth/session';
import { handleApiError } from '@/shared/lib/errors/handle-api-error';
import { getCorrelationId } from '@/infrastructure/monitoring/request-context';

export async function GET() {
  const correlationId = await getCorrelationId();

  try {
    const ctx = await getAuthContext();
    const res = await profileService.getProfile(ctx);

    if (!res.ok) {
      return handleApiError(res.error, correlationId);
    }

    return NextResponse.json({ success: true, data: res.value });
  } catch (err) {
    return handleApiError(err, correlationId);
  }
}

export async function PATCH(request: Request) {
  const correlationId = await getCorrelationId();

  try {
    const body = await request.json();
    const input = updateProfileSchema.parse(body);
    const ctx = await getAuthContext();

    const res = await profileService.updateProfile(input, ctx);
    if (!res.ok) {
      return handleApiError(res.error, correlationId);
    }

    return NextResponse.json({ success: true, data: res.value });
  } catch (err) {
    return handleApiError(err, correlationId);
  }
}
